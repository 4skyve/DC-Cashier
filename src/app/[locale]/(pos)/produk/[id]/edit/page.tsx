import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  getCategories,
  getProductById,
} from "@/actions/product";

import { getSession } from "@/lib/auth";

import ProductForm from "../../baru/ProductForm";

export default async function EditProductPage({
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

  if (session.role !== "admin") {
    redirect(`/${locale}/produk`);
  }

  const [t, categories, product] =
    await Promise.all([
      getTranslations({
        locale,
        namespace: "produk",
      }),
      getCategories(),
      getProductById(id),
    ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-primary-800">
          {t("editProduct")}
        </h1>

        <p className="text-sm text-neutral-400 mt-1">
          Ubah informasi produk. Stok dikelola melalui halaman stok.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <ProductForm
          locale={locale}
          categories={categories}
          product={product}
        />
      </div>
    </div>
  );
}