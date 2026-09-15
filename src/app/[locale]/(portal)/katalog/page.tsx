import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/actions/product";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

// Fallback kalau produk belum punya imageUrl di DB
const placeholderImages = [
  "https://images.unsplash.com/photo-1621939514649-280e2aa55345?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&w=500&q=80",
];

const PAGE_SIZE = 20;

const MAX_STAGGER_DELAY = 320;
const getDelay = (index: number) => Math.min(index * 60, MAX_STAGGER_DELAY);

const SORT_ORDER_BY: Record<string, Record<string, "asc" | "desc">> = {
  az: { name: "asc" },
  newest: { createdAt: "desc" },
  "price-desc": { price: "desc" },
  "price-asc": { price: "asc" },
  "stock-desc": { stock: "desc" },
};

// Windowed page numbers, misal: 1 ... 4 5 6 ... 12
function getPageNumbers(current: number, total: number): (number | "...")[] {
  const delta = 1;
  const range: (number | "...")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push("...");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("...");
  if (total > 1) range.push(total);

  return range;
}

function StockBadge({ stock, unit, t }: { stock: number; unit: string; t: (key: string) => string }) {
  if (stock <= 0) {
    return (
      <span className="absolute right-2 top-2 rounded-full bg-[#E0405A] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:right-2.5 sm:top-2.5 sm:px-2.5 sm:py-1">
        {t("outOfStock")}
      </span>
    );
  }

  if (stock <= 10) {
    return (
      <span className="absolute right-2 top-2 rounded-full bg-[#E8890C] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:right-2.5 sm:top-2.5 sm:px-2.5 sm:py-1">
        {t("remaining")} {stock} {unit}
      </span>
    );
  }

  return (
    <span className="absolute right-2 top-2 rounded-full bg-[#149D50] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:right-2.5 sm:top-2.5 sm:px-2.5 sm:py-1">
      {t("remaining")} {stock} {unit}
    </span>
  );
}

