import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { Mail } from "lucide-react";

export default async function PortalFooter({
  locale,
}: {
  locale: string;
}) {
  const t = await getTranslations({
    locale,
    namespace: "portalFooter",
  });

  const setting = await prisma.storeSetting.findFirst();

  const storeName = setting?.storeName ?? "DCS Commerce";

  const navLinkClass =
    "group relative w-fit text-[15px] text-white/75 transition-colors duration-200 hover:text-white";

  return (
    <footer className="bg-[#1F416B] text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-0 md:py-11">
        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">

          {/* Brand */}
          <AnimateOnScroll delay={0} y={20}>
            <div>
              <h2 className="mb-4 text-[23px] font-bold tracking-tight text-white">
                {storeName}
              </h2>

              <p className="mb-4 text-[13px] font-semibold text-[#F4C9B8]">
                Pusat Grosir Snack Berkualitas
              </p>

              <p className="max-w-[270px] text-[15px] leading-6 text-white/75">
                Penyedia utama kebutuhan snack grosir untuk bisnis Anda.
                Memberikan kualitas dan harga terbaik.
              </p>

              {/* Social Media */}
              <div className="mt-7 flex items-center gap-4">
               <a 
                  href="#"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:scale-110 hover:bg-[#F4C9B8] hover:text-[#1F416B] active:scale-95"
                >
                  {/* Instagram */}
                   <img
                      src="https://cdn.simpleicons.org/instagram/ffffff"
                      alt="Instagram"
                      className="h-5 w-5 object-contain"
                    />
                </a>

                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:scale-110 hover:bg-[#F4C9B8] hover:text-[#1F416B] active:scale-95"
                >
                  {/* Facebook */}
                    <img
                      src="https://cdn.simpleicons.org/facebook/ffffff"
                      alt="facebook"
                      className="h-5 w-5 object-contain"
                    />
                </a>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Navigation */}
          <AnimateOnScroll delay={80} y={20}>
            <div>
              <h3 className="mb-5 text-[12px] font-bold uppercase tracking-wide text-white">
                NAVIGASI
              </h3>

              <nav className="flex flex-col gap-3">
                <Link href={`/${locale}`} className={navLinkClass}>
                  Beranda
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#F4C9B8] transition-all duration-300 group-hover:w-full" />
                </Link>

                <Link href={`/${locale}/katalog`} className={navLinkClass}>
                  Produk
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#F4C9B8] transition-all duration-300 group-hover:w-full" />
                </Link>

                <Link href={`/${locale}/tentang-kami`} className={navLinkClass}>
                  Tentang Kami
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#F4C9B8] transition-all duration-300 group-hover:w-full" />
                </Link>

                <Link href={`/${locale}/faq`} className={navLinkClass}>
                  FAQ
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#F4C9B8] transition-all duration-300 group-hover:w-full" />
                </Link>

                <Link href={`/${locale}/kontak`} className={navLinkClass}>
                  Kontak
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#F4C9B8] transition-all duration-300 group-hover:w-full" />
                </Link>
              </nav>
            </div>
          </AnimateOnScroll>

          {/* Products */}
          <AnimateOnScroll delay={160} y={20}>
            <div>
              <h3 className="mb-5 text-[12px] font-bold uppercase tracking-wide text-white">
                PRODUK KAMI
              </h3>

              <nav className="flex flex-col gap-3">
                <Link href={`/${locale}/katalog?brand=nabati`} className={navLinkClass}>
                  Nabati
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#F4C9B8] transition-all duration-300 group-hover:w-full" />
                </Link>

                <Link href={`/${locale}/katalog?brand=oreo`} className={navLinkClass}>
                  Oreo
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#F4C9B8] transition-all duration-300 group-hover:w-full" />
                </Link>

                <Link href={`/${locale}/katalog?brand=chitato`} className={navLinkClass}>
                  Chitato
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#F4C9B8] transition-all duration-300 group-hover:w-full" />
                </Link>

                <Link href={`/${locale}/katalog?brand=tango`} className={navLinkClass}>
                  Tango
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#F4C9B8] transition-all duration-300 group-hover:w-full" />
                </Link>

                <Link
                  href={`/${locale}/katalog`}
                  className="mt-1 inline-flex w-fit items-center gap-1 text-[14px] font-medium text-[#F4C9B8] transition-all duration-200 hover:gap-2 hover:text-white"
                >
                  Lihat Semua
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </nav>
            </div>
          </AnimateOnScroll>

          {/* Contact */}
          <AnimateOnScroll delay={240} y={20}>
            <div>
              <h3 className="mb-5 text-[12px] font-bold uppercase tracking-wide text-white">
                HUBUNGI KAMI
              </h3>

              <div className="flex flex-col gap-5">

                {/* Address */}
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-[20px] text-[#F4C9B8]">
                    ⌖
                  </span>

                  <p className="text-[15px] leading-6 text-white/75">
                    {setting?.storeAddress || (
                      <>
                        Jl. Tanimbar No. 22
                        <br />
                        Kota Malang, 62726
                      </>
                    )}
                  </p>
                </div>

                {/* Phone */}
                <a
                  href={`tel:${(setting?.storePhone ?? "+6281234567890").replace(/\s|-/g, "")}`}
                  className="group flex items-center gap-3 transition-colors duration-200"
                >
                  <span className="shrink-0 text-[19px] text-[#00D97E] transition-transform duration-200 group-hover:scale-110">
                    ▤
                  </span>

                  <p className="text-[15px] text-white/75 transition-colors duration-200 group-hover:text-white">
                    {setting?.storePhone ?? "+62 812-3456-7890"}
                  </p>
                </a>

                {/* Email */}
                <a
                  href="mailto:dscmercs@gmail.com"
                  className="group flex items-center gap-3 transition-colors duration-200"
                >
                  <span className="shrink-0 text-[#F4C9B8] transition-transform duration-200 group-hover:scale-110">
                    <Mail className="w-5 h-5" />
                  </span>

                  <p className="text-[15px] text-white/75 transition-colors duration-200 group-hover:text-white">
                    DuoCaesar@gmail.com
                  </p>
                </a>
              </div>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-white/15" />

        {/* Bottom Footer */}
        <AnimateOnScroll delay={0} y={10}>
          <div className="flex flex-col gap-4 text-[13px] text-white/75 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>

            <div className="flex items-center gap-7">
              <Link
                href={`/${locale}/kebijakan-privasi`}
                className="relative w-fit transition-colors duration-200 hover:text-white"
              >
                Kebijakan Privasi
              </Link>

              <Link
                href={`/${locale}/syarat-ketentuan`}
                className="relative w-fit transition-colors duration-200 hover:text-white"
              >
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </footer>
  );
}