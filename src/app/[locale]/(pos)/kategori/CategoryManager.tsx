"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/product";

type Product = {
  id: string;
  name: string;
  barcode: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
};

type Category = {
  id: string;
  name: string;
  _count: {
    products: number;
  };
  products: Product[];
};

export default function CategoryManager({
  locale,
  categories,
  isAdmin = true,
}: {
  locale: string;
  categories: Category[];
  isAdmin?: boolean;
}) {
  const t = useTranslations("kategori");
  const tc = useTranslations("common");

  const [newName, setNewName] = useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingName, setEditingName] =
    useState("");

  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  /*
   * Ambil kategori yang sedang dipilih
   * langsung dari props database terbaru.
   */
  const selectedCategory =
    categories.find(
      (category) =>
        category.id === selectedCategoryId
    ) ?? null;

  /*
   * TOTAL PRODUK
   */
  const totalProducts = categories.reduce(
    (total, category) =>
      total + category._count.products,
    0
  );

  /*
   * ================================
   * CREATE CATEGORY
   * ================================
   */

  function handleCreate(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const name = newName.trim();

    if (!name) return;

    setError(null);

    startTransition(async () => {
      try {
        await createCategory(
          locale,
          name
        );

        setNewName("");
      } catch {
        setError(
          "Gagal menambahkan kategori."
        );
      }
    });
  }

  /*
   * ================================
   * EDIT CATEGORY
   * ================================
   */

  function openEdit(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setError(null);
  }

  function closeEdit() {
    setEditingId(null);
    setEditingName("");
  }

  function handleUpdate() {
    if (!editingId) return;

    const name = editingName.trim();

    if (!name) return;

    setError(null);

    startTransition(async () => {
      try {
        await updateCategory(
          locale,
          editingId,
          name
        );

        closeEdit();
      } catch {
        setError(
          "Gagal mengubah kategori."
        );
      }
    });
  }

  /*
   * ================================
   * DELETE CATEGORY
   * ================================
   */

  function handleDelete(id: string) {
    setError(null);

    startTransition(async () => {
      try {
        await deleteCategory(
          locale,
          id
        );

        if (selectedCategoryId === id) {
          setSelectedCategoryId(null);
        }
      } catch {
        setError(t("cannotDelete"));
      }
    });
  }

  /*
   * ================================
   * PRODUCT PANEL
   * ================================
   */

  function toggleProducts(
    category: Category
  ) {
    if (
      selectedCategoryId ===
      category.id
    ) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(
        category.id
      );
    }
  }

  /*
   * ================================
   * RUPIAH
   * ================================
   */

  function formatRupiah(
    value: number
  ) {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  return (
    <>
      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div
        className={`space-y-6 transition-all ${selectedCategory
            ? "pr-[380px]"
            : ""
          }`}
      >
        {/* =====================================
            HEADER
        ===================================== */}

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg border border-neutral-300 bg-[#f3f5ff] flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-[#263f60]"
            >
              <path
                d="M3 7.5A1.5 1.5 0 0 1 4.5 6h6l2 2h7A1.5 1.5 0 0 1 21 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-11Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-[#182235]">
              {t("title")}
            </h1>

            <p className="text-sm text-neutral-500">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* =====================================
            STATISTICS
        ===================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[610px]">
          {/* TOTAL KATEGORI */}

          <div className="border border-neutral-300 rounded-lg bg-white px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">
                Total Kategori
              </p>

              <p className="text-2xl font-semibold text-[#182235] mt-1">
                {categories.length}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#f0f3ff] flex items-center justify-center">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="text-[#263f60]"
              >
                <rect
                  x="4"
                  y="4"
                  width="6"
                  height="6"
                  rx="1"
                />
                <rect
                  x="14"
                  y="4"
                  width="6"
                  height="6"
                  rx="1"
                />
                <rect
                  x="4"
                  y="14"
                  width="6"
                  height="6"
                  rx="1"
                />
                <rect
                  x="14"
                  y="14"
                  width="6"
                  height="6"
                  rx="1"
                />
              </svg>
            </div>
          </div>

          {/* TOTAL PRODUK */}

          <div className="border border-neutral-300 rounded-lg bg-white px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">
                Total Produk
              </p>

              <p className="text-2xl font-semibold text-[#182235] mt-1">
                {totalProducts}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#f0f3ff] flex items-center justify-center">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="text-[#263f60]"
              >
                <path d="M4 7h16v13H4z" />
                <path d="M7 7V4h10v3" />
                <path d="M8 11h8" />
              </svg>
            </div>
          </div>
        </div>

        {/* =====================================
            TAMBAH KATEGORI — admin only
        ===================================== */}

        {isAdmin ? (
          <div className="border border-neutral-300 rounded-lg bg-white p-6 max-w-[610px]">
            <h2 className="text-xl font-semibold text-[#182235]">
              Tambah kategori
            </h2>

            <p className="text-sm text-neutral-500 mt-1 mb-5">
              Tambahkan kategori baru untuk
              mengelompokkan produk Anda.
            </p>

            <form
              onSubmit={handleCreate}
              className="flex gap-3"
            >
              <input
                type="text"
                value={newName}
                onChange={(e) =>
                  setNewName(e.target.value)
                }
                placeholder={t(
                  "newCategoryPlaceholder"
                )}
                disabled={isPending}
                className="flex-1 border border-neutral-300 rounded-lg px-4 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#263f60]/20"
              />

              <button
                type="submit"
                disabled={
                  isPending ||
                  !newName.trim()
                }
                className="bg-[#364256] hover:bg-[#293548] text-white text-sm font-medium px-6 rounded-lg disabled:opacity-50 transition"
              >
                + {tc("add")}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 max-w-[610px]">
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
              <span className="font-medium">Mode Hanya Lihat</span> — Kategori hanya dapat dilihat. Hubungi Admin untuk perubahan.
            </p>
          </div>
        )}

        {/* =====================================
            ERROR
        ===================================== */}

        {error && (
          <div className="max-w-[610px] rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* =====================================
            DAFTAR KATEGORI
        ===================================== */}

        <div className="border border-neutral-300 rounded-lg bg-white max-w-[610px] overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-300">
            <h2 className="text-sm font-semibold tracking-wide text-[#182235]">
              DAFTAR KATEGORI
            </h2>
          </div>

          {categories.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-neutral-400">
                {tc("empty")}
              </p>
            </div>
          ) : (
            categories.map(
              (category) => {
                const isSelected =
                  selectedCategoryId ===
                  category.id;

                return (
                  <div
                    key={category.id}
                    className={`px-4 py-4 border-b last:border-b-0 flex items-center justify-between ${isSelected
                        ? "bg-[#fafbff]"
                        : "bg-white"
                      }`}
                  >
                    {/* CATEGORY INFO */}

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-md bg-[#e9edff] flex items-center justify-center shrink-0">
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="text-[#4c5668]"
                        >
                          <path d="M4 7h16v13H4z" />
                          <path d="M8 4h8v3H8z" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#182235]">
                          {category.name}
                        </div>

                        <div className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-[#eef1ff] text-xs text-[#4b5870]">
                          {
                            category
                              ._count
                              .products
                          }{" "}
                          {t(
                            "productsCount"
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ACTION */}

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={() =>
                          toggleProducts(
                            category
                          )
                        }
                        className="border border-neutral-300 rounded-md px-3 py-1.5 text-xs text-[#364256] hover:bg-neutral-50 transition"
                      >
                        {isSelected
                          ? "Tutup produk"
                          : "Lihat produk"}
                      </button>

                      {/* EDIT — admin only */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              category
                            )
                          }
                          disabled={
                            isPending
                          }
                          className="text-neutral-600 hover:text-[#263f60] disabled:opacity-50"
                          title="Edit kategori"
                        >
                          <svg
                            width="19"
                            height="19"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                          </svg>
                        </button>
                      )}

                      {/* DELETE — admin only */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              category.id
                            )
                          }
                          disabled={
                            isPending
                          }
                          className="text-red-500 hover:text-red-600 disabled:opacity-50"
                          title="Hapus kategori"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 15H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>

      {/* =====================================
          PANEL PRODUK
      ===================================== */}

      {selectedCategory && (
        <div className="fixed top-[72px] right-0 bottom-0 w-[360px] bg-white border-l border-neutral-300 shadow-lg z-40">
          <div className="h-full flex flex-col">

            {/* HEADER PANEL */}

            <div className="px-4 py-5 border-b border-neutral-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-[#182235]">
                    Produk dalam kategori{" "}
                    {selectedCategory.name}
                  </h2>

                  <p className="text-xs text-neutral-500 mt-1">
                    {
                      selectedCategory
                        ._count
                        .products
                    }{" "}
                    produk
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategoryId(
                      null
                    )
                  }
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRODUCT LIST */}

            <div className="flex-1 overflow-y-auto p-4">
              {selectedCategory.products
                .length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-neutral-400">
                    Belum ada produk dalam
                    kategori ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {selectedCategory.products.map(
                    (product) => (
                      <div
                        key={product.id}
                        className="flex gap-3"
                      >
                        {/* IMAGE */}

                        <div className="w-12 h-12 rounded-md border border-neutral-300 bg-neutral-50 overflow-hidden shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={
                                product.imageUrl
                              }
                              alt={
                                product.name
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="text-neutral-300"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="2"
                                />
                                <circle
                                  cx="8.5"
                                  cy="8.5"
                                  r="1.5"
                                />
                                <path d="m21 15-5-5L5 21" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* PRODUCT INFO */}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#182235] truncate">
                            {
                              product.name
                            }
                          </p>

                          <p className="text-xs text-neutral-500">
                            SKU:{" "}
                            {product.barcode ??
                              "-"}
                          </p>

                          <p className="text-xs font-semibold text-[#182235] mt-1">
                            {formatRupiah(
                              product.price
                            )}
                          </p>
                        </div>

                        {/* STOCK */}

                        <div className="self-end px-2 py-1 rounded bg-[#eef1ff] text-xs text-[#4b5870]">
                          {product.stock}{" "}
                          pcs
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* ADD PRODUCT */}

            <div className="p-4 border-t border-neutral-300">
              <button
                type="button"
                className="w-full border border-dashed border-neutral-300 py-2.5 rounded-md text-sm text-neutral-600 hover:bg-neutral-50 transition"
              >
                + Tambah Produk ke{" "}
                {selectedCategory.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          EDIT MODAL
      ===================================== */}

      {editingId && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center px-4">
          <div className="w-full max-w-[450px] bg-white rounded-lg shadow-xl">

            {/* MODAL HEADER */}

            <div className="px-6 py-5 border-b border-neutral-300 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#182235]">
                Edit kategori
              </h2>

              <button
                type="button"
                onClick={closeEdit}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="px-6 py-7">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nama kategori
              </label>

              <input
                type="text"
                value={editingName}
                onChange={(e) =>
                  setEditingName(
                    e.target.value
                  )
                }
                autoFocus
                disabled={isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdate();
                  }

                  if (e.key === "Escape") {
                    closeEdit();
                  }
                }}
                className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#263f60]/20"
              />
            </div>

            {/* MODAL FOOTER */}

            <div className="px-6 py-4 border-t border-neutral-300 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEdit}
                disabled={isPending}
                className="border border-neutral-300 rounded-lg px-5 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
              >
                {tc("cancel")}
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={
                  isPending ||
                  !editingName.trim()
                }
                className="bg-[#364256] hover:bg-[#293548] text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {isPending
                  ? "Menyimpan..."
                  : "Simpan perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}