export default async function KatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; page?: string; view?: string; sort?: string }>;
}) {
  const { locale } = await params;
  const { q, category, page, view, sort } = await searchParams;
  const t = await getTranslations({ locale, namespace: "portal" });
  const tKatalog = await getTranslations({ locale, namespace: "katalog" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const currentPage = Math.max(1, Number(page) || 1);
  const viewMode = view === "list" ? "list" : "grid";
  const sortParam = SORT_ORDER_BY[sort ?? ""] ? (sort as string) : "az";
  const orderBy = SORT_ORDER_BY[sortParam];
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = {
    status: "active" as const,
    ...(category ? { categoryId: category } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const SORT_OPTIONS: { value: string; label: string }[] = [
    { value: "az", label: tKatalog("az") },
    { value: "newest", label: tKatalog("newest") },
    { value: "price-desc", label: tKatalog("priceHighest") },
    { value: "price-asc", label: tKatalog("priceLowest") },
    { value: "stock-desc", label: tKatalog("mostStock") },
  ];

  const activeSortLabel = SORT_OPTIONS.find((s) => s.value === sortParam)?.label ?? tKatalog("az");

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (viewMode !== "grid") params.set("view", viewMode);
    if (sortParam !== "az") params.set("sort", sortParam);
    Object.entries(overrides).forEach(([key, val]) => {
      if (val === undefined) params.delete(key);
      else params.set(key, val);
    });
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8 sm:py-10 md:px-6 md:py-11 lg:px-0">

      <style>{`
        details > .dc-dropdown {
          display: block;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transform: translateY(-6px);
          transition: max-height 220ms ease-out, opacity 180ms ease-out, transform 200ms ease-out;
          pointer-events: none;
        }
        details[open] > .dc-dropdown {
          max-height: 420px;
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .dc-category-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .dc-category-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <AnimateOnScroll y={12}>
        <div>
          <h1 className="text-xl font-bold text-[#0E2F55] sm:text-2xl">
            {tKatalog("title")}
          </h1>

          <p className="mt-1.5 max-w-[560px] text-[13px] leading-6 text-[#667085] sm:text-sm">
            {tKatalog("description") ??
              "Temukan berbagai pilihan snack dari berbagai merek untuk kebutuhan grosir dan usaha Anda."}
          </p>

          {q && (
            <p className="mt-2 text-[13px] text-neutral-500">
              {tKatalog("resultsFor")}{" "}
              <span className="font-medium text-[#182235]">&ldquo;{q}&rdquo;</span>
            </p>
          )}
        </div>
      </AnimateOnScroll>

      {/* Category pills + sort + view toggle */}
      <div className="relative z-20">
        <AnimateOnScroll delay={80} y={12}>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 sm:mt-6">
            <div className="relative min-w-0 flex-1">
              <div className="dc-category-scroll flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-28px),transparent)] sm:[mask-image:none]">
                <Link
                  href={`/${locale}/katalog${buildQuery({ category: undefined, page: undefined })}`}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-200 ease-out hover:scale-105 active:scale-95 ${!category
                      ? "border-[#1F416B] bg-[#1F416B] text-white"
                      : "border-neutral-200 bg-white text-[#535C69] hover:border-[#1F416B]/30"
                    }`}
                >
                  {tKatalog("all")}
                </Link>

                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/${locale}/katalog${buildQuery({ category: c.id, page: undefined })}`}
                    className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-200 ease-out hover:scale-105 active:scale-95 ${category === c.id
                        ? "border-[#1F416B] bg-[#1F416B] text-white"
                        : "border-neutral-200 bg-white text-[#535C69] hover:border-[#1F416B]/30"
                      }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Sort dropdown */}
              <details className="group relative shrink-0">
                <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-[13px] font-medium text-[#535C69] transition-colors duration-200 ease-out hover:border-[#1F416B]/30 [&::-webkit-details-marker]:hidden">
                  <span className="text-[11px] text-[#8891A3]">{tKatalog("sortLabel")}</span>
                  {activeSortLabel}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </summary>
                <div className="dc-dropdown absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg">
                  {SORT_OPTIONS.map((opt) => (
                    <Link
                      key={opt.value}
                      href={`/${locale}/katalog${buildQuery({ sort: opt.value === "az" ? undefined : opt.value, page: undefined })}`}
                      className={`block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200 ease-out ${sortParam === opt.value
                          ? "bg-[#EFF5FF] text-[#1F416B]"
                          : "text-[#535C69] hover:bg-neutral-50"
                        }`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </details>

              {/* Grid / List toggle */}
              <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
                <Link
                  href={`/${locale}/katalog${buildQuery({ view: undefined })}`}
                  aria-label="Tampilan grid"
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-200 ease-out ${viewMode === "grid" ? "bg-[#EFF5FF] text-[#1F416B]" : "text-neutral-400 hover:text-[#1F416B]"
                    }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="8" height="8" rx="1.5" />
                    <rect x="13" y="3" width="8" height="8" rx="1.5" />
                    <rect x="3" y="13" width="8" height="8" rx="1.5" />
                    <rect x="13" y="13" width="8" height="8" rx="1.5" />
                  </svg>
                </Link>

                <Link
                  href={`/${locale}/katalog${buildQuery({ view: "list" })}`}
                  aria-label="Tampilan list"
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-200 ease-out ${viewMode === "list" ? "bg-[#EFF5FF] text-[#1F416B]" : "text-neutral-400 hover:text-[#1F416B]"
                    }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="4" width="18" height="3.5" rx="1" />
                    <rect x="3" y="10.3" width="18" height="3.5" rx="1" />
                    <rect x="3" y="16.5" width="18" height="3.5" rx="1" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>

      {/* Product grid/list */}
      {products.length === 0 ? (
        <p className="col-span-full py-16 text-center text-sm text-neutral-400">
          {tc("empty")}
        </p>
      ) : viewMode === "list" ? (
        <div className="mt-6 flex flex-col gap-3">
          {products.map((p, index) => {
            const isOut = p.stock <= 0;
            const unit = (p as any).unit ?? "Pcs"; // ganti "p as any" setelah field unit dikonfirmasi
            const imageUrl = (p as any).imageUrl as string | null | undefined;
            return (
              <AnimateOnScroll key={p.id} delay={getDelay(index)} y={16}>
                <div className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-shadow duration-200 ease-out hover:shadow-md sm:gap-4 sm:p-4">
                  <Link
                    href={`/${locale}/produk/${p.id}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 xs:h-24 xs:w-24 sm:h-28 sm:w-28"
                  >
                    <img
                      src={imageUrl || placeholderImages[index % placeholderImages.length]}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out hover:scale-105"
                    />
                    <StockBadge stock={p.stock} unit={unit} t={tKatalog} />
                   </Link>

                   <div className="flex flex-1 flex-col justify-between py-0.5">
                     <div>
                       <p className="text-[10px] font-bold uppercase tracking-wide text-[#8891A3]">
                         {p.category.name}
                       </p>
                       <Link href={`/${locale}/produk/${p.id}`}>
                         <h3 className="mt-0.5 line-clamp-2 text-[13px] font-semibold text-[#182235] transition-colors duration-200 ease-out hover:text-[#1F416B] sm:text-[15px]">
                           {p.name}
                         </h3>
                       </Link>
                     </div>

                     <div className="flex items-end justify-between gap-3">
                       <div>
                         <p className="text-[10px] text-[#8891A3]">{tKatalog("price")}</p>
                         <p className="text-sm font-bold text-[#1F416B] sm:text-base">
                           {tc("currencyPrefix")}
                           {p.price.toLocaleString("id-ID")}
                           <span className="ml-1 text-[11px] font-normal text-neutral-400">/ {unit}</span>
                         </p>
                       </div>

                       <Link
                         href={`/${locale}/produk/${p.id}`}
                         className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 ease-out sm:px-4 ${isOut
                             ? "pointer-events-none bg-[#EFF5FF] text-[#8891A3]"
                             : "bg-[#1F416B] text-white hover:scale-[1.03] hover:bg-[#173555] active:scale-95"
                           }`}
                       >
                         {isOut ? tKatalog("outOfStock") : tKatalog("viewDetail")}
                       </Link>
                     </div>
                   </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-4">
          {products.map((p, index) => {
            const isOut = p.stock <= 0;
            const unit = (p as any).unit ?? "Pcs"; // ganti "p as any" setelah field unit dikonfirmasi
            const imageUrl = (p as any).imageUrl as string | null | undefined;

            return (
              <AnimateOnScroll key={p.id} delay={getDelay(index)} y={18}>
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow duration-200 ease-out hover:shadow-md">

                  <Link href={`/${locale}/produk/${p.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <StockBadge stock={p.stock} unit={unit} t={tKatalog} />
                  <img
                    src={imageUrl || placeholderImages[index % placeholderImages.length]}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 ease-out hover:scale-105"
                  />
                </div>
              </Link>

              <div className="p-2.5 sm:p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#8891A3]">
                  {p.category.name}
                </p>

                <Link href={`/${locale}/produk/${p.id}`}>
                  <h3 className="mt-0.5 line-clamp-2 text-[12.5px] font-semibold leading-tight text-[#182235] transition-colors duration-200 ease-out hover:text-[#1F416B] sm:text-sm">
                    {p.name}
                  </h3>
                </Link>

                <p className="mt-2 text-[10px] text-[#8891A3]">{tKatalog("price")}</p>
                <p className="text-[13px] font-bold text-[#1F416B] sm:text-[15px]">
                  {tc("currencyPrefix")}
                  {p.price.toLocaleString("id-ID")}
                  <span className="ml-1 text-[10px] font-normal text-neutral-400">/ {unit}</span>
                </p>

                <Link
                  href={`/${locale}/produk/${p.id}`}
                  className={`mt-3 block w-full rounded-lg py-2 text-center text-xs font-semibold transition-all duration-200 ease-out ${isOut
                      ? "pointer-events-none bg-[#EFF5FF] text-[#8891A3]"
                      : "bg-[#1F416B] text-white hover:scale-[1.03] hover:bg-[#173555] active:scale-95"
                    }`}
                >
                  {isOut ? tKatalog("outOfStock") : tKatalog("viewDetail")}
                </Link>
              </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5 sm:mt-10">
          <Link
            href={`/${locale}/katalog${buildQuery({ page: currentPage > 1 ? String(currentPage - 1) : undefined })}`}
            aria-disabled={currentPage === 1}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-all duration-200 ease-out ${currentPage === 1
                ? "pointer-events-none border-neutral-200 text-neutral-300"
                : "border-neutral-200 bg-white text-[#535C69] hover:border-[#1F416B]/30 hover:text-[#1F416B]"
              }`}
          >
            ‹
          </Link>

          {getPageNumbers(currentPage, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="flex h-9 min-w-9 items-center justify-center text-sm text-neutral-400">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={`/${locale}/katalog${buildQuery({ page: p === 1 ? undefined : String(p) })}`}
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-all duration-200 ease-out ${p === currentPage
                    ? "border-[#1F416B] bg-[#1F416B] text-white"
                    : "border-neutral-200 bg-white text-[#535C69] hover:border-[#1F416B]/30 hover:text-[#1F416B]"
                  }`}
              >
                {p}
              </Link>
            )
          )}

          <Link
            href={`/${locale}/katalog${buildQuery({ page: currentPage < totalPages ? String(currentPage + 1) : undefined })}`}
            aria-disabled={currentPage === totalPages}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-all duration-200 ease-out ${currentPage === totalPages
                ? "pointer-events-none border-neutral-200 text-neutral-300"
                : "border-neutral-200 bg-white text-[#535C69] hover:border-[#1F416B]/30 hover:text-[#1F416B]"
              }`}
          >
            ›
          </Link>
        </div>
      )}

    </div>
  );
}