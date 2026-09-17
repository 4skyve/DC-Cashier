"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Session } from "@/lib/auth";

export default function Sidebar({
  locale,
  role,
}: {
  locale: string;
  role: Session["role"];
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const adminMenu = [
    "dashboard",
    "kasir",
    "produk",
    "kategori",
    "riwayat",
    "laporan",
    "pengguna",
    "pengaturan",
  ];
  const kasirMenu = [
    "dashboard",
    "kasir",
    "produk",
    "kategori",
    "riwayat",
  ];
  const menu = role === "admin" ? adminMenu : kasirMenu;

  const isActive = (key: string) => {
    const href = `/${locale}/${key}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r border-neutral-100 bg-white flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <img src="/icons/kasir4.jpg" alt="" className="h-9 w-9 shrink-0" />
          <div>
            <div className="font-bold text-primary-800 leading-tight text-[15px]">Cashier - </div>
            <div className="font-bold text-primary-800 leading-tight text-[15px] -mt-0.5">Duo Caesar</div>
            <div className="text-[11px] text-neutral-400 leading-tight mt-0.5">
              Wholesale Cashier
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menu.map((key) => {
          const active = isActive(key);
          return (
            <Link
              key={key}
              href={`/${locale}/${key}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                active
                  ? "bg-neutral-200 text-neutral-900 font-medium"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <img src={`/icons/${key}.svg`} alt="" className="h-5 w-5 shrink-0" />
              {t(key)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}