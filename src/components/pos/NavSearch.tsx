"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const SEARCHABLE_PATHS = ["kasir", "produk", "kategori", "riwayat"];

export default function NavSearch() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync value when URL changes (e.g. navigating between pages)
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  const isSearchable = SEARCHABLE_PATHS.some((p) => pathname.includes(`/${p}`));
  if (!isSearchable) return <div className="flex-1" />;

  function pushSearch(rawValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = rawValue.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    // Reset to page 1 on new search
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVal = e.target.value;
    setValue(newVal);

    // Debounce: push to URL 300ms after user stops typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushSearch(newVal);
    }, 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pushSearch(value);
  }

  return (
    <form onSubmit={handleSubmit} className="hidden sm:block w-full max-w-sm">
      <input
        value={value}
        onChange={handleChange}
        type="search"
        placeholder={t("searchFlexible")}
        className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/20"
      />
    </form>
  );
}
