import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

export default async function KontakPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <main className="min-h-screen bg-[#EEF3FF]">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <section className="mx-auto max-w-[1200px] px-5 pt-8 sm:pt-10 md:px-6 lg:px-0">

        <AnimateOnScroll y={14}>
          <div className="text-center">

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCEAFF] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1F416B] sm:text-[11px]">
              ● {t("badge")}
            </span>

            <h1 className="mt-3 text-[clamp(1.5rem,4.5vw,2.1rem)] font-bold leading-[1.2] tracking-tight text-[#0E2F55]">
              {t("title")}
            </h1>

            <p className="mx-auto mt-2.5 max-w-[600px] text-[12.5px] leading-6 text-[#4F5969] sm:text-[13px]">
              {t("subtitle")}
            </p>

          </div>
        </AnimateOnScroll>
      </section>


      {/* =====================================================
          CONTACT CARDS
      ===================================================== */}
      <section className="mx-auto max-w-[1200px] px-5 pt-6 sm:pt-8 md:px-6 lg:px-0">

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">

          {/* WHATSAPP */}
          <AnimateOnScroll delay={0} y={16}>
            <div className="group relative min-h-[140px] overflow-hidden rounded-xl border border-[#DCE2EC] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#22D56B]/40 hover:shadow-md sm:p-5">

              <div className="absolute right-0 top-0 h-14 w-14 -translate-y-6 translate-x-6 rounded-full bg-[#22D56B]/10 transition-transform duration-300 group-hover:scale-125" />

              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#E4FBEE] text-[#149D50] transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.8 8.8 0 0 1-4-.9L3 20l1.1-4.7a8.3 8.3 0 0 1-1-4.1 8.4 8.4 0 0 1 8.4-8.4 8.5 8.5 0 0 1 9.5 8.7Z" />
                  <path d="M8.5 9.5c.2 1.5 2.4 3.7 4 4 1 .2 1.8-.3 2.1-1l-1.2-.8c-.3-.2-.6-.1-.8.2l-.4.5c-.8-.3-1.5-.9-2-1.7l.4-.5c.2-.3.2-.6 0-.8l-.8-1.1c-.3-.3-.7-.2-1 .1-.3.3-.4.7-.3 1.1Z" />
                </svg>
              </div>

              <h2 className="relative mt-3 text-[15px] font-bold text-[#0E2F55] sm:text-base">
                {t("whatsapp")}
              </h2>

              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-1 block text-[12.5px] text-[#535C69] transition hover:text-[#149D50] hover:underline"
              >
                +62 812-3456-7890
              </a>

            </div>
          </AnimateOnScroll>


          {/* EMAIL */}
          <AnimateOnScroll delay={90} y={16}>
            <div className="group relative min-h-[140px] overflow-hidden rounded-xl border border-[#DCE2EC] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/40 hover:shadow-md sm:p-5">

              <div className="absolute right-0 top-0 h-14 w-14 -translate-y-6 translate-x-6 rounded-full bg-[#3B82F6]/10 transition-transform duration-300 group-hover:scale-125" />

              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#E5EEFF] text-[#2563EB] transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>

              <h2 className="relative mt-3 text-[15px] font-bold text-[#0E2F55] sm:text-base">
                {t("email")}
              </h2>

              <a
                href="mailto:sales@snackwholesale.com"
                className="relative mt-1 block break-all text-[12.5px] text-[#535C69] transition hover:text-[#2563EB] hover:underline"
              >
                duocaesar@gmail.com
              </a>

            </div>
          </AnimateOnScroll>


          {/* ALAMAT */}
          <AnimateOnScroll delay={180} y={16}>
            <div className="group relative min-h-[140px] overflow-hidden rounded-xl border border-[#DCE2EC] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#F59E0B]/40 hover:shadow-md sm:p-5">

              <div className="absolute right-0 top-0 h-14 w-14 -translate-y-6 translate-x-6 rounded-full bg-[#F59E0B]/10 transition-transform duration-300 group-hover:scale-125" />

              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF3DE] text-[#B4700C] transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </div>

              <h2 className="relative mt-3 text-[15px] font-bold text-[#0E2F55] sm:text-base">
                {t("address")}
              </h2>

              <p className="relative mt-1 text-[12.5px] leading-5 text-[#535C69]">
                Jl. Tanimbar No. 22, Kota Malang 
              </p>

            </div>
          </AnimateOnScroll>

        </div>
      </section>


      {/* =====================================================
          OPERASIONAL + CTA
      ===================================================== */}
      <section className="mx-auto max-w-[1200px] px-5 py-9 pb-14 sm:py-10 sm:pb-16 md:px-6 lg:px-0">

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">

          {/* JAM OPERASIONAL */}
          <AnimateOnScroll delay={0} y={18}>
            <div className="relative overflow-hidden rounded-xl border border-[#DCE2EC] bg-white p-5 shadow-sm sm:p-6">

              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#1F416B] to-[#3B82F6]" />

              <div className="flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E2F55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>

                <h2 className="text-[15px] font-bold text-[#0E2F55] sm:text-base">
                  {t("operationalHours")}
                </h2>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between border-b border-[#DCE2EC] py-2.5 transition-colors duration-200 hover:bg-black/[0.015]">
                  <span className="text-[12.5px] text-[#535C69]">{t("mondayFriday")}</span>
                  <span className="text-[11px] font-bold text-[#0E2F55] sm:text-xs">08.00 - 17.00 WIB</span>
                </div>

                <div className="flex items-center justify-between border-b border-[#DCE2EC] py-2.5 transition-colors duration-200 hover:bg-black/[0.015]">
                  <span className="text-[12.5px] text-[#535C69]">{t("saturday")}</span>
                  <span className="text-[11px] font-bold text-[#0E2F55] sm:text-xs">08.00 - 14.00 WIB</span>
                </div>

                <div className="flex items-center justify-between py-2.5 transition-colors duration-200 hover:bg-black/[0.015]">
                  <span className="text-[12.5px] text-[#535C69]">{t("sunday")}</span>
                  <span className="text-[11px] font-bold text-[#0E2F55] sm:text-xs">07.00 - 19.00 WIB</span>
                </div>
              </div>

            </div>
          </AnimateOnScroll>


          {/* CTA */}
          <AnimateOnScroll delay={100} y={18}>
            <div className="relative overflow-hidden rounded-xl bg-[#1F416B] px-5 py-7 text-center sm:px-7 sm:py-8">

              {/* Decorative circles */}
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/[0.04]" />
              <div className="absolute -bottom-10 -left-6 h-20 w-20 rounded-full bg-[#17385F]" />
              <div className="absolute right-6 top-6 h-1.5 w-1.5 rounded-full bg-[#22D56B]" />
              <div className="absolute right-10 top-9 h-1 w-1 rounded-full bg-white/40" />

              <div className="relative z-10 flex flex-col items-center justify-center">

                <h2 className="text-lg font-bold text-white sm:text-xl">
                  {t("ctaTitle")}
                </h2>

                <p className="mt-2.5 max-w-[380px] text-[12.5px] leading-5 text-[#A7BCD9]">
                  {t("ctaSubtitle")}
                </p>

                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#22D56B] px-5 py-2.5 text-[12.5px] font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#1FC561] hover:shadow-lg active:scale-95 sm:text-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.8 8.8 0 0 1-4-.9L3 20l1.1-4.7a8.3 8.3 0 0 1-1-4.1 8.4 8.4 0 0 1 8.4-8.4 8.5 8.5 0 0 1 9.5 8.7Z" />
                    <path d="M8.5 9.5c.2 1.5 2.4 3.7 4 4 1 .2 1.8-.3 2.1-1l-1.2-.8c-.3-.2-.6-.1-.8.2l-.4.5c-.8-.3-1.5-.9-2-1.7l.4-.5c.2-.3.2-.6 0-.8l-.8-1.1c-.3-.3-.7-.2-1 .1-.3.3-.4.7-.3 1.1Z" />
                  </svg>
                  {t("ctaButton")}
                </a>

              </div>

            </div>
          </AnimateOnScroll>

        </div>
      </section>

    </main>
  );
}