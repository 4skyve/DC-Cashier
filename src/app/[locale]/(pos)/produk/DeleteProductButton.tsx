"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/actions/product";

export default function DeleteProductButton({
  locale,
  id,
  name,
}: {
  locale: string;
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Hapus produk "${name}"?`
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteProduct(locale, id);
        router.refresh();
      } catch (error) {
        console.error(error);
        alert("Gagal menghapus produk.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
    >
      {isPending ? "..." : "Hapus"}
    </button>
  );
}