import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import RiwayatRowActions from "./RiwayatRowActions";
import RiwayatSortSelect from "./RiwayatSortSelect";
import KasirFilterSelect from "./KasirFilterSelect";
import PaymentFilterSelect from "./PaymentFilterSelect";

export default async function RiwayatPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    kasirId?: string;
    payment?: string;
    q?: string;
  }>;
}) {
  const { locale } = await params;
  const { page, sort, kasirId, payment, q } = await searchParams;

  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  const isAdmin = session.role === "admin";

  const t = await getTranslations({ locale, namespace: "riwayat" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = 4;

  const currentSort = ["newest", "oldest", "total-high", "total-low"].includes(
    sort ?? ""
  )
    ? sort!
    : "newest";

  const orderBy =
    currentSort === "oldest"
      ? { createdAt: "asc" as const }
      : currentSort === "total-high"
        ? { total: "desc" as const }
        : currentSort === "total-low"
          ? { total: "asc" as const }
          : { createdAt: "desc" as const };

  // Filter: kasir hanya lihat transaksinya sendiri
  // Admin bisa filter per kasir tertentu via ?kasirId=xxx
  // ?q= mencari berdasarkan nomor transaksi atau username kasir
  const searchFilter = q
    ? {
        OR: [
          { transactionNumber: { contains: q, mode: "insensitive" as const } },
          { user: { username: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const baseFilter = isAdmin
    ? kasirId
      ? { userId: kasirId }
      : {}
    : { userId: session.userId };

  const validPayment = payment === "cash" || payment === "transfer" ? payment : undefined;
  const paymentFilter: Prisma.TransactionWhereInput = validPayment ? { paymentMethod: validPayment as any } : {};

  const whereClause: Prisma.TransactionWhereInput = { ...baseFilter, ...searchFilter, ...paymentFilter };

  const [totalCount, totalRevenue, cashRevenue, transferRevenue, transactions, allKasirs] =
    await Promise.all([
      prisma.transaction.count({ where: whereClause }),
      isAdmin
        ? prisma.transaction.aggregate({
          _sum: { total: true },
          where: whereClause,
        })
        : Promise.resolve({ _sum: { total: 0 } }),
      prisma.transaction.aggregate({
        _sum: { total: true },
        where: { ...baseFilter, ...searchFilter, paymentMethod: "cash" },
      }),
      prisma.transaction.aggregate({
        _sum: { total: true },
        where: { ...baseFilter, ...searchFilter, paymentMethod: "transfer" },
      }),
      prisma.transaction.findMany({
        where: whereClause,
        orderBy,
        skip: (currentPage - 1) * perPage,
        take: perPage,
      }),
      isAdmin
        ? prisma.user.findMany({
          select: { id: true, username: true, role: true },
          orderBy: { username: "asc" },
        })
        : Promise.resolve([]),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const revenue = Number(totalRevenue?._sum?.total ?? 0);
  const cashSum = Number(cashRevenue?._sum?.total ?? 0);
  const transferSum = Number(transferRevenue?._sum?.total ?? 0);

  function buildQuery({
    page: pageNumber = currentPage,
    sort: sortValue = currentSort,
    kasirId: kid = kasirId,
    payment: payVal = payment,
  }: {
    page?: number;
    sort?: string;
    kasirId?: string;
    payment?: string;
  } = {}) {
    const p = new URLSearchParams();
    if (sortValue !== "newest") p.set("sort", sortValue);
    if (pageNumber > 1) p.set("page", String(pageNumber));
    if (kid) p.set("kasirId", kid);
    if (payVal) p.set("payment", payVal);
    const query = p.toString();
    return query ? `?${query}` : "";
  }

  const selectedKasirName = kasirId
    ? allKasirs.find((u) => u.id === kasirId)?.username
    : undefined;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">{t("title")}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {isAdmin
              ? "Kelola dan lihat seluruh riwayat transaksi"
              : "Riwayat transaksi Anda"}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 hover:bg-neutral-50"
            >
              Filter Tanggal
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-primary-700 text-white text-sm hover:bg-primary-800"
            >
              Export
            </button>
          </div>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Total Transaksi</p>
          <p className="text-2xl font-bold text-primary-800 mt-1">
            {totalCount}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Total Pendapatan</p>
          <p className="text-2xl font-bold text-primary-800 mt-1">
            {tc("currencyPrefix")} {revenue.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Masuk Tunai</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {tc("currencyPrefix")} {cashSum.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-sm text-neutral-500">Masuk Transfer</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {tc("currencyPrefix")} {transferSum.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-primary-800">
              {isAdmin && selectedKasirName
                ? `Transaksi — ${selectedKasirName}`
                : isAdmin
                  ? "Daftar Transaksi"
                  : "Transaksi Saya"}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {isAdmin
                ? "Semua transaksi yang tersimpan di database"
                : "Hanya transaksi yang Anda buat"}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* FILTER KASIR, admin only */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 whitespace-nowrap">
                  Kasir:
                </span>
                <KasirFilterSelect
                  allKasirs={allKasirs}
                  currentKasirId={kasirId}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 whitespace-nowrap">
                Pembayaran:
              </span>
              <PaymentFilterSelect value={payment} />
            </div>

            <RiwayatSortSelect value={currentSort} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-neutral-500">
                <th className="px-5 py-3 font-medium">No. Transaksi</th>
                {isAdmin && (
                  <th className="px-5 py-3 font-medium">Kasir</th>
                )}
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Pembayaran</th>
                <th className="px-5 py-3 font-medium">Tanggal</th>
                <th className="px-5 py-3 font-medium text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="px-5 py-12 text-center text-neutral-400"
                  >
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const statusClass =
                    tx.status === "completed"
                      ? "text-green-600"
                      : tx.status === "cancelled"
                        ? "text-red-600"
                        : "text-secondary-600";

                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                    >
                      {/* NOMOR TRANSAKSI */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-primary-800">
                          {tx.transactionNumber}
                        </div>
                        <div className={`text-xs mt-1 capitalize ${statusClass}`}>
                          {tx.status === "completed"
                            ? t("status_completed")
                            : tx.status === "cancelled"
                              ? t("status_cancelled")
                              : t("status_returned")}
                        </div>
                      </td>

                      {/* KASIR, admin only */}
                      {isAdmin && (
                        <td className="px-5 py-4 text-neutral-600">
                          -
                        </td>
                      )}

                      {/* TOTAL */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-primary-800">
                          {tc("currencyPrefix")}{" "}
                          {Number(tx.total).toLocaleString("id-ID")}
                        </span>
                      </td>

                      {/* PEMBAYARAN */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                          {tx.paymentMethod === "cash" ? t("paymentMethodCash") : t("paymentMethodTransfer")}
                        </span>
                      </td>

                      {/* TANGGAL */}
                      <td className="px-5 py-4 text-neutral-500">
                        {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        <div className="text-xs text-neutral-400 mt-0.5">
                          {new Date(tx.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* AKSI */}
                      <td className="px-5 py-4">
                        <div className="flex justify-center">
                          <RiwayatRowActions
                            locale={locale}
                            transactionId={tx.id}
                            status={tx.status}
                            isAdmin={isAdmin}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              Halaman {currentPage} dari {totalPages}
            </p>

            <div className="flex items-center gap-2">
              {/* PREVIOUS */}
              {currentPage > 1 ? (
                <Link
                  href={buildQuery({ page: currentPage - 1 })}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
                >
                  Sebelumnya
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg border border-neutral-100 text-sm text-neutral-300">
                  Sebelumnya
                </span>
              )}

              {/* PAGE NUMBERS */}
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={buildQuery({ page: pageNumber })}
                    className={`min-w-8 h-8 px-2 rounded-lg flex items-center justify-center text-sm ${pageNumber === currentPage
                        ? "bg-primary-700 text-white"
                        : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      }`}
                  >
                    {pageNumber}
                  </Link>
                )
              )}

              {/* NEXT */}
              {currentPage < totalPages ? (
                <Link
                  href={buildQuery({ page: currentPage + 1 })}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
                >
                  Berikutnya
                </Link>
              ) : (
                <span className="px-3 py-1.5 rounded-lg border border-neutral-100 text-sm text-neutral-300">
                  Berikutnya
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}