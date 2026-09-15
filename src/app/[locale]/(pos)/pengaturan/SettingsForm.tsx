"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateStoreSetting } from "@/actions/setting";
import type { StoreSetting } from "@prisma/client";
import { Store, Image as ImageIcon, Trash2, SlidersHorizontal, Check, Receipt } from "lucide-react";

export default function SettingsForm({
  locale,
  setting,
}: {
  locale: string;
  setting: StoreSetting;
}) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");

  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    storeName: setting.storeName ?? "",
    storePhone: setting.storePhone ?? "",
    storeAddress: setting.storeAddress ?? "",
    logoUrl: setting.logoUrl ?? "",
    receiptHeader: setting.receiptHeader ?? "",
    lowStockThreshold: setting.lowStockThreshold,
    nearExpiredDays: setting.nearExpiredDays,
    receiptPaperSize: setting.receiptPaperSize,
    theme: setting.theme,
    catalogDescription: setting.catalogDescription ?? "",
  });

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      await updateStoreSetting(locale, form);
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        {/* LEFT */}
        <div className="space-y-6">
          {/* PROFIL TOKO */}
          <section className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-1">
              <Store className="w-5 h-5 text-primary-700" />
              <h2 className="text-xl font-semibold text-neutral-800">
                Profil Toko
              </h2>
            </div>

            <p className="text-xs text-neutral-500">
              Informasi dasar yang akan ditampilkan pada sistem dan struk.
            </p>

            <div className="border-t border-neutral-200 my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-[210px_1fr] gap-8">
              {/* LOGO */}
              <div>
                <label className="text-sm font-semibold text-neutral-800 block mb-2">
                  Logo Toko
                </label>

                <div className="w-full h-[200px] border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50 flex items-center justify-center overflow-hidden">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo toko"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-neutral-300" />
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <label className="flex-1 h-10 border border-neutral-300 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-neutral-50">
                    Pilih File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            update("logoUrl", reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => update("logoUrl", "")}
                    className="w-10 h-10 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2">
                  <input
                    value={form.logoUrl}
                    onChange={(e) => update("logoUrl", e.target.value)}
                    placeholder="Atau masukkan URL logo..."
                    className="input text-xs"
                  />
                </div>
              </div>

              {/* INFORMASI TOKO */}
              <div className="space-y-4">
                <Field label="Nama Toko">
                  <input
                    value={form.storeName}
                    onChange={(e) =>
                      update("storeName", e.target.value)
                    }
                    className="input"
                  />
                </Field>

                <Field label="Nomor Telepon">
                  <input
                    value={form.storePhone}
                    onChange={(e) =>
                      update("storePhone", e.target.value)
                    }
                    className="input"
                  />
                </Field>

                <Field label="Alamat Lengkap">
                  <textarea
                    value={form.storeAddress}
                    onChange={(e) =>
                      update("storeAddress", e.target.value)
                    }
                    rows={3}
                    className="input resize-none"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* THRESHOLD */}
          <section className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-1">
              <SlidersHorizontal className="w-5 h-5 text-primary-700" />
              <h2 className="text-xl font-semibold text-neutral-800">
                Ambang Batas (Threshold)
              </h2>
            </div>

            <p className="text-xs text-neutral-500">
              Atur peringatan sistem untuk inventaris dan kedaluwarsa.
            </p>

            <div className="border-t border-neutral-200 my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Batas Stok Minimum">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={form.lowStockThreshold}
                    onChange={(e) =>
                      update(
                        "lowStockThreshold",
                        Number(e.target.value)
                      )
                    }
                    className="input pr-14"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                    Unit
                  </span>
                </div>

                <p className="text-xs text-neutral-500 mt-2">
                  Sistem akan memberi peringatan jika stok produk
                  menyentuh angka ini.
                </p>
              </Field>

              <Field label="Peringatan Kedaluwarsa">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={form.nearExpiredDays}
                    onChange={(e) =>
                      update(
                        "nearExpiredDays",
                        Number(e.target.value)
                      )
                    }
                    className="input pr-14"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
                    Hari
                  </span>
                </div>

                <p className="text-xs text-neutral-500 mt-2">
                  Notifikasi akan muncul sebelum produk melewati
                  masa kedaluwarsa.
                </p>
              </Field>
            </div>
          </section>

          {/* SAVE */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : tc("save")}
            </button>

            {saved && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <Check className="w-3.5 h-3.5" /> {t("saved")}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* PENGATURAN STRUK */}
          <section className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <Receipt className="w-5 h-5 text-primary-700" />
              <h2 className="text-xl font-semibold text-neutral-800">
                Pengaturan Struk
              </h2>
            </div>

            <div className="border-t border-neutral-200 mb-5" />

            <Field label="Ukuran Kertas">
              <div className="flex items-center gap-5">
                {["58mm", "80mm"].map((size) => (
                  <label
                    key={size}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="receiptPaperSize"
                      checked={form.receiptPaperSize === size}
                      onChange={() =>
                        update("receiptPaperSize", size)
                      }
                      className="accent-primary-700"
                    />
                    {size}
                  </label>
                ))}
              </div>
            </Field>

            <div className="mt-6">
              <Field label="Pesan Header">
                <textarea
                  value={form.receiptHeader}
                  onChange={(e) =>
                    update("receiptHeader", e.target.value)
                  }
                  rows={3}
                  maxLength={120}
                  className="input resize-none"
                />

                <p className="text-xs text-neutral-400 mt-1">
                  Pesan ini akan ditampilkan pada bagian bawah isi
                  struk.
                </p>
              </Field>
            </div>
          </section>

          {/* PREVIEW */}
          <section className="bg-white border border-neutral-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-neutral-800 mb-4">
              Pratinjau Struk
            </h3>

            <div className="border border-neutral-300 bg-white p-4 text-[10px] font-mono text-center leading-relaxed">
              {/* LOGO */}
              {form.logoUrl && (
                <div className="flex justify-center mb-2">
                  <img
                    src={form.logoUrl}
                    alt="Logo toko"
                    className="max-h-16 max-w-[120px] object-contain"
                  />
                </div>
              )}

              {/* STORE INFO */}
              <div className="font-bold uppercase">
                {form.storeName || "NAMA TOKO"}
              </div>

              <div>{form.storeAddress || "-"}</div>

              <div>Telp: {form.storePhone || "-"}</div>

              <div className="border-t border-dashed border-neutral-400 my-3" />

              {/* PRODUCTS */}
              <div className="text-left">
                <div className="flex justify-between gap-2">
                  <span>Kripik Singkong 1kg</span>
                  <span>Rp45.000</span>
                </div>

                <div className="flex justify-between gap-2">
                  <span>Kacang Atom (Box)</span>
                  <span>Rp120.000</span>
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-400 my-3" />

              {/* TOTAL */}
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>Rp165.000</span>
              </div>

              {/* RECEIPT HEADER MESSAGE */}
              {form.receiptHeader && (
                <div className="mt-4 italic">
                  {form.receiptHeader}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #d9dde5;
          border-radius: 0.5rem;
          padding: 0.65rem 0.75rem;
          font-size: 0.875rem;
          background: white;
          color: #1f2937;
          outline: none;
        }

        .input:focus {
          border-color: #64748b;
          box-shadow: 0 0 0 1px #64748b;
        }
      `}</style>
    </form>
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
      <label className="text-sm font-semibold text-neutral-800 block mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}