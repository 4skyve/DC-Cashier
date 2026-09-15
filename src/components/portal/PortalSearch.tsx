"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function PortalSearch({ locale }: { locale: string }) {
  const t = useTranslations("common");
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/${locale}/katalog?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-md ml-auto">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="search"
        placeholder={t("search")}
        className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/20"
      />
    </form>
  );
}
