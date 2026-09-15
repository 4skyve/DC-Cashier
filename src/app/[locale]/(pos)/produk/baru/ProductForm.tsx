"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, Upload } from "lucide-react";

import { createProduct, updateProduct } from "@/actions/product";

type Category = {
  id: string;
  name: string;
};

type ProductData = {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  price: number;
  stock: number;
  barcode: string | null;
  expiredDate: Date | null;
  description: string | null;
  imageUrl: string | null;
};

export default function ProductForm({
  locale,
  categories,
  product,
}: {
  locale: string;
  categories: Category[];
  product?: ProductData;
}) {
  const t = useTranslations("produk");
  const tc = useTranslations("common");

  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expiredDefault = product?.expiredDate
    ? new Date(product.expiredDate).toISOString().slice(0, 10)
    : "";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      alert("Ukuran gambar maksimal 1.5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const input = {
      name: String(fd.get("name") || ""),
      categoryId: String(fd.get("categoryId") || ""),
      unit: fd.get("unit") as never,
      price: Number(fd.get("price") || 0),
      stock: product ? product.stock : Number(fd.get("stock") || 0),
      barcode: String(fd.get("barcode") || ""),
      expiredDate: String(fd.get("expiredDate") || ""),
      description: String(fd.get("description") || ""),
      imageUrl: String(fd.get("imageUrl") || ""),
    };

    startTransition(async () => {
      if (product) {
        await updateProduct(locale, product.id, input);
      } else {
        await createProduct(locale, input);
      }

      router.push(`/${locale}/produk`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* GAMBAR */}
      <Section title="Foto Produk" icon={<IconImage />}>
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-xl bg-neutral-50 border-2 border-dashed border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center text-neutral-300 text-3xl">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-neutral-300" />
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMethod("url")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  uploadMethod === "url"
                    ? "bg-primary-700 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod("file")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  uploadMethod === "file"
                    ? "bg-primary-700 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Upload File
              </button>
            </div>

            {uploadMethod === "url" ? (
              <>
                <input
                  name="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="input"
                />
                <p className="text-xs text-neutral-400">
                  {t("imageUrlNote")}
                </p>
              </>
            ) : (
              <>
                <input
                  name="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  type="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {imageUrl ? t("changeFile") : t("chooseFile")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-neutral-400">
                  Maksimal 1.5MB (JPG, PNG, WebP)
                </p>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* DATA PRODUK */}
      <Section title="Data Produk" icon={<IconTag />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t("name")}>
            <input
              name="name"
              required
              defaultValue={product?.name}
              className="input"
            />
          </Field>

          <Field label={t("category")}>
            <select
              name="categoryId"
              required
              defaultValue={product?.categoryId ?? ""}
              className="input"
            >
              <option value="">{t("selectCategory")}</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("unit")}>
            <select
              name="unit"
              required
              defaultValue={product?.unit ?? "pack"}
              className="input"
            >
              <option value="pack">{t("unitPack")}</option>
              <option value="box">{t("unitBox")}</option>
              <option value="renceng">{t("unitRenceng")}</option>
              <option value="pcs">{t("unitPcs")}</option>
            </select>
          </Field>

          <Field label={t("barcode")}>
            <input
              name="barcode"
              defaultValue={product?.barcode ?? ""}
              className="input"
            />
          </Field>
        </div>
      </Section>

      {/* HARGA & STOK */}
      <Section title="Harga & Stok" icon={<IconPrice />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t("price")}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                Rp
              </span>
              <input
                name="price"
                type="number"
                min={0}
                required
                defaultValue={product?.price}
                className="input pl-9"
              />
            </div>
          </Field>

          {!product && (
            <Field label={t("stock")}>
              <input
                name="stock"
                type="number"
                min={0}
                required
                defaultValue={0}
                className="input"
              />
              <p className="text-xs text-neutral-400 mt-1">
                {t("initialStock")}
              </p>
            </Field>
          )}

          <Field label={t("expiredDate")}>
            <input
              name="expiredDate"
              type="date"
              defaultValue={expiredDefault}
              className="input"
            />
          </Field>
        </div>
      </Section>

      {/* DESKRIPSI */}
      <Section title="Deskripsi" icon={<IconNote />}>
        <textarea
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="input resize-none"
        />
      </Section>

      {/* BUTTON */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-700 text-white text-sm px-5 py-2.5 rounded-lg font-medium hover:bg-primary-800 disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : tc("save")}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="border border-neutral-200 text-sm px-5 py-2.5 rounded-lg font-medium hover:bg-neutral-50 disabled:opacity-50"
        >
          {tc("cancel")}
        </button>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          background: white;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .input:focus {
          border-color: #64748b;
          box-shadow: 0 0 0 3px rgba(100, 116, 139, 0.08);
        }
      `}</style>
    </form>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50/60">
        <span className="text-neutral-400">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-neutral-700 block mb-1.5">
        {label}
      </label>

      {children}
    </div>
  );
}

function IconImage() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41 11 22.99a2 2 0 0 1-2.83 0L2 16.83a2 2 0 0 1 0-2.83l9.58-9.58L20.59 13.41Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

function IconPrice() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 15.5c.5 1 1.5 1.5 2.5 1.5 1.7 0 3-1 3-2.3 0-2.6-5.5-1-5.5-3.7 0-1.3 1.3-2.3 3-2.3 1 0 2 .5 2.5 1.5" />
      <path d="M12 6v1.3M12 16.7V18" />
    </svg>
  );
}

function IconNote() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  );
}