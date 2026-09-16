import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getTopSellingProducts, getLowInterestProducts } from "@/actions/product";

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
    period?: string;
  }>;
}) {
  const { locale } = await params;

  const {
    from,
    to,
    tab = "penjualan",
    page,
    period,
  } = await searchParams;

  const t = await getTranslations({
    locale,
    namespace: "laporan",
  });

  const tc = await getTranslations({
    locale,
    namespace: "common",
  });

  const now = new Date();
  let finalFrom = from;
  let finalTo = to;
  let activePeriod = period || (from && to ? 'custom' : 'today');

  // Default: hari ini jika tidak ada parameter apapun
  if (!period && !from && !to) {
    activePeriod = 'today';
    finalFrom = now.toISOString().slice(0, 10);
    finalTo = now.toISOString().slice(0, 10);
  } else if (period) {
    if (period === "today") {
      finalFrom = now.toISOString().slice(0, 10);
      finalTo = now.toISOString().slice(0, 10);
    } else if (period === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      finalFrom = startOfWeek.toISOString().slice(0, 10);
      finalTo = now.toISOString().slice(0, 10);
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      finalFrom = startOfMonth.toISOString().slice(0, 10);
      finalTo = now.toISOString().slice(0, 10);
    } else if (period === "year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      finalFrom = startOfYear.toISOString().slice(0, 10);
      finalTo = now.toISOString().slice(0, 10);
    }
  }

  // Batas minimum: Juni 2026
  const minDate = new Date('2026-06-01');
  const { start, end } = parseRange(finalFrom, finalTo);
  
  if (start < minDate) {
    start.setTime(minDate.getTime());
  }

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
   * RINGKASAN TOTAL
   * ==========================================================
   */

  const totalRevenue = transactions.reduce((sum, tx) => sum + Number(tx.total), 0);
  const totalTransactions = transactions.length;
  const totalItems = transactions.reduce(
    (sum, tx) => sum + tx.items.reduce((t, item) => t + Number(item.qty), 0),
    0
  );
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  /*
   * ==========================================================
   * DATA PER PERIODE (untuk pilihan view)
   * Otomatis sesuaikan agregasi berdasarkan jarak tanggal
   * ==========================================================
   */

  type PeriodData = {
    label: string;
    revenue: number;
    transactions: number;
    items: number;
  };

  const periodData: PeriodData[] = [];
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Auto-aggregate: 
  // <= 7 hari: per hari
  // <= 60 hari: per hari
  // <= 365 hari: per minggu
  // > 365 hari: per bulan

  if (activePeriod === "today") {
    // Tampilan per jam untuk hari ini (00-23)
    for (let i = 0; i < 24; i++) {
      const hourTransactions = transactions.filter(t => new Date(t.createdAt).getHours() === i);
      periodData.push({
        label: `${i.toString().padStart(2, '0')}:00`,
        revenue: hourTransactions.reduce((sum, tx) => sum + Number(tx.total), 0),
        transactions: hourTransactions.length,
        items: hourTransactions.reduce((sum, tx) => sum + tx.items.reduce((t, item) => t + Number(item.qty), 0), 0),
      });
    }
  } else if (activePeriod === "week") {
    // Tampilan 7 hari (Minggu sampai Sabtu atau hari ini ke belakang)
    const days = getDaysBetween(start, end);
    for (const day of days) {
      const daySales = dailySales.find(d => d.date.toDateString() === day.toDateString());
      periodData.push({
        label: formatShortDate(day),
        revenue: daySales?.revenue || 0,
        transactions: daySales?.transactions || 0,
        items: daySales?.items || 0,
      });
    }
  } else if (activePeriod === "month") {
    // Tampilan per minggu (Minggu 1, 2, 3, 4)
    // 1-7 (Minggu 1), 8-14 (Minggu 2), 15-21 (Minggu 3), 22-end (Minggu 4)
    const weeks = [
        { label: "W1", start: 1, end: 7 },
        { label: "W2", start: 8, end: 14 },
        { label: "W3", start: 15, end: 21 },
        { label: "W4", start: 22, end: 31 },
    ];
    for (const w of weeks) {
        const weekSales = dailySales.filter(d => d.date.getDate() >= w.start && d.date.getDate() <= w.end);
        periodData.push({
            label: w.label,
            revenue: weekSales.reduce((s, d) => s + d.revenue, 0),
            transactions: weekSales.reduce((s, d) => s + d.transactions, 0),
            items: weekSales.reduce((s, d) => s + d.items, 0),
        });
    }
  } else if (activePeriod === "year") {
    // Tampilan 12 bulan
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    for (let i = 0; i < 12; i++) {
      const monthSales = dailySales.filter(d => d.date.getMonth() === i);
      periodData.push({
        label: monthNames[i],
        revenue: monthSales.reduce((s, d) => s + d.revenue, 0),
        transactions: monthSales.reduce((s, d) => s + d.transactions, 0),
        items: monthSales.reduce((s, d) => s + d.items, 0),
      });
    }
  } else {
    // Custom Range: Fallback ke per hari
    for (const day of dailySales) {
      periodData.push({
        label: formatShortDate(day.date),
        revenue: day.revenue,
        transactions: day.transactions,
        items: day.items,
      });
    }
  }

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

  const now2 = new Date();

  const sevenDaysLater = new Date(
    now2.getTime() + 7 * 24 * 60 * 60 * 1000
  );

  const [expired, expiringSoon] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "active",
        expiredDate: {
          lt: now2,
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
          gte: now2,
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
   * DATA TERLARIS & KURANG DIMINATI
   * ==========================================================
   */

  const [topSelling, lowInterest] = await Promise.all([
    getTopSellingProducts(10),
    getLowInterestProducts(10),
  ]);

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

            <Link
              href={buildQuery({
                tab: "terlaris",
                page: 1,
              })}
              className={`px-5 py-4 text-sm font-semibold border-b-2 ${
                tab === "terlaris"
                  ? "text-primary-800 border-primary-800"
                  : "text-neutral-500 border-transparent"
              }`}
            >
              Terlaris & Kurang Diminati
            </Link>
          </div>
        </div>

        {/* FILTER */}
        <div className="px-4 py-3.5">
          <form
            method="get"
            className="flex flex-wrap items-center gap-3"
          >
            <input
              type="hidden"
              name="tab"
              value={tab}
            />

            {tab === "penjualan" && (
                <>
                <span className="text-sm font-semibold text-neutral-600 shrink-0">
                  Periode:
                </span>

                <div className="flex flex-wrap gap-2 flex-1">
                  <button
                    type="submit"
                    name="period"
                    value="today"
                    className={`px-3 py-2 text-xs font-medium rounded-lg border ${activePeriod === 'today' ? 'bg-[#1F416B] text-white border-[#1F416B]' : 'border-neutral-300 bg-white hover:bg-neutral-50'} transition`}
                  >
                    Hari Ini
                  </button>
                  <button
                    type="submit"
                    name="period"
                    value="week"
                    className={`px-3 py-2 text-xs font-medium rounded-lg border ${activePeriod === 'week' ? 'bg-[#1F416B] text-white border-[#1F416B]' : 'border-neutral-300 bg-white hover:bg-neutral-50'} transition`}
                  >
                    Minggu Ini
                  </button>
                  <button
                    type="submit"
                    name="period"
                    value="month"
                    className={`px-3 py-2 text-xs font-medium rounded-lg border ${activePeriod === 'month' ? 'bg-[#1F416B] text-white border-[#1F416B]' : 'border-neutral-300 bg-white hover:bg-neutral-50'} transition`}
                  >
                    Bulan Ini
                  </button>
                  <button
                    type="submit"
                    name="period"
                    value="year"
                    className={`px-3 py-2 text-xs font-medium rounded-lg border ${activePeriod === 'year' ? 'bg-[#1F416B] text-white border-[#1F416B]' : 'border-neutral-300 bg-white hover:bg-neutral-50'} transition`}
                  >
                    Tahun Ini
                  </button>
                </div>

                <div className="h-10 flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white w-full sm:w-auto">
                    <div className="flex items-center px-3">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500 mr-2 shrink-0">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <input type="date" name="from" defaultValue={fromValue} className="text-sm text-neutral-700 outline-none bg-transparent w-full" />
                    </div>
                    <span className="text-neutral-400 shrink-0">-</span>
                    <div className="px-3">
                        <input type="date" name="to" defaultValue={toValue} className="text-sm text-neutral-700 outline-none bg-transparent w-full" />
                    </div>
                    <span className="px-3 text-neutral-400 shrink-0">▾</span>
                </div>

                <button
                    type="submit"
                    className="h-10 bg-primary-700 text-white text-sm font-semibold px-4 rounded-lg hover:bg-primary-800 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                    </svg>
                    Terapkan
                </button>
                </>
            )}
          </form>
        </div>
      </div>

      {/* =====================================================
          PENJUALAN
          ===================================================== */}

      {tab === "penjualan" && (
        <>
          {/* RINGKASAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="text-xs text-neutral-400 mb-1">Total Pendapatan</div>
              <div className="text-2xl font-bold text-primary-800">
                {tc("currencyPrefix")} {totalRevenue.toLocaleString("id-ID")}
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="text-xs text-neutral-400 mb-1">Total Transaksi</div>
              <div className="text-2xl font-bold text-primary-800">
                {totalTransactions}
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="text-xs text-neutral-400 mb-1">Total Item Terjual</div>
              <div className="text-2xl font-bold text-primary-800">
                {totalItems} pcs
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="text-xs text-neutral-400 mb-1">Rata-rata Transaksi</div>
              <div className="text-2xl font-bold text-primary-800">
                {tc("currencyPrefix")} {Math.round(avgTransaction).toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          {/* TREN PENJUALAN - GRAFIK AREA SMOOTH (AREA CHART) */}
          <div className="bg-white border border-neutral-300 rounded-xl p-5">
            <h2 className="text-lg font-bold text-primary-800 mb-5">
              Tren Penjualan
            </h2>

            <div className="h-[300px] w-full border border-dashed border-neutral-200 rounded-lg bg-white p-4 flex flex-col justify-between overflow-hidden">
              {periodData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-neutral-400">
                  {tc("empty")}
                </div>
              ) : (
                <>
                  {(() => {
                    const maxVal = Math.max(...periodData.map((d) => d.revenue), 1);
                    const width = 1000;
                    const height = 220;
                    const paddingX = 30;
                    const paddingY = 30;

                    // Generate smooth path points (Bezier Curve)
                    const points = periodData.map((d, i) => {
                      const x = paddingX + (i / Math.max(periodData.length - 1, 1)) * (width - paddingX * 2);
                      const y = height - paddingY - (d.revenue / maxVal) * (height - paddingY * 2);
                      return { x, y, data: d };
                    });

                    // Build d attribute for SVG Smooth Curve
                    let pathD = `M ${points[0].x} ${points[0].y}`;
                    for (let i = 0; i < points.length - 1; i++) {
                      const curr = points[i];
                      const next = points[i + 1];
                      const cp1x = curr.x + (next.x - curr.x) / 2;
                      const cp1y = curr.y;
                      const cp2x = curr.x + (next.x - curr.x) / 2;
                      const cp2y = next.y;
                      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
                    }

                    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

                    // Smart tooltip positioning (hindari offside kiri/kanan)
                    const getTooltipX = (x: number) => {
                      if (x < 80) return x + 10;
                      if (x > width - 80) return x - 90;
                      return x - 40;
                    };

                    // Tampilkan semua label untuk "today" (24 jam) tanpa ada labelStep yang terlewat
                    const labelStep = activePeriod === "today" ? 1 : (periodData.length > 12 ? Math.ceil(periodData.length / 12) : 1);

                    return (
                      <div className="relative w-full h-full flex flex-col">
                        <div className="flex-1 w-full relative">
                          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.20" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Grid vertical & horizontal lines */}
                            <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} stroke="#e5e7eb" strokeWidth="1" />
                            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#f3f4f6" strokeDasharray="3 3" />
                            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#f3f4f6" strokeDasharray="3 3" />
                            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e5e7eb" strokeWidth="1" />

                            {/* Filled Gradient Area */}
                            <path d={areaD} fill="url(#areaGradient)" />

                            {/* Smooth Line - Tipis */}
                            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

                            {/* Data Points dengan Tooltip Putih dan Hover Vertical Guide Line */}
                            {points.map((pt, idx) => (
                              // Hanya render titik jika labelnya ditampilkan atau ada nilai
                              (idx % labelStep === 0 || pt.data.revenue > 0) && (
                                <g key={idx} className="group cursor-pointer">
                                  {/* Zona deteksi kursor (Invisible Full Height Trigger) */}
                                  <rect
                                    x={pt.x - (width / (periodData.length || 1)) / 2}
                                    y={paddingY}
                                    width={width / (periodData.length || 1)}
                                    height={height - paddingY * 2}
                                    fill="transparent"
                                    className="pointer-events-auto"
                                  />
                                  
                                  {/* Garis vertikal atas-bawah mengikuti cursor */}
                                  <line 
                                    x1={pt.x} y1={paddingY} x2={pt.x} y2={height - paddingY} 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                    stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" 
                                  />

                                  <circle cx={pt.x} cy={pt.y} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                  
                                  {/* Tooltip Putih Informasi Lengkap */}
                                  <foreignObject x={getTooltipX(pt.x)} y={Math.max(pt.y - 65, 0)} width="130" height="60" className="pointer-events-none overflow-visible">
                                    <div className="hidden group-hover:block bg-white border border-neutral-200 rounded-lg px-3 py-2 shadow-xl min-w-[110px]">
                                      <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">{pt.data.label}</div>
                                      <div className="text-[11px] font-bold text-[#6366f1] leading-tight mt-0.5">
                                        Rp {pt.data.revenue.toLocaleString("id-ID")}
                                      </div>
                                    </div>
                                  </foreignObject>
                                </g>
                              )
                            ))}
                          </svg>
                        </div>

                        {activePeriod === "today" ? (
                          <>
                            <div className="hidden md:flex justify-between items-center pt-2 px-1 text-[11px] text-neutral-500 border-t border-neutral-100 mt-1">
                              {periodData.map((d, i) => (
                                <span key={i} className="text-center flex-1 truncate">
                                  {d.label}
                                </span>
                              ))}
                            </div>
                            <div className="flex md:hidden justify-between items-center pt-2 px-1 text-[10px] text-neutral-500 border-t border-neutral-100 mt-1">
                              {periodData.map((d, i) => (
                                i % 3 === 0 ? (
                                  <span key={i} className="text-center flex-1 truncate">
                                    {d.label}
                                  </span>
                                ) : null
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center pt-2 px-1 text-[11px] text-neutral-500 border-t border-neutral-100 mt-1">
                            {periodData.map((d, i) => (
                              i % labelStep === 0 ? (
                                <span key={i} className="text-center flex-shrink-0" style={{ width: `${100 / Math.ceil(periodData.length / labelStep)}%` }}>
                                  {d.label}
                                </span>
                              ) : null
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
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
      {/* =====================================================
          TERLARIS & KURANG DIMINATI
          ===================================================== */}

      {tab === "terlaris" && (
        <div className="space-y-5">
          {/* TERLARIS */}
          <div className="bg-white border border-neutral-300 rounded-xl overflow-hidden">
            <div className="px-5 py-5">
              <h2 className="text-lg font-bold text-primary-800">
                Produk Terlaris
              </h2>

              <p className="text-sm text-neutral-500 mt-1">
                Top 10 produk dengan total penjualan terbanyak.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-50 border-y border-neutral-300">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Peringkat
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Produk
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Total Terjual
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {topSelling.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-12 text-center text-neutral-400"
                      >
                        Belum ada data penjualan.
                      </td>
                    </tr>
                  ) : (
                    topSelling.map((item, index) => (
                      <tr
                        key={item.productId}
                        className="border-b border-neutral-200"
                      >
                        <td className="px-5 py-3.5 font-semibold text-neutral-600">
                          #{index + 1}
                        </td>

                        <td className="px-5 py-3.5 font-medium text-primary-800">
                          {item.productName}
                        </td>

                        <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">
                          {item.totalSold} pcs
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* KURANG DIMINATI */}
          <div className="bg-white border border-neutral-300 rounded-xl overflow-hidden">
            <div className="px-5 py-5">
              <h2 className="text-lg font-bold text-primary-800">
                Produk Kurang Diminati
              </h2>

              <p className="text-sm text-neutral-500 mt-1">
                Produk dengan penjualan paling sedikit atau nol.
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
                      Total Terjual
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {lowInterest.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-5 py-12 text-center text-neutral-400"
                      >
                        Tidak ada data produk.
                      </td>
                    </tr>
                  ) : (
                    lowInterest.map((item) => (
                      <tr
                        key={item.productId}
                        className="border-b border-neutral-200"
                      >
                        <td className="px-5 py-3.5 font-medium text-primary-800">
                          {item.productName}
                        </td>

                        <td className="px-5 py-3.5 text-right font-semibold text-red-600">
                          {item.totalSold} pcs
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