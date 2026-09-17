"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentFilterSelect({
  value,
}: {
  value?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(val: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!val || val === "all") {
      params.delete("payment");
    } else {
      params.set("payment", val);
    }

    params.delete("page");

    const query = params.toString();

    router.push(query ? `?${query}` : "?");
  }

  return (
    <select
      value={value || "all"}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-lg text-sm text-neutral-600 outline-none cursor-pointer"
    >
      <option value="all">Semua Metode</option>
      <option value="cash">Tunai</option>
      <option value="transfer">Transfer</option>
    </select>
  );
}
