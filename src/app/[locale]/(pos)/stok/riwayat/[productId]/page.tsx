import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProductById } from "@/actions/product";
import { getStockMovements } from "@/actions/stock";

const typeStyle: Record<string, string> = {
  manual: "bg-neutral-100 text-neutral-600",
  transaction: "bg-primary-50 text-primary-700",
  return: "bg-secondary-50 text-secondary-700",
  cancellation: "bg-red-50 text-red-600",
  adjustment: "bg-tertiary-100 text-secondary-700",
};

export default async function StockHistoryPage({
  params,
}: {
  params: Promise<{ locale: string; productId: string }>;
}) {
  const { locale, productId } = await params;
  const t = await getTranslations({ locale, namespace: "stok" });
  const [product, movements] = await Promise.all([
    getProductById(productId),
    getStockMovements(productId),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <Link href={`/${locale}/produk`} className="text-sm text-neutral-500 hover:text-primary-700">
          ← {t("backToProducts")}
        </Link>
        <h1 className="text-xl font-bold text-primary-800 mt-1">
          {t("historyOf")} {product.name}
        </h1>
        <p className="text-sm text-neutral-400">{t("currentStock")}: {product.stock}</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
        {movements.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-neutral-400">{t("noHistory")}</p>
        )}
        {movements.map((m) => (
          <div key={m.id} className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-primary-800">
                {m.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${typeStyle[m.type]}`}>
                  {t(`type_${m.type}` as never)}
                </span>
                {m.note && <span className="text-xs text-neutral-400">{m.note}</span>}
              </div>
            </div>
            <div className={`text-sm font-semibold shrink-0 ${m.qty >= 0 ? "text-green-600" : "text-red-500"}`}>
              {m.qty >= 0 ? "+" : ""}{m.qty}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
