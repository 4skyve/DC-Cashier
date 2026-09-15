import { getTranslations } from "next-intl/server";
import { getAllProducts } from "@/actions/product";
import StockForm from "./StockForm";

export default async function StokPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stok" });
  const result = await getAllProducts({ perPage: 500 });

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-primary-800">{t("title")}</h1>
        <p className="text-sm text-neutral-400">{t("subtitle")}</p>
      </div>
      <StockForm locale={locale} products={result.items} />
    </div>
  );
}
