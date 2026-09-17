import { getTranslations } from "next-intl/server";
import { getCategories } from "@/actions/product";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CategoryManager from "./CategoryManager";

export default async function KategoriPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;

  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  const isAdmin = session.role === "admin";

  const t = await getTranslations({
    locale,
    namespace: "kategori",
  });

  // Semua kategori diambil langsung dri db
  const allCategories = await getCategories();

  // Search berdasarkan data db
  const categories = q
    ? allCategories.filter((category) =>
        category.name
          .toLowerCase()
          .includes(q.toLowerCase())
      )
    : allCategories;

  return (
    <div className="min-h-full">
      <CategoryManager
        locale={locale}
        categories={categories}
        isAdmin={isAdmin}
      />
    </div>
  );
}