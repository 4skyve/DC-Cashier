import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

// Ganti dengan nomor WA admin penjualan asli (atau ambil dari env var)
const ADMIN_WHATSAPP_NUMBER = "6281234567890";

const placeholderImage =
  "https://images.unsplash.com/photo-1621939514649-280e2aa55345?auto=format&fit=crop&w=800&q=80";

const relatedPlaceholderImages = [
  "https://images.unsplash.com/photo-1621939514649-280e2aa55345?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&w=500&q=80",
];

function RelatedStockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="absolute left-2 top-2 rounded-md bg-[#E0405A] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
        Out of Stock
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="absolute left-2 top-2 rounded-md bg-[#E8890C] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
        Low Stock
      </span>
    );
  }
  return (
    <span className="absolute left-2 top-2 rounded-md bg-[#149D50] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
      In Stock
    </span>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product || product.status !== "active") notFound();

  const t = await getTranslations({ locale, namespace: "productDetail" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const tNav = await getTranslations({ locale, namespace: "portalNav" });

  const unit = (product as any).unit ?? "Pcs";
  const imageUrl = (product as any).imageUrl ?? placeholderImage;
  const isOut = product.stock <= 0;
  const isLow = !isOut && product.stock <= 10;

  const waMessage = encodeURIComponent(
    `Halo, saya mau tanya-tanya soal produk "${product.name}" (${tc("currencyPrefix")}${product.price.toLocaleString("id-ID")} / ${unit}).`
  );
  const waHref = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${waMessage}`;

  const relatedProducts = await prisma.product.findMany({
    where: {
      status: "active",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { category: true },
    orderBy: { name: "asc" },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8 sm:py-10 md:px-6 md:py-11 lg:px-0">

      {/* Breadcrumb row */}
      <AnimateOnScroll y={10}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href={`/${locale}/katalog`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#535C69] transition-colors duration-200 ease-out hover:text-[#1F416B]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            {t("backToCatalog") ?? "Kembali ke Produk"}
          </Link>

          <p className="text-[13px] text-[#8891A3]">
            <Link href={`/${locale}`} className="transition-colors duration-200 ease-out hover:text-[#1F416B]">
              Home
            </Link>
            {" / "}
            <Link href={`/${locale}/katalog`} className="transition-colors duration-200 ease-out hover:text-[#1F416B]">
              Produk
            </Link>
            {" / "}
            <span className="font-medium text-[#182235]">{product.name}</span>
          </p>
        </div>
      </AnimateOnScroll>

      {/* Main product section */}
      <div className="mt-5 grid grid-cols-1 gap-6 sm:mt-6 lg:grid-cols-2 lg:gap-10">

        <AnimateOnScroll delay={80} y={16}>
          <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-2xl border border-neutral-200 bg-white sm:max-w-[280px] lg:max-w-[320px]">
            {isOut && (
              <span className="absolute right-3 top-3 rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                {tc("outOfStock") ?? "Habis"}
              </span>
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-contain p-8 transition-transform duration-300 ease-out hover:scale-105"
            />
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={140} y={16}>
          <div>
            <span className="inline-block rounded-full bg-[#EFF5FF] px-3 py-1 text-xs font-semibold text-[#1F416B]">
              {product.category.name}
            </span>

            <h1 className="mt-3 text-2xl font-bold text-[#0E2F55] sm:text-[28px]">
              {product.name}
            </h1>

            <p className="mt-3 text-2xl font-bold text-[#1F416B] sm:text-[26px]">
              {tc("currencyPrefix")}
              {product.price.toLocaleString("id-ID")}
              <span className="ml-1.5 text-sm font-normal text-[#8891A3]">/ {unit}</span>
            </p>

            <div className="mt-4">
              {isOut ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDEDEF] px-3.5 py-1.5 text-[13px] font-semibold text-[#E0405A]">
                  {tc("outOfStock") ?? "Stok Habis"}
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
                  isLow ? "bg-[#FDF3E7] text-[#E8890C]" : "bg-[#E7F6ED] text-[#149D50]"
                }`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.2 14.6-4-4 1.4-1.4 2.6 2.6 6-6 1.4 1.4Z" />
                  </svg>
                  Tersedia — Sisa {product.stock} {unit}
                </span>
              )}
            </div>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-[#1FAF52] active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.6-.1a13.5 13.5 0 0 1-3.8-2.3 11.7 11.7 0 0 1-2.4-2.9c-.6-1-1.1-2-.9-2.9.1-.5.6-1.2 1-1.4.3-.2.7-.2 1 0l.9 1.8c.1.2.1.4 0 .6l-.5.8c-.1.2-.1.4 0 .6a7 7 0 0 0 3.2 3l.7-.7c.2-.2.4-.2.6-.1l1.8.9c.3.2.4.6.3.9Z" />
                </svg>
                {t("orderViaWA")}
              </a>
              <p className="mt-2.5 text-[13px] text-[#8891A3]">
                {t("orderViaWAHint")}
              </p>
          </div>
        </AnimateOnScroll>
      </div>

      {/* Deskripsi + Informasi Produk */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 lg:grid-cols-[1fr_320px] lg:gap-6">

        <AnimateOnScroll delay={100} y={16}>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold text-[#0E2F55] sm:text-lg">{t("productDesc")}</h2>
            <div className="mt-3 border-t border-neutral-100 pt-4">
              <p className="text-[13px] leading-relaxed text-[#535C69] sm:text-sm">
                {product.description || "-"}
              </p>

              {(product as any).highlights?.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {(product as any).highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] text-[#535C69] sm:text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1F416B]" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={160} y={16}>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-bold text-[#0E2F55] sm:text-lg">Informasi Produk</h2>

            <dl className="mt-3 divide-y divide-neutral-100 border-t border-neutral-100">
              <div className="flex items-center justify-between gap-3 py-3">
                <dt className="text-[13px] text-[#8891A3]">Nama Produk</dt>
                <dd className="text-right text-[13px] font-semibold text-[#182235]">{product.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <dt className="text-[13px] text-[#8891A3]">Kategori</dt>
                <dd className="text-right text-[13px] font-semibold text-[#182235]">{product.category.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <dt className="text-[13px] text-[#8891A3]">Satuan</dt>
                <dd className="text-right text-[13px] font-semibold text-[#182235]">{unit}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <dt className="text-[13px] text-[#8891A3]">Status Stok</dt>
                <dd className={`text-right text-[13px] font-semibold ${
                  isOut ? "text-[#E0405A]" : isLow ? "text-[#E8890C]" : "text-[#149D50]"
                }`}>
                  {isOut ? "Habis" : isLow ? "Terbatas" : "Ready Stock"}
                </dd>
              </div>
            </dl>
          </div>
        </AnimateOnScroll>
      </div>

      {/* Produk Lainnya */}
      {relatedProducts.length > 0 && (
        <div className="mt-10 sm:mt-12">
          <AnimateOnScroll y={12}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0E2F55] sm:text-xl">{t("relatedProducts")}</h2>
              <Link
                href={`/${locale}/katalog?category=${product.categoryId}`}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#1F416B] transition-colors duration-200 ease-out hover:text-[#173555]"
              >
                {tNav("viewAll")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </div>
          </AnimateOnScroll>

          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(148px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-4">
            {relatedProducts.map((rp, index) => {
              const rpUnit = (rp as any).unit ?? "Pcs";
              return (
                <AnimateOnScroll key={rp.id} delay={Math.min(index * 60, 320)} y={16}>
                  <Link
                    href={`/${locale}/produk/${rp.id}`}
                    className="block overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow duration-200 ease-out hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                      <RelatedStockBadge stock={rp.stock} />
                                            <img
                        src={(rp as any).imageUrl || relatedPlaceholderImages[index % relatedPlaceholderImages.length]}
                        alt={rp.name}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out hover:scale-105"
                      />
                    </div>
                    <div className="p-2.5 sm:p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#8891A3]">
                        {rp.category.name}
                      </p>
                      <h3 className="mt-0.5 line-clamp-2 text-[12.5px] font-semibold leading-tight text-[#182235] sm:text-sm">
                        {rp.name}
                      </h3>
                      <p className="mt-2 text-[13px] font-bold text-[#1F416B] sm:text-[15px]">
                        {tc("currencyPrefix")}
                        {rp.price.toLocaleString("id-ID")}
                        <span className="ml-1 text-[10px] font-normal text-neutral-400">/ {rpUnit}</span>
                      </p>
                    </div>
                  </Link>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}