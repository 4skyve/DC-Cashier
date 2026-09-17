import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getActiveProducts, getCategories, getTopSellingProducts } from "@/actions/product";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { ClickableImage } from "@/components/portal/clickable-image";
import { TypewriterHeading } from "@/components/portal/typewriter-heading";

/* MANUAL ICONS  */
function IconPackage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </svg>
  );
}

function IconPercent({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function IconBoxes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="10" width="8" height="8" rx="1" />
      <rect x="13" y="6" width="8" height="8" rx="1" />
    </svg>
  );
}

function IconZap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2 3 14h6l-1 8 10-13h-6l1-7z" />
    </svg>
  );
}

function IconSmile({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 13.5s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9.5" x2="9.01" y2="9.5" />
      <line x1="15" y1="9.5" x2="15.01" y2="9.5" />
    </svg>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.5l-1.45 1.35Z" />
    </svg>
  );
}

function IconChat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.5 2 2 5.9 2 10.7c0 2.4 1.1 4.6 3 6.2-.2 1.3-.7 2.6-1.6 3.7 1.6-.1 3.1-.6 4.4-1.4 1.3.5 2.7.7 4.2.7 5.5 0 10-3.9 10-8.7S17.5 2 12 2Z" />
    </svg>
  );
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "portal",
  });

  const tc = await getTranslations({
    locale,
    namespace: "common",
  });

  const tNav = await getTranslations({
    locale,
    namespace: "portalNav",
  });

  const [products, categories, topSellingData] = await Promise.all([
    getActiveProducts(),
    getCategories(),
    getTopSellingProducts(5),
  ]);

  const topSellingIds = new Set(topSellingData.map((item) => item.productId));
  const featured = products.filter((p) => topSellingIds.has(p.id)).slice(0, 5);

  const heroImage =
    "https://images.unsplash.com/photo-1620766958102-af71b50639cf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const aboutImage =
    "https://images.unsplash.com/photo-1554702309-b733f9d3a552?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const categoryImages = [
    "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1621939514649-280e2aa55345?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&w=500&q=80",
  ];

  const productImages = [
    "https://images.unsplash.com/photo-1621939514649-280e2aa55345?auto=format&fit=crop&w=700&q=85",
    "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=700&q=85",
    "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=700&q=85",
    "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=700&q=85",
  ];

  const whyUsItems = [
    {
      icon: IconPackage,
      title: "Produk Lengkap",
      desc: "Ribuan pilihan snack dari berbagai merek favorit.",
    },
    {
      icon: IconPercent,
      title: "Harga Grosir Terbaik",
      desc: "Harga kompetitif khusus untuk pembelian grosir.",
    },
    {
      icon: IconBoxes,
      title: "Stok Terjamin",
      desc: "Stok selalu update dan siap memenuhi kebutuhan Anda.",
    },
    {
      icon: IconZap,
      title: "Pelayanan Cepat",
      desc: "Proses pelayanan cepat dan langsung dilayani.",
    },
    {
      icon: IconSmile,
      title: "Pelayanan Ramah",
      desc: "Kami siap membantu Anda kapan saja.",
    },
  ];

  // Gambar kategori: ambil random dari salah satu produk yang ada di kategori tsb 
  const categoryImageMap = new Map<string, string>();
  for (const category of categories) {
    const categoryProducts = products.filter(
      (p) => p.categoryId === category.id && (p as any).imageUrl
    );
    if (categoryProducts.length > 0) {
      const randomProduct =
        categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
      categoryImageMap.set(category.id, (randomProduct as any).imageUrl);
    }
  }

  return (
    <div className="bg-[#EEF3FF]">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-b-[28px] bg-[#1F416B] text-white sm:rounded-b-[36px]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 px-5 py-10 sm:gap-10 sm:py-14 md:grid-cols-2 md:px-6 md:py-20 lg:px-0">

          {/* Hero Text */}
          <div>
            <AnimateOnScroll y={16}>
              <TypewriterHeading
                lines={["Grosir Snack", "Lengkap Untuk", "Usaha & Kebutuhan Anda"]}
                className="max-w-[560px] text-[clamp(1.75rem,5.5vw,3rem)] font-bold leading-[1.15] tracking-tight"
              />
            </AnimateOnScroll>

            <AnimateOnScroll delay={90} y={14}>
              <p className="mt-4 max-w-[500px] text-[13px] leading-6 text-white/75 sm:mt-5 sm:text-sm md:text-[15px]">
                Pilihan snack terlengkap dari berbagai merek favorit
                dengan harga grosir terbaik dan stok selalu siap.
              </p>
            </AnimateOnScroll>

            {/* Buttons */}
            <AnimateOnScroll delay={180} y={12}>
              <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">
                <Link
                  href={`/${locale}/katalog`}
                  className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#1F416B] transition hover:scale-105 hover:bg-white/90 active:scale-95 sm:px-6 sm:py-3 sm:text-sm"
                >
                  Jelajahi Produk
                </Link>

                <Link
                  href={`/${locale}/kontak`}
                  className="rounded-full border border-white/50 px-5 py-2.5 text-xs font-semibold text-white transition hover:scale-105 hover:bg-white/10 active:scale-95 sm:px-6 sm:py-3 sm:text-sm"
                >
                  Hubungi Kami
                </Link>
              </div>
            </AnimateOnScroll>

            {/* Features */}
            <AnimateOnScroll delay={270} y={10}>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-white/75 sm:mt-7 sm:gap-x-6 sm:gap-y-3 sm:text-xs">
                <span className="flex items-center gap-1.5">
                  <IconPackage className="h-3.5 w-3.5" /> Banyak pilihan
                </span>
                <span className="flex items-center gap-1.5">
                  <IconPercent className="h-3.5 w-3.5" /> Harga Grosir Terbaik
                </span>
                <span className="flex items-center gap-1.5">
                  <IconBoxes className="h-3.5 w-3.5" /> Stok Selalu Tersedia
                </span>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Hero Image */}
          <AnimateOnScroll delay={200} y={24}>
            <div className="group overflow-hidden rounded-xl bg-white/10 sm:rounded-sm">
              <ClickableImage
                src={heroImage}
                alt="Snack grosir"
                className="aspect-[4/3] transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </AnimateOnScroll>
        </div>
      </section>


      {/* CATEGORY*/}
      <section className="relative z-10 mx-auto -mt-6 max-w-[1120px] px-5 sm:-mt-7 md:px-6 lg:px-0">
        <AnimateOnScroll>
          <div className="rounded-2xl bg-white p-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:p-5 md:p-6">

            <div className="mb-4 flex items-center justify-between sm:mb-5">
              <AnimateOnScroll y={10}>
                <h2 className="text-base font-bold text-[#182235] sm:text-lg md:text-xl">
                  Pilih Berdasarkan Kategori
                </h2>
              </AnimateOnScroll>

              <AnimateOnScroll delay={80} y={10}>
                <Link
                  href={`/${locale}/katalog`}
                  className="hidden text-xs font-semibold text-[#1F416B] transition hover:underline md:block"
                >
                  {tNav("viewAllCategories")}
                </Link>
              </AnimateOnScroll>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-6">

              {/* Semua kategori */}
              <AnimateOnScroll y={14}>
                <Link
                  href={`/${locale}/katalog`}
                  className="flex min-h-[74px] w-full flex-col items-center justify-center rounded-xl border border-blue-100 bg-[#EFF5FF] p-2.5 text-center transition hover:shadow-sm sm:min-h-[82px] sm:p-3"
                >
                  <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#DCEAFF] text-[#1F416B] sm:mb-2 sm:h-8 sm:w-8">
                    <IconGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>

                  <span className="text-[11px] font-semibold text-[#253044] sm:text-xs text-center leading-tight">
                    {tNav("all")}
                    <br />
                    {t("categoryTitle")}
                  </span>
                </Link>
              </AnimateOnScroll>

              {/* Categories */}
              {categories.slice(0, 5).map((category, index) => (
                <AnimateOnScroll key={category.id} delay={(index + 1) * 70} y={14}>
                  <Link
                    href={`/${locale}/katalog?category=${category.id}`}
                    className="flex min-h-[74px] w-full flex-col items-center justify-center rounded-xl border border-neutral-100 bg-white p-2 text-center transition hover:border-blue-100 hover:shadow-sm sm:min-h-[82px]"
                  >
                    <div className="group mb-1.5 h-7 w-12 overflow-hidden rounded-md bg-neutral-100 sm:mb-2 sm:h-8 sm:w-14">
                      <ClickableImage
                        src={categoryImageMap.get(category.id) || categoryImages[index % categoryImages.length]}
                        alt={category.name}
                        className="h-full w-full transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    <span className="text-[11px] font-semibold text-[#253044] sm:text-xs">
                      {category.name}
                    </span>
                  </Link>
                </AnimateOnScroll>
              ))}

            </div>
          </div>
        </AnimateOnScroll>
      </section>


      {/* =====================================================
          TENTANG KAMI
      ===================================================== */}
      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:py-16 md:px-6 md:py-20 lg:px-0">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 md:grid-cols-2 md:gap-16 lg:gap-20">

          {/* IMAGE LEFT */}
          <AnimateOnScroll className="order-2 md:order-1" y={24}>
            <div className="group overflow-hidden rounded-2xl">
              <ClickableImage
                src={aboutImage}
                alt="Tentang DCS Commerce"
                className="aspect-[5/4] transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </AnimateOnScroll>

          {/* TEXT RIGHT */}
          <div className="order-1 md:order-2">
            <AnimateOnScroll delay={60} y={12}>
              <p className="text-xs font-bold tracking-wide text-[#1F416B]">
                TENTANG KAMI
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={130} y={16}>
              <h2 className="mt-2 max-w-[470px] text-2xl font-bold leading-tight text-[#182235] sm:text-3xl md:text-[34px]">
                Partner Terbaik Untuk
                <br />
                Kebutuhan Snack Anda
              </h2>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200} y={14}>
              <p className="mt-3 max-w-[500px] text-[13px] leading-6 text-[#667085] sm:mt-4 sm:text-sm">
                SnackGrosir hadir untuk menyediakan berbagai pilihan snack
                berkualitas dari merek terkenal dengan harga grosir yang
                terjangkau. Kami melayani toko, reseller, dan kebutuhan acara
                dengan pelayanan cepat dan ramah.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={270} y={10}>
              <Link
                href={`/${locale}/tentang-kami`}
                className="mt-5 inline-flex rounded-full bg-[#1F416B] px-5 py-3 text-xs font-semibold text-white transition hover:scale-105 hover:bg-[#173555] active:scale-95"
              >
                Selengkapnya Tentang Kami →
              </Link>
            </AnimateOnScroll>
          </div>

        </div>
      </section>


      {/* PRODUK TERLARIS*/}
      <section className="mx-auto max-w-[1200px] px-5 pb-12 sm:pb-16 md:px-6 lg:px-0">

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5">
          <AnimateOnScroll>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#182235] sm:text-xl">
                Produk Terlaris
              </h2>

              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[9px] font-semibold text-[#1F416B]">
                <IconHeart className="h-2.5 w-2.5" /> Paling Banyak Dibeli
              </span>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={80}>
            <Link
              href={`/${locale}/katalog`}
              className="text-xs font-semibold text-[#1F416B] transition hover:underline"
            >
              {tNav("viewAllProducts")} →
            </Link>
          </AnimateOnScroll>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-5">

          {featured.map((product, index) => (
            <AnimateOnScroll key={product.id} delay={index * 90} y={20}>
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

                {/* Image */}
                <div className="group relative aspect-[1.35/1] overflow-hidden bg-neutral-100">
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-[#1F416B] px-2 py-1 text-[8px] font-semibold text-white">
                    TERLARIS
                  </span>

                  <ClickableImage
                    src={(product as any).imageUrl || productImages[index % productImages.length]}
                    alt={product.name}
                    className="h-full w-full transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Product info */}
                <div className="p-2.5 sm:p-3">

                  <Link href={`/${locale}/produk/${product.id}`}>
                    <h3 className="truncate text-xs font-semibold text-[#253044] hover:text-[#1F416B]">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-3 sm:mt-4">
                    <span className="text-sm font-bold text-[#1F416B]">
                      {tc("currencyPrefix")}
                      {product.price.toLocaleString("id-ID")}
                    </span>

                    <span className="ml-1 text-[10px] text-neutral-400">
                      / Pack
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] font-medium text-emerald-600">
                    Stok: {product.stock} Pack
                  </p>

                </div>
              </div>
            </AnimateOnScroll>
          ))}

        </div>
      </section>


      {/* CTA*/}
      <section className="mx-auto max-w-[1200px] px-5 pb-12 sm:pb-16 md:px-6 lg:px-0">
        <div className="rounded-2xl bg-[#1F416B] px-6 py-9 text-white sm:py-10 md:px-8 md:py-12">

          <AnimateOnScroll y={14}>
            <h2 className="text-xl font-bold sm:text-2xl md:text-[25px]">
              {t("ctaTitle")}
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll delay={90} y={12}>
            <p className="mt-3 max-w-[470px] text-xs leading-5 text-white/70">
              {t("ctaSubtitle")}
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll delay={180} y={10}>
            <a
              href="https://wa.me/6281234567890"
              className="mt-6 inline-flex items-center rounded-full bg-white px-5 py-3 text-xs font-bold text-[#182235] transition hover:scale-105 hover:bg-neutral-100 active:scale-95"
            >
              <span className="relative mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                <IconChat className="h-3 w-3" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-green-400" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-500" />
              </span>
              {t("ctaButton")}
            </a>
          </AnimateOnScroll>

        </div>
      </section>


      {/* KENAPA MEMILIH KAMI */}
      <section className="mx-auto max-w-[1200px] px-5 pb-12 sm:pb-16 md:px-6 lg:px-0">

        <AnimateOnScroll>
          <h2 className="text-lg font-bold text-[#182235] sm:text-xl">
            Kenapa Memilih Kami?
          </h2>
        </AnimateOnScroll>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-3 md:grid-cols-5">

          {whyUsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimateOnScroll key={item.title} delay={index * 80} y={18}>
                <div className="h-full rounded-xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5">

                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF5FF] text-[#1F416B] sm:h-10 sm:w-10">
                    <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  </div>

                  <h3 className="mt-3 text-xs font-bold text-[#253044] sm:mt-4">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-[10px] leading-4 text-neutral-400">
                    {item.desc}
                  </p>

                </div>
              </AnimateOnScroll>
            );
          })}

        </div>
      </section>

    </div>
  );
}