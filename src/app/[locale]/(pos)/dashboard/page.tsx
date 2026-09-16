import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Banknote, Receipt, ClipboardList, Monitor, Camera, ArrowUpRight } from "lucide-react";
import Link from "next/link";

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
          where: { status: "active", stock: { lte: 10 } },
          take: 5,
          orderBy: { stock: "asc" },
          include: { category: true }
        }),
        prisma.product.findMany({
          where: {
            status: "active",
            expiredDate: { lte: new Date(Date.now() + 30 * 86400000) },
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

    return (
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#182235]">Dashboard Utama</h1>
            <p className="text-sm text-neutral-500">Ringkasan operasional harian Anda</p>
          </div>
        </div>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-500">Penjualan Hari Ini</p>
              <h3 className="text-3xl font-bold text-[#182235]">
                {tc("currencyPrefix")} {(salesAgg._sum.total ?? 0).toLocaleString("id-ID")}
              </h3>
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                
              </div>
            </div>
            <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center">
              <Camera className="w-7 h-7 text-[#182235]" />
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-500">Total Transaksi</p>
              <h3 className="text-3xl font-bold text-[#182235]">{transactionsToday} Transaksi</h3>
              <div className="flex items-center gap-1 text-neutral-500 text-xs">
              
              </div>
            </div>
            <div className="w-14 h-14 bg-[#EEF5FF] rounded-2xl flex items-center justify-center">
              <Monitor className="w-7 h-7 text-[#1F416B]" />
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* STOK RENDAH */}
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="font-bold text-[#182235] flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-red-500" /> Stok Rendah
              </h3>
              <Link href={`/${locale}/laporan?tab=stok`} className="text-xs font-medium text-neutral-500 hover:text-primary-700">
                Lihat Semua
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-400 text-xs uppercase tracking-wider bg-neutral-50/50">
                    <th className="px-5 py-3 font-medium">Nama Produk</th>
                    <th className="px-5 py-3 font-medium">Kategori</th>
                    <th className="px-5 py-3 font-medium">Sisa</th>
                    <th className="px-5 py-3 font-medium">Batas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {lowStock.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-[#182235]">{p.name}</td>
                      <td className="px-5 py-4 text-neutral-500">{p.category.name}</td>
                      <td className="px-5 py-4 font-bold text-red-500">{p.stock}</td>
                      <td className="px-5 py-4 text-neutral-500 text-xs font-medium">10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PRODUK KEDALUWARSA */}
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="font-bold text-[#182235] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-500" /> Produk Kedaluwarsa
              </h3>
              <Link href={`/${locale}/laporan?tab=kedaluwarsa`} className="text-xs font-medium text-neutral-500 hover:text-primary-700">
                Lihat Semua
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-400 text-xs uppercase tracking-wider bg-neutral-50/50">
                    <th className="px-5 py-3 font-medium">Nama Produk</th>
                    <th className="px-5 py-3 font-medium">Tanggal Exp</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {expiring.map((p) => {
                    const isExpired = p.expiredDate && p.expiredDate < new Date();
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-5 py-4 font-medium text-[#182235]">{p.name}</td>
                        <td className="px-5 py-4 text-neutral-500">
                          {p.expiredDate?.toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${isExpired ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                            {isExpired ? 'Kedaluwarsa' : 'Hampir Habis'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION - TRANSAKSI TERBARU */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#182235]">Transaksi Terbaru</h3>
            <Link href={`/${locale}/riwayat`} className="bg-[#182235] text-white text-xs font-semibold px-5 py-2 rounded-lg hover:bg-[#253044] transition-colors">
              Lihat semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-400 text-xs uppercase tracking-wider bg-neutral-50/50 border-b border-neutral-100">
                  <th className="px-6 py-4 font-medium">Waktu</th>
                  <th className="px-6 py-4 font-medium">ID Transaksi</th>
                  <th className="px-6 py-4 font-medium">Metode Bayar</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recent.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 text-neutral-500">
                      {new Date(tx.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#182235]">{tx.transactionNumber}</td>
                    <td className="px-6 py-4 text-neutral-500 capitalize">{tx.paymentMethod}</td>
                    <td className="px-6 py-4 font-bold text-[#182235]">
                      {tc("currencyPrefix")} {tx.total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                        {tx.status === 'completed' ? 'SUKSES' : tx.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
