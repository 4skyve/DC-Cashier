"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleProductStatus } from "@/actions/product";

export default function ProductStatusToggle({
  locale,
  id,
  status,
}: {
  locale: string;
  id: string;
  status: "active" | "inactive";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isActive = status === "active";

  function handleClick() {
    const nextStatus = isActive ? "inactive" : "active";

    startTransition(async () => {
      try {
        await toggleProductStatus(locale, id, nextStatus);
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Gagal mengubah status produk.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={isActive ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
      className={`inline-flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
        isActive
          ? "bg-green-50 text-green-600 hover:bg-green-100"
          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
      }`}
    >
      <span
        className={`relative h-4 w-7 rounded-full transition-colors ${
          isActive ? "bg-green-500" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${
            isActive ? "left-3.5" : "left-0.5"
          }`}
        />
      </span>

      {isPending ? "..." : isActive ? "Aktif" : "Nonaktif"}
    </button>
  );
}