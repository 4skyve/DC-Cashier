"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import PortalSearch from "./PortalSearch";

export default function PortalNavbar({
  locale,
}: {
  locale: string;
}) {
  const pathname = usePathname();
  const t = useTranslations("portalNav");

  const links = [
    {
      href: `/${locale}`,
      label: t("home"),
    },
    {
      href: `/${locale}/katalog`,
      label: t("products"),
    },
    {
      href: `/${locale}/faq`,
      label: "FAQ",
    },
    {
      href: `/${locale}/tentang-kami`,
      label: t("about"),
    },
    {
      href: `/${locale}/kontak`,
      label: t("contact"),
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-30 bg-white">
      <div className="mx-auto flex h-[64px] max-w-[1280px] items-center px-5 md:px-8">
        <Link
          href={`/${locale}`}
          className="flex shrink-0 items-center gap-2"
        >
    
          <img src="/icons/kasir4.jpg" alt="Logo" className="h-9 w-9 rounded-md object-cover" />

          <div className="leading-none">
            <div className="text-[17px] font-bold tracking-tight text-[#1F416B]">
              Duo Caesar
            </div>

            <div className="mt-1 text-[8px] font-medium text-neutral-500">
              Snack Lengkap, Harga Bersahabat
            </div>
          </div>
        </Link>

        <div className="mx-auto w-full max-w-[510px] px-6">
          <PortalSearch locale={locale} />
        </div>

        <Link
          href={`/${locale}/kontak`}
          className="hidden shrink-0 rounded-full bg-[#1F416B] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#173555] md:block"
        >
          {t("contactUs")}
        </Link>
      </div>

      <div className="border-t border-neutral-100">
        <nav className="flex h-[42px] items-center justify-center gap-8">
          {links.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex h-full items-center text-xs font-semibold transition-colors ${
                  active
                    ? "text-[#1F416B]"
                    : "text-neutral-500 hover:text-[#1F416B]"
                }`}
              >
                {link.label}

                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#1F416B]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}