import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

const PER_PAGE = 4;

function parseRange(from?: string, to?: string) {
  const now = new Date();

  const start = from
    ? new Date(`${from}T00:00:00`)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const end = to
    ? new Date(`${to}T23:59:59.999`)
    : new Date(now);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
}

function getDaysBetween(start: Date, end: Date) {
  const days: Date[] = [];

  const current = new Date(start);
  current.setHours(0, 0, 0, 0);

  const last = new Date(end);
  last.setHours(0, 0, 0, 0);

  while (current <= last) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export default async function LaporanPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
    tab?: string;
    page?: string;
  }>;
}) {
  const { locale } = await params;

  const {
    from,
    to,
    tab = "penjualan",
    page,
  } = await searchParams;

  const t = await getTranslations({
    locale,
    namespace: "laporan",
  });

  const tc = await getTranslations({
    locale,
    namespace: "common",
  });

  const { start, end } = parseRange(from, to);

  const currentPage = Math.max(1, Number(page) || 1);

  /*
   * ==========================================================
   * TRANSAKSI
   * ==========================================================
   */

  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
      status: "completed",
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  /*
   * ==========================================================
   * RINGKASAN PER HARI
   * ==========================================================
   */

  const dailyMap = new Map<
    string,
    {
      date: Date;
      transactions: number;
      items: number;
      revenue: number;
    }
  >();

  for (const transaction of transactions) {
    const date = new Date(transaction.createdAt);

    date.setHours(0, 0, 0, 0);

    const key = date.toISOString().slice(0, 10);

    const itemsSold = transaction.items.reduce(
      (total, item) => total + Number(item.qty),
      0
    );

    const revenue = Number(transaction.total);

    const existing = dailyMap.get(key);

    if (existing) {
      existing.transactions += 1;
      existing.items += itemsSold;
      existing.revenue += revenue;
    } else {
      dailyMap.set(key, {
        date,
        transactions: 1,
        items: itemsSold,
        revenue,
      });
    }
  }

  /*
   * ==========================================================
   * DATA HARI
   * ==========================================================
   */

  const dailySales = getDaysBetween(start, end).map((date) => {
    const key = date.toISOString().slice(0, 10);

    return (
      dailyMap.get(key) ?? {
        date,
        transactions: 0,
        items: 0,
        revenue: 0,
      }
    );
  });

  /*
   * ==========================================================
   * PAGINATION
   * ==========================================================
   */

  const totalEntries = dailySales.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalEntries / PER_PAGE)
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const pageRows = dailySales
    .slice(
      (safePage - 1) * PER_PAGE,
      safePage * PER_PAGE
    )
    .reverse();

  /*
   * ==========================================================
   * GRAFIK
   * ==========================================================
   */

  const maxRevenue = Math.max(
    ...dailySales.map((item) => item.revenue),
    1
  );

  /*
   * ==========================================================
   * URL
   * ==========================================================
   */

  function buildQuery({
    tab: nextTab = tab,
    page: nextPage = 1,
  }: {
    tab?: string;
    page?: number;
  } = {}) {
    const params = new URLSearchParams();

    if (from) {
      params.set("from", from);
    }

    if (to) {
      params.set("to", to);
    }

    if (nextTab !== "penjualan") {
      params.set("tab", nextTab);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const query = params.toString();

    return query ? `?${query}` : "";
  }

  /*
   * ==========================================================
   * DATA STOK
   * ==========================================================
   */

  const lowStock = await prisma.product.findMany({
    where: {
      status: "active",
      stock: {
        lte: 5,
      },
    },
    orderBy: {
      stock: "asc",
    },
  });

  /*
   * ==========================================================
   * DATA EXPIRED
   * ==========================================================
   */

  const now = new Date();

  const sevenDaysLater = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000
  );

  const [expired, expiringSoon] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "active",
        expiredDate: {
          lt: now,
        },
      },
      orderBy: {
        expiredDate: "asc",
      },
    }),

    prisma.product.findMany({
      where: {
        status: "active",
        expiredDate: {
          gte: now,
          lte: sevenDaysLater,
        },
      },
      orderBy: {
        expiredDate: "asc",
      },
    }),
  ]);

  const fromValue = start.toISOString().slice(0, 10);
  const toValue = end.toISOString().slice(0, 10);

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-primary-800">
          {t("title")}
        </h1>

        <p className="text-sm text-neutral-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* =====================================================
          TAB + FILTER
          ===================================================== */}

      <div className="bg-white border border-neutral-300 rounded-xl overflow-hidden">
        {/* TABS */}
        <div className="border-b border-neutral-300">
          <div className="flex">
            <Link
              href={buildQuery({
                tab: "penjualan",
                page: 1,
              })}
              className={`px-5 py-4 text-sm font-semibold border-b-2 ${
                tab === "penjualan"
                  ? "text-primary-800 border-primary-800"
                  : "text-neutral-500 border-transparent"
              }`}
            >
              Penjualan
            </Link>

            <Link
              href={buildQuery({
                tab: "stok",
                page: 1,
              })}
              className={`px-5 py-4 text-sm font-semibold border-b-2 ${
                tab === "stok"
                  ? "text-primary-800 border-primary-800"
                  : "text-neutral-500 border-transparent"
              }`}
            >
              Stok Rendah
            </Link>

            <Link
              href={buildQuery({
                tab: "kedaluwarsa",
                page: 1,
              })}
              className={`px-5 py-4 text-sm font-semibold border-b-2 ${
                tab === "kedaluwarsa"
                  ? "text-primary-800 border-primary-800"
                  : "text-neutral-500 border-transparent"
              }`}
            >
              Kedaluwarsa
            </Link>
          </div>
        </div>

        {/* FILTER */}
        <div className="px-4 py-3.5">
          <form
            method="get"
            className="flex items-center gap-3"
          >
            <input
              type="hidden"
              name="tab"
              value={tab}
            />

            <span className="text-sm font-semibold text-neutral-600">
              Periode:
            </span>

            <div className="h-10 flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
              <div className="flex items-center px-3">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-neutral-500 mr-2"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                  />
                  <line
                    x1="16"
                    y1="2"
                    x2="16"
                    y2="6"
                  />
                  <line
                    x1="8"
                    y1="2"
                    x2="8"
                    y2="6"
                  />
                  <line
                    x1="3"
                    y1="10"
                    x2="21"
                    y2="10"
                  />
                </svg>

                <input
                  type="date"
                  name="from"
                  defaultValue={fromValue}
                  className="text-sm text-neutral-700 outline-none bg-transparent"
                />
              </div>

              <span className="text-neutral-400">
                -
              </span>

              <div className="px-3">
                <input
                  type="date"
                  name="to"
                  defaultValue={toValue}
                  className="text-sm text-neutral-700 outline-none bg-transparent"
                />
              </div>

              <span className="px-3 text-neutral-400">
                ▾
              </span>
            </div>

            <button
              type="submit"
              className="h-10 bg-primary-700 text-white text-sm font-semibold px-4 rounded-lg hover:bg-primary-800 flex items-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>

              Terapkan Filter
            </button>
          </form>
        </div>
      </div>

      {/* =====================================================
          PENJUALAN
          ===================================================== */}

      {tab === "penjualan" && (
        <>
          {/* TREN PENJUALAN */}
          <div className="bg-white border border-neutral-300 rounded-xl p-5">
            <h2 className="text-lg font-bold text-primary-800 mb-5">
              Tren Penjualan
            </h2>

            <div className="h-[274px] border border-dashed border-neutral-300 rounded-lg bg-primary-50/40 px-5 py-5">
              {dailySales.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-neutral-400">
                  {tc("empty")}
                </div>
              ) : (
                <div className="h-full flex items-end gap-2 overflow-x-auto">
                  {dailySales.map((item) => {
                    const barHeight =
                      item.revenue > 0
                        ? Math.max(
                            8,
                            (item.revenue / maxRevenue) * 190
                          )
                        : 3;

                    return (
                      <div
                        key={item.date.toISOString()}
                        className="min-w-[32px] h-full flex flex-col items-center justify-end"
                      >
                        <div className="flex-1 w-full flex items-end justify-center">
                          <div
                            title={`${formatDate(
                              item.date
                            )}: ${tc(
                              "currencyPrefix"
                            )} ${item.revenue.toLocaleString(
                              "id-ID"
                            )}`}
                            className="w-6 bg-primary-700 rounded-t-md"
                            style={{
                              height: `${barHeight}px`,
                            }}
                          />
                        </div>

                        <span className="text-[10px] text-neutral-400 mt-2 whitespace-nowrap">
                          {formatShortDate(item.date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              RINCIAN PENJUALAN
              ================================================= */}

          <div className="bg-white border border-neutral-300 rounded-xl overflow-hidden">
            {/* TITLE */}
            <div className="px-5 py-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary-800">
                Rincian Penjualan
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 px-3 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 flex items-center gap-2"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 18v-6" />
                    <path d="M9 15l3 3 3-3" />
                  </svg>

                  Export PDF
                </button>

                <button
                  type="button"
                  className="h-9 px-3 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-50 flex items-center gap-2"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                    />
                    <path d="M8 8h8" />
                    <path d="M8 12h8" />
                    <path d="M8 16h5" />
                  </svg>

                  Export Excel
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-50 border-y border-neutral-300">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Tanggal
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Total Transaksi
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Item Terjual
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Total Pendapatan
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-12 text-center text-neutral-400"
                      >
                        Belum ada data penjualan.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row) => (
                      <tr
                        key={row.date.toISOString()}
                        className="border-b border-neutral-200 last:border-0"
                      >
                        <td className="px-5 py-3.5 text-neutral-700">
                          {formatDate(row.date)}
                        </td>

                        <td className="px-5 py-3.5 text-neutral-700">
                          {row.transactions.toLocaleString(
                            "id-ID"
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-neutral-700">
                          {row.items.toLocaleString(
                            "id-ID"
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-right font-medium text-primary-800">
                          {tc("currencyPrefix")}{" "}
                          {row.revenue.toLocaleString(
                            "id-ID"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* TOTAL */}
                {pageRows.length > 0 && (
                  <tfoot>
                    <tr className="bg-primary-50">
                      <td
                        colSpan={3}
                        className="px-5 py-3.5 font-semibold text-primary-800"
                      >
                        Total (Halaman ini)
                      </td>

                      <td className="px-5 py-3.5 text-right font-bold text-primary-800">
                        {tc("currencyPrefix")}{" "}
                        {pageRows
                          .reduce(
                            (total, row) =>
                              total + row.revenue,
                            0
                          )
                          .toLocaleString("id-ID")}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* PAGINATION */}
            <div className="px-5 py-3.5 flex items-center justify-between">
              <p className="text-xs text-neutral-500">
                Menampilkan{" "}
                {totalEntries === 0
                  ? 0
                  : (safePage - 1) * PER_PAGE + 1}
                -
                {Math.min(
                  safePage * PER_PAGE,
                  totalEntries
                )}{" "}
                dari {totalEntries} entri
              </p>

              <div className="flex items-center gap-1">
                {/* PREVIOUS */}
                {safePage > 1 ? (
                  <Link
                    href={buildQuery({
                      page: safePage - 1,
                    })}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  >
                    ‹
                  </Link>
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-300">
                    ‹
                  </span>
                )}

                {/* NUMBERS */}
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={buildQuery({
                      page: pageNumber,
                    })}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                      pageNumber === safePage
                        ? "bg-primary-800 text-white"
                        : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}

                {/* NEXT */}
                {safePage < totalPages ? (
                  <Link
                    href={buildQuery({
                      page: safePage + 1,
                    })}
                    className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  >
                    ›
                  </Link>
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center rounded-md border border-neutral-200 text-neutral-300">
                    ›
                  </span>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =====================================================
          STOK RENDAH
          ===================================================== */}

      {tab === "stok" && (
        <div className="bg-white border border-neutral-300 rounded-xl overflow-hidden">
          <div className="px-5 py-5">
            <h2 className="text-lg font-bold text-primary-800">
              Stok Rendah
            </h2>

            <p className="text-sm text-neutral-500 mt-1">
              Daftar produk aktif dengan stok 5 atau kurang.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50 border-y border-neutral-300">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Produk
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Barcode
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Stok
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {lowStock.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-neutral-400"
                    >
                      Tidak ada stok rendah.
                    </td>
                  </tr>
                ) : (
                  lowStock.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-neutral-200"
                    >
                      <td className="px-5 py-3.5 font-medium text-primary-800">
                        {product.name}
                      </td>

                      <td className="px-5 py-3.5 text-neutral-500">
                        {product.barcode ?? "-"}
                      </td>

                      <td className="px-5 py-3.5 text-right font-semibold text-red-600">
                        {product.stock}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                          Stok Rendah
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================
          KEDALUWARSA
          ===================================================== */}

      {tab === "kedaluwarsa" && (
        <div className="space-y-5">
          {/* EXPIRED */}
          <div className="bg-white border border-neutral-300 rounded-xl overflow-hidden">
            <div className="px-5 py-5">
              <h2 className="text-lg font-bold text-primary-800">
                Produk Kedaluwarsa
              </h2>

              <p className="text-sm text-neutral-500 mt-1">
                Produk yang sudah melewati tanggal kedaluwarsa.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-50 border-y border-neutral-300">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Produk
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Tanggal Kedaluwarsa
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {expired.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-12 text-center text-neutral-400"
                      >
                        Tidak ada produk kedaluwarsa.
                      </td>
                    </tr>
                  ) : (
                    expired.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-neutral-200"
                      >
                        <td className="px-5 py-3.5 font-medium text-primary-800">
                          {product.name}
                        </td>

                        <td className="px-5 py-3.5 text-neutral-500">
                          {product.expiredDate
                            ? formatDate(product.expiredDate)
                            : "-"}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                            Kedaluwarsa
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SEGERA EXPIRED */}
          <div className="bg-white border border-neutral-300 rounded-xl overflow-hidden">
            <div className="px-5 py-5">
              <h2 className="text-lg font-bold text-primary-800">
                Segera Kedaluwarsa
              </h2>

              <p className="text-sm text-neutral-500 mt-1">
                Produk yang akan kedaluwarsa dalam 7 hari.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-50 border-y border-neutral-300">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Produk
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Tanggal Kedaluwarsa
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {expiringSoon.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-12 text-center text-neutral-400"
                      >
                        Tidak ada produk yang segera kedaluwarsa.
                      </td>
                    </tr>
                  ) : (
                    expiringSoon.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-neutral-200"
                      >
                        <td className="px-5 py-3.5 font-medium text-primary-800">
                          {product.name}
                        </td>

                        <td className="px-5 py-3.5 text-right text-neutral-500">
                          {product.expiredDate
                            ? formatDate(product.expiredDate)
                            : "-"}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex rounded-full bg-secondary-50 px-3 py-1 text-xs font-medium text-secondary-600">
                            Segera Kedaluwarsa
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}