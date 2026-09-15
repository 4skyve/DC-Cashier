import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getCategories } from "@/actions/product";
import { getSession } from "@/lib/auth";

import ProductForm from "./ProductForm";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (session.role !== "admin") {
    redirect(`/${locale}/produk`);
  }

  const t = await getTranslations({
    locale,
    namespace: "produk",
  });

  const categories = await getCategories();

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-primary-700">
          {t("addProduct")}
        </h1>

        <p className="text-sm text-neutral-400 mt-1">
          Tambahkan produk baru ke katalog.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <ProductForm
          locale={locale}
          categories={categories}
        />
      </div>
    </div>
  );
}