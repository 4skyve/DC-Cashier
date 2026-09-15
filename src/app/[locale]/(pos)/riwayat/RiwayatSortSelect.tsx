"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function RiwayatSortSelect({
  value,
}: {
  value: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    params.delete("page");

    const query = params.toString();

    router.push(query ? `?${query}` : "?");
  }

  return (
    <select
      name="sort"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-transparent text-sm font-semibold text-primary-800 outline-none cursor-pointer"
    >
      <option value="newest">Terbaru</option>
      <option value="oldest">Terlama</option>
      <option value="total-high">Total Terbesar</option>
      <option value="total-low">Total Terkecil</option>
    </select>
  );
}