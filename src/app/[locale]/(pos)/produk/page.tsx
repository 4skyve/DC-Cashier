import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  getAllProducts,
  getCategories,
} from "@/actions/product";
import { getSession } from "@/lib/auth";

import ProductStatusToggle from "./ProductStatusToggle";
import SortSelect from "./SortSelect";
import DeleteProductButton from "./DeleteProductButton";
import { Image as ImageIcon } from "lucide-react";

export default async function ProdukPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
    view?: string;
  }>;
}) {
  const { locale } = await params;

  const {
    q,
    category,
    sort,
    page,
    view,
  } = await searchParams;

  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  const isAdmin = session.role === "admin";

  const currentView =
    view === "list" ? "list" : "grid";

  const t = await getTranslations({
    locale,
    namespace: "produk",
  });

  const tc = await getTranslations({
    locale,
    namespace: "common",
  });

  const [result, categories] = await Promise.all([
    getAllProducts({
      q,
      categoryId: category,
      sort,
      page: Number(page) || 1,
    }),
    getCategories(),
  ]);

  const sortOptions = [
    {
      value: "createdAt-desc",
      label: t("sortNewest"),
    },
    {
      value: "name-asc",
      label: t("sortNameAsc"),
    },
    {
      value: "price-asc",
      label: t("sortPriceAsc"),
    },
    {
      value: "price-desc",
      label: t("sortPriceDesc"),
    },
    {
      value: "stock-asc",
      label: t("sortStockAsc"),
    },
  ];

  function buildQuery(
    overrides: Record<string, string | undefined>
  ) {
    const params = new URLSearchParams();

    const merged = {
      q,
      category,
      sort,
      view: currentView,
      ...overrides,
    };

    Object.entries(merged).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const query = params.toString();

    return query ? `?${query}` : "";
  }

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-primary-800">
          {t("title")}
        </h1>

        {isAdmin && (
          <Link
            href={`/${locale}/produk/baru`}
            className="inline-flex items-center gap-1.5 bg-primary-800 hover:bg-primary-900 text-white text-sm px-4 py-2.5 rounded-lg font-medium"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>

            {t("addProduct")}
          </Link>
        )}
      </div>

      {/* BANNER READ-ONLY — kasir */}
      {!isAdmin && (
        <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-600 shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p className="text-sm text-amber-700">
            <span className="font-medium">{t("readOnlyMode")}</span> — {t("readOnlyProducts")}
          </p>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap">

        {/* CATEGORY PILLS */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* ALL */}
          <a
            href={buildQuery({
              category: undefined,
              page: undefined,
            })}
            className={`text-sm px-4 py-2 rounded-full font-medium border transition-colors ${!category
                ? "bg-primary-800 text-white border-primary-800"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
          >
            {t("allCategories")}
          </a>

          {/* CATEGORIES */}
          {categories.map((c) => (
            <a
              key={c.id}
              href={buildQuery({
                category: c.id,
                page: undefined,
              })}
              className={`text-sm px-4 py-2 rounded-full font-medium border transition-colors ${category === c.id
                  ? "bg-primary-800 text-white border-primary-800"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                }`}
            >
              {c.name}
            </a>
          ))}
        </div>

        {/* SORT + VIEW */}
        <div className="flex items-center gap-3 shrink-0">

          <form method="get">

            {category && (
              <input
                type="hidden"
                name="category"
                value={category}
              />
            )}

            {q && (
              <input
                type="hidden"
                name="q"
                value={q}
              />
            )}

            <input
              type="hidden"
              name="view"
              value={currentView}
            />

            <SortSelect
              defaultValue={
                sort ?? "createdAt-desc"
              }
              options={sortOptions}
            />
          </form>

          {/* VIEW TOGGLE */}
          <div className="flex items-center gap-1">

            {/* LIST */}
            <Link
              href={buildQuery({
                view: "list",
                page: undefined,
              })}
              title="List"
              className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${currentView === "list"
                  ? "bg-primary-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-100"
                }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </Link>

            {/* GRID */}
            <Link
              href={buildQuery({
                view: "grid",
                page: undefined,
              })}
              title="Grid"
              className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${currentView === "grid"
                  ? "bg-primary-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-100"
                }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </Link>

          </div>
        </div>
      </div>

      {/* EMPTY */}
      {result.items.length === 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl px-4 py-12 text-center text-sm text-neutral-400">
          {tc("empty")}
        </div>
      )}

      {/*  GRID  */}
      {currentView === "grid" &&
        result.items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">

            {result.items.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-sm transition"
              >

                {/* IMAGE */}
                <div className="aspect-[16/10] rounded-lg bg-neutral-100 overflow-hidden mb-4">

                  {p.imageUrl ? (
                    
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <ImageIcon className="w-8 h-8 text-neutral-300" />
                    </div>
                  )}

                </div>

                {/* NAME + STATUS */}
                <div className="flex items-start justify-between gap-2">

                  <h2 className="text-base font-bold text-primary-800 truncate">
                    {p.name}
                  </h2>

                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full shrink-0 ${p.status === "active"
                        ? "bg-green-50 text-green-600"
                        : "bg-neutral-100 text-neutral-500"
                      }`}
                  >
                    {p.status === "active"
                      ? tc("active")
                      : tc("inactive")}
                  </span>

                </div>

                <p className="text-sm text-neutral-400 mt-1">
                  {p.category.name}
                </p>

                {/* PRICE + STOCK */}
                <div className="flex items-center justify-between mt-3">

                  <p className="text-lg font-bold text-primary-700">
                    {tc("currencyPrefix")}{" "}
                    {p.price.toLocaleString("id-ID")}
                  </p>

                  <p className="text-sm text-neutral-400">
                    {t("stock")}: {p.stock}
                  </p>

                </div>

                {/* ACTIONS */}
                {isAdmin && (
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100">
                    <Link
                      href={`/${locale}/produk/${p.id}/edit`}
                      className="text-sm font-medium text-primary-700 hover:underline"
                    >
                      {tc("edit")}
                    </Link>

                    <Link
                      href={`/${locale}/produk/${p.id}/stok`}
                      className="text-sm text-neutral-400 hover:text-primary-700 hover:underline"
                    >
                      {t("history")}
                    </Link>

                    <DeleteProductButton
                      locale={locale}
                      id={p.id}
                      name={p.name}
                    />
                  </div>
                )}
              </div>
            ))}

          </div>
        )}

      {/*  LIST  */}
      {currentView === "list" &&
        result.items.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-x-auto">

            <table className="w-full text-sm min-w-[900px]">

              <thead className="bg-neutral-50 text-neutral-500 text-left">
                <tr>

                  <th className="px-4 py-3 font-medium">
                    {t("name")}
                  </th>

                  <th className="px-4 py-3 font-medium">
                    {t("category")}
                  </th>

                  <th className="px-4 py-3 font-medium">
                    {t("unit")}
                  </th>

                  <th className="px-4 py-3 font-medium">
                    {t("price")}
                  </th>

                  <th className="px-4 py-3 font-medium">
                    {t("stock")}
                  </th>

                  <th className="px-4 py-3 font-medium">
                    {tc("status")}
                  </th>

                  {isAdmin && (
                    <th className="px-4 py-3 font-medium">
                      {tc("actions")}
                    </th>
                  )}

                </tr>
              </thead>

              <tbody>

                {result.items.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-neutral-100 hover:bg-neutral-50/50"
                  >

                    {/* PRODUCT */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">

                        <div className="h-11 w-11 rounded-lg bg-neutral-100 overflow-hidden shrink-0">

                          {p.imageUrl ? (
                            
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-neutral-300">
                              <ImageIcon className="w-5 h-5 text-neutral-300" />
                            </div>
                          )}

                        </div>

                        <span className="font-medium text-primary-800">
                          {p.name}
                        </span>

                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-3 text-neutral-500">
                      {p.category.name}
                    </td>

                    {/* UNIT */}
                    <td className="px-4 py-3 text-neutral-500 capitalize">
                      {p.unit}
                    </td>

                    {/* PRICE */}
                    <td className="px-4 py-3">
                      {tc("currencyPrefix")}{" "}
                      {p.price.toLocaleString("id-ID")}
                    </td>

                    {/* STOCK */}
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.stock <= 0
                            ? "text-red-500 font-medium"
                            : p.stock <= 10
                              ? "text-orange-500 font-medium"
                              : "text-neutral-700"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">

                      {isAdmin ? (
                        <ProductStatusToggle
                          locale={locale}
                          id={p.id}
                          status={p.status}
                        />
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${p.status === "active"
                              ? "bg-green-50 text-green-600"
                              : "bg-neutral-100 text-neutral-500"
                            }`}
                        >
                          {p.status === "active"
                            ? tc("active")
                            : tc("inactive")}
                        </span>
                      )}

                    </td>

                    {/* ACTIONS */}
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/${locale}/produk/${p.id}/edit`}
                            className="text-primary-700 font-medium hover:underline"
                          >
                            {tc("edit")}
                          </Link>

                          <Link
                            href={`/${locale}/produk/${p.id}/stok`}
                            className="text-neutral-500 hover:text-primary-700 hover:underline"
                          >
                            {t("history")}
                          </Link>

                          <DeleteProductButton
                            locale={locale}
                            id={p.id}
                            name={p.name}
                          />
                        </div>
                      </td>
                    )}

                  </tr>
                ))}

              </tbody>
            </table>

          </div>
        )}

      {/* PAGINATION */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">

          {Array.from(
            {
              length: result.totalPages,
            },
            (_, i) => i + 1
          ).map((pageNumber) => (

            <a
              key={pageNumber}
              href={buildQuery({
                page: String(pageNumber),
              })}
              className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm ${pageNumber === result.page
                  ? "bg-primary-800 text-white"
                  : "border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                }`}
            >
              {pageNumber}
            </a>

          ))}

        </div>
      )}

    </div>
  );
}