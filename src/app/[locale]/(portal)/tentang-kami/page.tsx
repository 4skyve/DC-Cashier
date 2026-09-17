import Link from "next/link";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { ClickableImage } from "@/components/portal/clickable-image";

export default async function TentangKamiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const heroImage =
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=85";

  const snackImage =
    "https://images.unsplash.com/photo-1597757288540-e00dda4014db?q=80&w=1979&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const galleryImages = [
    {
      src: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=700&q=85",
      alt: "Gudang penyimpanan snack",
    },
    {
      src: "https://plus.unsplash.com/premium_photo-1681426730828-bfee2d13861d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2FyZWhvdXNlfGVufDB8fDB8fHww",
      alt: "Tim operasional gudang",
    },
    {
      src: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=700&q=85",
      alt: "Proses pengemasan produk",
    },
  ];

  return (
    <main className="bg-[#EEF3FF]">

      {/* HERO*/}
      <section className="relative h-[300px] overflow-hidden sm:h-[360px] md:h-[420px] lg:h-[465px]">

        {/* Background */}
        <div className="absolute inset-0">
          <ClickableImage
            src={heroImage}
            alt="Gudang Duo Caesar Commerce"
            className="h-full w-full"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-[#1F416B]/45" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex h-full items-center justify-center px-5 text-center">
          <AnimateOnScroll y={20}>
            <div className="mx-auto max-w-[760px] text-white">

              <h1 className="text-[clamp(1.5rem,5vw,2.75rem)] font-bold leading-[1.2] tracking-tight">
                Tentang Duo Caesar 
              </h1>

              <p className="mx-auto mt-3 max-w-[600px] text-[13px] leading-6 text-white/90 sm:mt-4 sm:text-sm md:text-base">
                Mitra terpercaya Anda untuk kebutuhan grosir makanan ringan
                premium dan kebutuhan bisnis.
              </p>

            </div>
          </AnimateOnScroll>
        </div>
      </section>


      {/* PROFIL TOKO*/}
      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:py-16 md:px-6 md:py-20 lg:px-0">

        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 md:grid-cols-2 md:gap-16">

          {/* TEXT */}
          <AnimateOnScroll y={16}>
            <div>

              <p className="text-xs font-bold tracking-wide text-[#1F416B]">
                PROFIL 
              </p>

              <h2 className="mt-2 max-w-[500px] text-2xl font-bold leading-tight text-[#0E2F55] sm:text-3xl md:text-[34px]">
                Distributor Snack Terpercaya
                <br />
                untuk Bisnis Anda
              </h2>

              <p className="mt-4 max-w-[540px] text-[13px] leading-6 text-[#5F6878] sm:mt-5 sm:text-sm">
                Duo Caesar bukan sekadar pemasok, kami adalah mitra
                pertumbuhan Anda. Kami hadir sebagai toko snack grosir yang
                menyediakan beragam produk makanan ringan untuk memenuhi
                kebutuhan usaha dengan mudah dan efisien.
              </p>

              <p className="mt-3 max-w-[540px] text-[13px] leading-6 text-[#5F6878] sm:text-sm">
                Kami berkomitmen memberikan proses pemesanan dan distribusi
                yang praktis, transparan, serta dapat diandalkan untuk
                mendukung perkembangan bisnis pelanggan.
              </p>

            </div>
          </AnimateOnScroll>


          {/* IMAGE */}
          <AnimateOnScroll delay={120} y={24}>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                <ClickableImage
                  src={snackImage}
                  alt="Produk snack Duo Caesar Commerce"
                  className="aspect-[4/3] w-full sm:aspect-[5/4]"
                />
              </div>

              {/* Decorative accent */}
              <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-2xl border-2 border-[#1F416B]/15 sm:-bottom-4 sm:-right-4" />
            </div>
          </AnimateOnScroll>

        </div>
      </section>


      {/* GALERI SINGKAT*/}
      <section className="mx-auto max-w-[1200px] px-5 pb-12 sm:pb-16 md:px-6 lg:px-0">

        <AnimateOnScroll>
          <div className="mb-5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1F416B]" />
            <p className="text-xs font-bold uppercase tracking-wide text-[#1F416B]">
              Di Balik Layar
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {galleryImages.map((img, index) => (
            <AnimateOnScroll key={img.alt} delay={index * 90} y={18}>
              <div className="overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-md">
                <ClickableImage
                  src={img.src}
                  alt={img.alt}
                  className="aspect-[4/3]"
                />
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>


      {/* MISI & NILAI INTI*/}
      <section className="mx-auto max-w-[1200px] px-5 pb-12 sm:pb-16 md:px-6 lg:px-0">

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-[1.7fr_.8fr]">

          {/* MISI */}
          <AnimateOnScroll y={20}>
            <div className="relative h-full overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 shadow-[0_8px_25px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] sm:p-7 md:p-8">

              {/* Decorative circle */}
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#FFF3DE]/60" />

              {/* Icon */}
              <div className="relative mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF3DE] text-[#A96500] sm:h-10 sm:w-10">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9h18" />
                  <path d="M4 9v10h16V9" />
                  <path d="M3 9l2-5h14l2 5" />
                  <path d="M8 19v-6h8v6" />
                </svg>
              </div>

              <h2 className="relative text-lg font-bold text-[#182235] sm:text-xl md:text-[22px]">
                Misi Kami
              </h2>

              <p className="relative mt-3 max-w-[760px] text-[13px] leading-6 text-[#687182] sm:mt-4 sm:text-sm">
                Misi kami adalah mendukung pertumbuhan usaha toko ritel,
                reseller, dan berbagai kebutuhan bisnis lainnya dengan
                menyediakan pasokan merek-merek terpercaya secara konsisten.
                Kami berupaya menjembatani produsen berkualitas dengan pasar
                yang membutuhkan melalui sistem distribusi yang efisien.
              </p>

            </div>
          </AnimateOnScroll>


          {/* NILAI INTI */}
          <AnimateOnScroll delay={100} y={20}>
            <div className="relative h-full overflow-hidden rounded-xl bg-[#1F416B] p-5 text-white shadow-[0_8px_25px_rgba(0,0,0,0.08)] sm:p-7 md:p-8">

              {/* Decorative circles */}
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[#17385F]" />
              <div className="absolute right-5 top-5 h-1.5 w-1.5 rounded-full bg-[#F4C9B8]" />

              <h2 className="relative text-lg font-bold sm:text-xl md:text-[22px]">
                Nilai Inti
              </h2>

              <div className="relative mt-4 space-y-3 sm:mt-5 sm:space-y-4">

                {[
                  "Keandalan",
                  "Kualitas Terpercaya",
                  "Transparansi",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 text-[13px] text-white/90 transition-transform duration-200 hover:translate-x-1 sm:text-sm"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="m8 12 2.5 2.5L16 9" />
                    </svg>

                    <span>{item}</span>
                  </div>
                ))}

              </div>

            </div>
          </AnimateOnScroll>

        </div>
      </section>


      {/* CTA */}
      <section className="mx-auto max-w-[1200px] px-5 pb-12 sm:pb-16 md:px-6 lg:px-0">

        <AnimateOnScroll y={20}>
          <div className="relative overflow-hidden rounded-2xl bg-[#1F416B] px-6 py-9 text-center text-white sm:py-12 md:px-10 md:py-14">

            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.04]" />
            <div className="absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-[#17385F]" />

            <div className="relative z-10">
              <h2 className="text-xl font-bold sm:text-2xl md:text-[30px]">
                Temukan Produk Favorit Anda
              </h2>

              <p className="mx-auto mt-3 max-w-[600px] text-[13px] leading-6 text-white/80 sm:mt-4 sm:text-sm">
                Jelajahi katalog lengkap kami dan temukan berbagai penawaran
                menarik untuk mengembangkan bisnis Anda hari ini.
              </p>

              <Link
                href={`/${locale}/katalog`}
                className="mt-6 inline-flex rounded-lg bg-[#E8F0FF] px-6 py-3 text-xs font-semibold text-[#1F416B] transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-white active:scale-95 active:translate-y-0 sm:text-sm"
              >
                Lihat Produk
              </Link>
            </div>

          </div>
        </AnimateOnScroll>

      </section>

    </main>
  );
}