"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import type { Session } from "@/lib/auth";

export default function ProfileMenu({
  locale,
  session,
  avatarUrl,
}: {
  locale: string;
  session: Session;
  avatarUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatar = avatarUrl ? (
    <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
  ) : (
    <div className="h-9 w-9 rounded-full bg-primary-700 text-white text-sm flex items-center justify-center font-semibold shrink-0">
      {session.username.slice(0, 1).toUpperCase()}
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2">
        {avatar}
        <div className="text-sm leading-tight hidden sm:block text-left">
          <div className="font-medium text-primary-800">{session.username}</div>
          <div className="text-neutral-400 text-xs capitalize">{session.role}</div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg z-30 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2.5">
            {avatar}
            <div>
              <div className="text-sm font-medium text-primary-800">{session.username}</div>
              <div className="text-xs text-neutral-400 capitalize">{session.role}</div>
            </div>
          </div>
          <Link
            href={`/${locale}/profil`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            <img src="/icons/edit-profil.svg" alt="" className="h-4 w-4" /> Profil Saya
          </Link>
          <Link
            href={`/${locale}`}
            target="_blank"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            <img src="/icons/toko-online.svg" alt="" className="h-4 w-4" /> Lihat Web Katalog
          </Link>
          <form action={logoutAction.bind(null, locale)}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 border-t border-neutral-100"
            >
              <img src="/icons/logout.svg" alt="" className="h-4 w-4" /> Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
