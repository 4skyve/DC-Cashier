"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { recordStockMovement } from "@/actions/stock";
import { Check } from "lucide-react";

type Product = { id: string; name: string; stock: number };

const TABS = ["in", "out", "adjustment"] as const;

export default function StockForm({
  locale,
  products,
}: {
  locale: string;
  products: Product[];
}) {
  const t = useTranslations("stok");
  const [tab, setTab] = useState<(typeof TABS)[number]>("in");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selected = products.find((p) => p.id === productId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const delta = tab === "in" ? qty : tab === "out" ? -qty : qty; // adjustment: qty sudah bisa negatif dari input
    startTransition(async () => {
      try {
        await recordStockMovement(locale, {
          productId,
          delta,
          type: tab === "in" ? "manual" : tab === "out" ? "manual" : "adjustment",
          note,
        });
        setSuccess(true);
        setNote("");
        setQty(1);
      } catch (err) {
        setError(err instanceof Error && err.message === "STOCK_NEGATIVE" ? t("stockNegativeError") : "Error");
      }
    });
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl">
      <div className="flex gap-1 p-2 border-b border-neutral-100">
        {TABS.map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm rounded-lg font-medium ${
              tab === key ? "bg-primary-50 text-primary-700" : "text-neutral-500"
            }`}
          >
            {t(`tab_${key}`)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">{t("product")}</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (stok: {p.stock})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">
            {tab === "adjustment" ? t("adjustmentQty") : t("qty")}
          </label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
          />
          {selected && (
            <p className="text-xs text-neutral-400 mt-1">
              {t("currentStock")}: {selected.stock} → {t("afterStock")}:{" "}
              {selected.stock + (tab === "in" ? qty : tab === "out" ? -qty : qty)}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">{t("note")}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="inline-flex items-center gap-1.5 text-sm text-green-600">
            <Check className="w-4 h-4" /> {t("saved")}
          </p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending || !productId}
            className="bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-50"
          >
            {t("submit")}
          </button>
          {productId && (
            <Link href={`/${locale}/stok/riwayat/${productId}`} className="text-sm text-neutral-500 hover:underline">
              {t("viewHistory")} →
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
