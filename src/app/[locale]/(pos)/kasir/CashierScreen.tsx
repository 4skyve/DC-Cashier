"use client";

import { useMemo, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import ReceiptModal from "@/components/pos/ReceiptModal";
import { useTranslations } from "next-intl";
import { createPosTransaction } from "@/actions/transaction";
import {
  LayoutGrid,
  List,
  Plus,
  Minus,
  CheckCircle2,
  Printer,
  ShoppingBag,
  PackageSearch,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: {
    name: string;
  };
};

function StockBadge({ stock, t }: { stock: number; t: (key: string) => string }) {
  if (stock <= 0) {
    return (
      <span className="absolute right-2 top-2 rounded-full bg-red-100/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-red-700 shadow-sm transition-all duration-200">
        {t("outOfStock")}
      </span>
    );
  }

  if (stock <= 10) {
    return (
      <span className="absolute right-2 top-2 rounded-full bg-amber-100/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-amber-700 shadow-sm transition-all duration-200">
        {t("lowStock")}: {stock}
      </span>
    );
  }

  return (
    <span className="absolute right-2 top-2 rounded-full bg-neutral-900/60 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm transition-all duration-200">
      {t("stockLabel")}: {stock}
    </span>
  );
}

function StockBadgeInline({ stock, t }: { stock: number; t: (key: string) => string }) {
  if (stock <= 0) {
    return (
      <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
        {t("outOfStock")}
      </span>
    );
  }

  if (stock <= 10) {
    return (
      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">
        {t("lowStock")}: {stock}
      </span>
    );
  }

  return (
    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-600">
      {t("stockLabel")}: {stock}
    </span>
  );
}

export default function CashierScreen({
  products,
}: {
  products: Product[];
}) {
  const t = useTranslations("kasir");
  const tc = useTranslations("common");
  const { locale } = useParams<{ locale: string }>();

  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">(
    "cash"
  );

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(
    null
  );
  const [showReceipt, setShowReceipt] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category.name))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) => !categoryFilter || p.category.name === categoryFilter
    );
  }, [products, categoryFilter]);

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([productId, qty]) => {
          const product = products.find((p) => p.id === productId)!;

          return {
            product,
            qty,
          };
        }),
    [cart, products]
  );

  const cartItemCount = cartLines.reduce((sum, l) => sum + l.qty, 0);

  const total = cartLines.reduce(
    (sum, l) => sum + l.product.price * l.qty,
    0
  );

  function addToCart(id: string) {
    setCart((c) => ({
      ...c,
      [id]: (c[id] ?? 0) + 1,
    }));
  }

  function changeQty(id: string, delta: number) {
    setCart((c) => {
      const next = Math.max(0, (c[id] ?? 0) + delta);

      return {
        ...c,
        [id]: next,
      };
    });
  }

  function pay() {
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await createPosTransaction(
          locale,
          cartLines.map((l) => ({
            productId: l.product.id,
            qty: l.qty,
          })),
          paymentMethod
        );

        setCart({});
        setMessage("OK");
        setLastTransactionId(result.id);
        setShowReceipt(true);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "ERROR");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:gap-6 lg:h-[calc(100vh-8rem)]">
      <div className="flex min-h-0 flex-col">
        {/* Category pills + view toggle */}
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-white p-2.5 border border-neutral-200/80 shadow-sm transition-all duration-200">
          <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 active:scale-95 ${!categoryFilter
                  ? "bg-primary-800 text-white shadow-sm ring-2 ring-primary-800/20"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
                }`}
            >
              {t("allItems")}
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 active:scale-95 ${categoryFilter === cat
                    ? "bg-primary-800 text-white shadow-sm ring-2 ring-primary-800/20"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-1">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Tampilan grid"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 ${viewMode === "grid"
                  ? "bg-white text-primary-800 shadow-sm ring-1 ring-neutral-200/50"
                  : "text-neutral-400 hover:text-neutral-700"
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode("list")}
              aria-label="Tampilan list"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 ${viewMode === "list"
                  ? "bg-white text-primary-800 shadow-sm ring-1 ring-neutral-200/50"
                  : "text-neutral-400 hover:text-neutral-700"
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product grid/list */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 overflow-y-auto pr-1 pb-4">
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <PackageSearch className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">{tc("empty")}</p>
              </div>
            )}

            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group h-full flex flex-col bg-white border border-neutral-200/90 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-primary-600/40 hover:-translate-y-0.5 transition-all duration-200 ease-out"
              >
                {/* Gambar */}
                <div className="relative h-28 shrink-0 rounded-xl bg-neutral-100 mb-2.5 overflow-hidden">
                  <StockBadge stock={p.stock} t={t} />

                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                      {t("noImage")}
                    </div>
                  )}
                </div>

                {/* Nama produk */}
                <div className="h-10 shrink-0 text-sm font-medium text-primary-900 leading-snug line-clamp-2">
                  {p.name}
                </div>

                {/* Harga */}
                <div className="h-6 shrink-0 mt-1.5 text-base font-bold text-primary-700">
                  {tc("currencyPrefix")}
                  {p.price.toLocaleString("id-ID")}
                </div>

                {/* Button */}
                <button
                  onClick={() => addToCart(p.id)}
                  disabled={p.stock <= 0}
                  className="mt-2.5 w-full shrink-0 flex items-center justify-center gap-1.5 bg-primary-800 text-white rounded-xl py-2 text-xs font-semibold shadow-sm hover:bg-primary-900 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 pb-4">
            {filteredProducts.length === 0 && (
              <div className="py-16 text-center">
                <PackageSearch className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">{tc("empty")}</p>
              </div>
            )}

            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group flex items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3 shadow-sm hover:shadow-md hover:border-primary-600/40 transition-all duration-200"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] text-neutral-400">
                      {t("noImage")}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-primary-900">
                    {p.name}
                  </div>

                  <div className="text-xs text-neutral-400">
                    {p.category.name}
                  </div>
                </div>

                <div className="shrink-0 text-sm font-bold text-primary-700">
                  {tc("currencyPrefix")}
                  {p.price.toLocaleString("id-ID")}
                </div>

                <StockBadgeInline stock={p.stock} t={t} />

                <button
                  onClick={() => addToCart(p.id)}
                  disabled={p.stock <= 0}
                  className="flex items-center gap-1 shrink-0 rounded-xl bg-primary-800 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-900 active:scale-95 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart panel */}
      <div className="flex flex-col rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm transition-all duration-200">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary-800" />
            <h3 className="font-bold text-primary-900">{t("cart")}</h3>
          </div>

          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200/50 transition-all duration-200">
            {cartItemCount} items
          </span>
        </div>

        <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
          {cartLines.length === 0 && (
            <div className="py-12 text-center">
              <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2 opacity-60" />
              <p className="text-sm text-neutral-400">
                {t("emptyCart")}
              </p>
            </div>
          )}

          {cartLines.map(({ product, qty }) => (
            <div
              key={product.id}
              className="flex items-center justify-between text-sm bg-neutral-50/60 rounded-xl p-2.5 border border-neutral-100 hover:border-neutral-200 transition-all duration-150 animate-fade-in"
            >
              <div className="min-w-0 pr-2">
                <div className="truncate font-medium text-primary-900">
                  {product.name}
                </div>

                <div className="text-xs font-semibold text-primary-700 mt-0.5">
                  {tc("currencyPrefix")}
                  {product.price.toLocaleString("id-ID")}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 bg-white px-1.5 py-1 rounded-lg border border-neutral-200 shadow-xs">
                <button
                  onClick={() => changeQty(product.id, -1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-90 transition-all duration-150"
                  aria-label="Kurang kuantitas"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <span className="w-6 text-center font-bold text-xs text-neutral-800">
                  {qty}
                </span>

                <button
                  onClick={() => changeQty(product.id, 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-90 transition-all duration-150"
                  aria-label="Tambah kuantitas"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3.5 space-y-3.5 border-t border-neutral-100 pt-3.5">
          <div className="flex justify-between items-center text-sm font-bold text-primary-900">
            <span>{t("subtotal")}</span>

            <span className="text-base text-primary-800">
              {tc("currencyPrefix")} {total.toLocaleString("id-ID")}
            </span>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              {t("paymentMethod")}
            </label>

            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as "cash" | "transfer"
                  )
                }
                className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-800 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-700/10 focus:border-primary-600 focus:bg-white"
              >
                <option value="cash">{t("cash")}</option>
                <option value="transfer">{t("transfer")}</option>
              </select>

              <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-neutral-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>

          {message === "OK" && lastTransactionId && (
            <div className="space-y-2 rounded-xl border border-green-200 bg-green-50/80 p-3 animate-fade-in shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-medium text-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{t("transactionSaved")}</span>
              </div>
            </div>
          )}

          {message && message !== "OK" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 animate-fade-in">
              {message}
            </div>
          )}

          <button
            onClick={pay}
            disabled={cartLines.length === 0 || isPending}
            className="w-full rounded-xl bg-primary-800 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-900 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending ? tc("loading") : t("pay")}
          </button>
        </div>
      </div>

      {showReceipt && lastTransactionId && (
        <ReceiptModal
          transactionId={lastTransactionId}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}