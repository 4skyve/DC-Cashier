import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getProductById } from "@/actions/product";
import { getStockMovements } from "@/actions/stock";
import { getSession } from "@/lib/auth";

import ProductStockForm from "./ProductStockForm";

const typeStyle: Record<string, string> = {
  manual: "bg-neutral-100 text-neutral-600",
  transaction: "bg-primary-50 text-primary-700",
  return: "bg-secondary-50 text-secondary-700",
  cancellation: "bg-red-50 text-red-600",
  adjustment: "bg-tertiary-100 text-secondary-700",
};

function TypeIcon({ type }: { type: string }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "transaction":
      return (
        <svg {...common}>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case "return":
      return (
        <svg {...common}>
          <path d="M3 7v6h6" />
          <path d="M3 13a9 9 0 1 0 3-7.7L3 7" />
        </svg>
      );
    case "cancellation":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6M9 9l6 6" />
        </svg>
      );
    case "adjustment":
      return (
        <svg {...common}>
          <path d="M4 21v-7M4 10V3M12 21v-11M12 6V3M20 21v-5M20 12V3" />
          <path d="M1 14h6M9 8h6M17 16h6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1-1 1 1-4Z" />
        </svg>
      );
  }
}

export default async function ProductStockPage({
  params,
}: {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}) {
  const { locale, id } = await params;

  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Kasir tidak dapat mengakses hlmn riwayat stok
  if (session.role !== "admin") {
    redirect(`/${locale}/produk`);
  }

  const isAdmin = session.role === "admin";

  const t = await getTranslations({
    locale,
    namespace: "stok",
  });

  const [product, movements] = await Promise.all([
    getProductById(id),
    getStockMovements(id),
  ]);

  if (!product) {
    notFound();
  }

  const stockLevel =
    product.stock <= 0 ? "empty" : product.stock <= 10 ? "low" : "ok";

  return (
    <div className="max-w-2xl space-y-4">
      {/* HEADER */}
      <div>
        <Link
          href={`/${locale}/produk`}
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t("backToProducts")}
        </Link>

        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          <h1 className="text-xl font-bold text-primary-800">
            {product.name}
          </h1>

          <div
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 ${
              stockLevel === "empty"
                ? "bg-red-50"
                : stockLevel === "low"
                ? "bg-orange-50"
                : "bg-primary-50"
            }`}
          >
            <span
              className={`text-lg font-bold ${
                stockLevel === "empty"
                  ? "text-red-600"
                  : stockLevel === "low"
                  ? "text-orange-600"
                  : "text-primary-700"
              }`}
            >
              {product.stock}
            </span>
            <span className="text-xs text-neutral-500">
              {product.unit} · {t("currentStock")}
            </span>
          </div>
        </div>
      </div>

      {/* ADMIN SAJA YANG BISA UBAH STOK */}
      {isAdmin && (
        <ProductStockForm
          locale={locale}
          productId={product.id}
          currentStock={product.stock}
        />
      )}

      {/* HISTORY */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-primary-800">
            {t("historyOf")}
          </h2>

          {movements.length > 0 && (
            <span className="text-xs text-neutral-400">
              {movements.length} riwayat
            </span>
          )}
        </div>

        <div className="divide-y divide-neutral-100">
          {movements.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-neutral-400">
              {t("noHistory")}
            </p>
          )}

          {movements.map((movement) => (
            <div
              key={movement.id}
              className="px-4 py-3 flex items-center gap-3"
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  typeStyle[movement.type] ?? typeStyle.manual
                }`}
              >
                <TypeIcon type={movement.type} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm text-primary-800">
                  {movement.createdAt.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-xs text-neutral-500">
                    {t(`type_${movement.type}` as never)}
                  </span>

                  {movement.note && (
                    <span className="text-xs text-neutral-400">
                      · {movement.note}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`text-sm font-semibold shrink-0 ${
                  movement.qty >= 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {movement.qty >= 0 ? "+" : ""}
                {movement.qty} {product.unit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}