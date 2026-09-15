import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Banknote, Receipt, ClipboardList, AlertTriangle } from "lucide-react";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const isAdmin = session.role === "admin";
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  if (isAdmin) {
    /* =================== ADMIN DASHBOARD =================== */
    const [transactionsToday, salesAgg, lowStock, expiring, recent] =
      await Promise.all([
        prisma.transaction.count({ where: { createdAt: { gte: startOfDay } } }),
        prisma.transaction.aggregate({
          _sum: { total: true },
          where: { createdAt: { gte: startOfDay } },
        }),
        prisma.product.findMany({
          where: { status: "active", stock: { lte: 5 } },
          take: 5,
          orderBy: { stock: "asc" },
        }),
        prisma.product.findMany({
          where: {
            status: "active",
            expiredDate: { lte: new Date(Date.now() + 7 * 86400000) },
          },
          take: 5,
          orderBy: { expiredDate: "asc" },
        }),
        prisma.transaction.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: { user: true },
        }),
      ]);

    const cards = [
      {
        label: t("salesToday"),
        value: `${tc("currencyPrefix")} ${(salesAgg._sum.total ?? 0).toLocaleString("id-ID")}`,
        icon: <Banknote className="w-5 h-5 text-primary-700" />,
      },
      {
        label: t("transactionsToday"),
        value: transactionsToday,
        icon: <Receipt className="w-5 h-5 text-primary-700" />,
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-primary-800">{t("title")}</h1>
          <p className="text-sm text-neutral-400">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="bg-white border border-neutral-200 rounded-xl p-5 flex items-start justify-between"
            >
              <div>
                <div className="text-xs text-neutral-400 mb-1">{c.label}</div>
                <div className="text-xl md:text-2xl font-bold text-primary-800">
                  {c.value}
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-lg shrink-0">
                {c.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="font-semibold text-primary-800 mb-3 text-sm">
              {t("lowStock")}
            </h3>
            <ul className="space-y-2 text-sm">
              {lowStock.length === 0 && (
                <li className="text-neutral-400">{tc("empty")}</li>
              )}
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span className="truncate">{p.name}</span>
                  <span className="text-red-600 font-medium shrink-0 ml-2">
                    {p.stock}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="font-semibold text-primary-800 mb-3 text-sm">
              {t("expiring")}
            </h3>
            <ul className="space-y-2 text-sm">
              {expiring.length === 0 && (
                <li className="text-neutral-400">{tc("empty")}</li>
              )}
              {expiring.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span className="truncate">{p.name}</span>
                  <span className="text-secondary-600 font-medium shrink-0 ml-2">
                    {p.expiredDate?.toLocaleDateString("id-ID")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 overflow-x-auto">
          <h3 className="font-semibold text-primary-800 mb-3 text-sm">
            {t("recentTransactions")}
          </h3>
          <table className="w-full text-sm min-w-[420px]">
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td className="text-neutral-400 py-2">{tc("empty")}</td>
                </tr>
              )}
              {recent.map((tx) => (
                <tr key={tx.id} className="border-t border-neutral-100">
                  <td className="py-2">{tx.transactionNumber}</td>
                  <td className="py-2 text-neutral-400">
                    {tx.user?.username ?? "-"}
                  </td>
                  <td className="py-2 text-right font-medium whitespace-nowrap">
                    {tc("currencyPrefix")} {tx.total.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* =================== KASIR DASHBOARD =================== */
  const [ownTransactionsToday, recentOwn] = await Promise.all([
    prisma.transaction.count({
      where: { userId: session.userId, createdAt: { gte: startOfDay } },
    }),
    prisma.transaction.findMany({
      where: { userId: session.userId },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-primary-800">
          Selamat Datang, {session.username}
        </h1>
        <p className="text-sm text-neutral-400">
          Aktivitas transaksi Anda hari ini
        </p>
      </div>

      {/* Stat kasir */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-start justify-between">
          <div>
            <div className="text-xs text-neutral-400 mb-1">
              Transaksi Anda Hari Ini
            </div>
            <div className="text-2xl font-bold text-primary-800">
              {ownTransactionsToday}
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-start justify-between">
          <div>
            <div className="text-xs text-neutral-400 mb-1">
              Total Transaksi Anda
            </div>
            <div className="text-2xl font-bold text-primary-800">
              {recentOwn.length < 10 ? recentOwn.length : "10+"}
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabel aktivitas terkini */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 overflow-x-auto">
        <h3 className="font-semibold text-primary-800 mb-3 text-sm">
          Aktivitas Terkini
        </h3>
        <table className="w-full text-sm min-w-[360px]">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-neutral-400 text-xs">
              <th className="pb-2 font-medium">No. Transaksi</th>
              <th className="pb-2 font-medium">Metode</th>
              <th className="pb-2 font-medium text-right">Total</th>
              <th className="pb-2 font-medium text-right">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {recentOwn.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-neutral-400">
                  Belum ada transaksi.
                </td>
              </tr>
            )}
            {recentOwn.map((tx) => (
              <tr key={tx.id} className="border-t border-neutral-100">
                <td className="py-2.5 font-medium text-primary-800">
                  {tx.transactionNumber}
                </td>
                <td className="py-2.5">
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 capitalize">
                    {tx.paymentMethod === "cash" ? "Tunai" : "Transfer"}
                  </span>
                </td>
                <td className="py-2.5 text-right font-medium whitespace-nowrap">
                  {tc("currencyPrefix")} {tx.total.toLocaleString("id-ID")}
                </td>
                <td className="py-2.5 text-right text-neutral-400 whitespace-nowrap">
                  {new Date(tx.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <div className="text-[11px]">
                    {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
