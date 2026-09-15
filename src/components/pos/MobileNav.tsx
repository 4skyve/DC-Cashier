"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu as MenuIcon, X } from "lucide-react";

export default function MobileNav({
  locale,
  role,
}: {
  locale: string;
  role: "admin" | "kasir";
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  const adminMenu = ["dashboard", "kasir", "produk", "kategori", "riwayat", "laporan", "pengguna"];
  const kasirMenu = ["dashboard", "kasir", "produk", "kategori", "riwayat"];
  const menu = role === "admin" ? adminMenu : kasirMenu;

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="h-9 w-9 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 active:scale-95 transition-all duration-150"
        aria-label="Menu"
      >
        <MenuIcon className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          <div className="w-72 bg-white h-full flex flex-col shadow-2xl animate-scale-in">
            <div className="px-5 py-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/kasir.svg" alt="" className="h-6 w-6" />
                <span className="font-bold text-primary-800">DCS Commerce</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {menu.map((key) => (
                <Link
                  key={key}
                  href={`/${locale}/${key}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-primary-50 hover:text-primary-800 transition-colors duration-150"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/icons/${key}.svg`} alt="" className="h-5 w-5 shrink-0" />
                  {t(key)}
                </Link>
              ))}
              {role === "admin" && (
                <Link
                  href={`/${locale}/pengaturan`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-primary-50 hover:text-primary-800 transition-colors duration-150"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/pengaturan.svg" alt="" className="h-5 w-5 shrink-0" />
                  {t("pengaturan")}
                </Link>
              )}
            </nav>
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-xs" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
