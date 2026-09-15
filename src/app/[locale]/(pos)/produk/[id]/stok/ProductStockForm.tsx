"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";

import { recordStockMovement } from "@/actions/stock";

const TABS = ["in", "out", "adjustment"] as const;

type Tab = (typeof TABS)[number];

const tabIcon: Record<Tab, React.ReactNode> = {
  in: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  ),
  out: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  adjustment: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21v-7M4 10V3M12 21v-11M12 6V3M20 21v-5M20 12V3" />
      <path d="M1 14h6M9 8h6M17 16h6" />
    </svg>
  ),
};

const tabActiveClass: Record<Tab, string> = {
  in: "bg-green-50 text-green-700",
  out: "bg-red-50 text-red-700",
  adjustment: "bg-primary-50 text-primary-700",
};

export default function ProductStockForm({
  locale,
  productId,
  currentStock,
}: {
  locale: string;
  productId: string;
  currentStock: number;
}) {
  const t = useTranslations("stok");
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("in");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const delta =
    tab === "in" ? Math.abs(qty) : tab === "out" ? -Math.abs(qty) : qty;

  const nextStock = currentStock + delta;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setSuccess(false);

    if (qty <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return;
    }

    if (nextStock < 0) {
      setError(t("stockNegativeError"));
      return;
    }

    startTransition(async () => {
      try {
        await recordStockMovement(locale, {
          productId,
          delta,
          type: tab === "adjustment" ? "adjustment" : "manual",
          note,
        });

        setSuccess(true);
        setNote("");
        setQty(1);

        router.refresh();
      } catch (err) {
        if (err instanceof Error && err.message === "STOCK_NEGATIVE") {
          setError(t("stockNegativeError"));
        } else {
          setError("Gagal menyimpan perubahan stok.");
        }
      }
    });
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* TABS */}
      <div className="flex gap-1 p-2 border-b border-neutral-100">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setError(null);
              setSuccess(false);
            }}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm rounded-lg font-medium transition ${
              tab === key
                ? tabActiveClass[key]
                : "text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            {tabIcon[key]}
            {t(`tab_${key}`)}
          </button>
        ))}
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-neutral-500 block mb-1">
              {tab === "adjustment" ? t("adjustmentQty") : t("qty")}
            </label>

            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-700/10"
            />
          </div>

          <div className="flex items-center gap-2 text-sm pb-0 shrink-0 bg-neutral-50 rounded-lg px-3 py-2.5">
            <span className="text-neutral-400">{currentStock}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span
              className={`font-semibold ${
                nextStock < 0 ? "text-red-500" : "text-primary-700"
              }`}
            >
              {nextStock}
            </span>
          </div>
        </div>

        {/* NOTE */}
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("note")}
          className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-700/10"
        />

        {/* ERROR */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2.5">
            <Check className="w-3.5 h-3.5" />
            <span>{t("saved")}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary-800 disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : t("submit")}
        </button>
      </form>
    </div>
  );
}