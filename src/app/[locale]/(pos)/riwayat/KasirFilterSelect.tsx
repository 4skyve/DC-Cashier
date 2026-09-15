"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Kasir = { id: string; username: string; role: string };

export default function KasirFilterSelect({
  allKasirs,
  currentKasirId,
}: {
  allKasirs: Kasir[];
  currentKasirId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(val: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("kasirId", val);
    } else {
      params.delete("kasirId");
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `?${query}` : "?");
  }

  return (
    <div className="relative">
      <select
        defaultValue={currentKasirId ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none rounded-lg border border-neutral-200 bg-white pl-3 pr-8 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
      >
        <option value="">Semua</option>
        {allKasirs.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}{" "}
            {u.role === "admin" ? "(admin)" : "(kasir)"}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-neutral-400">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}
