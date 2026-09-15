"use client";

import { useEffect, useState } from "react";
import { getReceiptData } from "@/actions/receipt";
import { X, Printer } from "lucide-react";

type ReceiptData = Awaited<ReturnType<typeof getReceiptData>>;

export default function ReceiptModal({
  transactionId,
  onClose,
}: {
  transactionId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getReceiptData(transactionId).then((result) => {
      if (active) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [transactionId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in print:bg-white print-backdrop-hide"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto animate-scale-in transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 print-hide">
          <span className="text-sm font-bold text-primary-900">Nota / Struk</span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading && <p className="text-center text-sm text-neutral-400 py-10">Memuat...</p>}
        {!loading && !data && <p className="text-center text-sm text-red-500 py-10">Data tidak ditemukan</p>}

        {data && (
          <>
            <div id="receipt-print-area" className="font-mono text-[12px] leading-relaxed p-5">
              <div className="text-center">
                <div className="font-bold text-sm">{data.setting.storeName}</div>
                {data.setting.storeAddress && <div>{data.setting.storeAddress}</div>}
                {data.setting.storePhone && <div>Telp: {data.setting.storePhone}</div>}
              </div>

              <div className="border-t border-dashed border-neutral-400 my-2" />

              <div>No: {data.transaction.transactionNumber}</div>
              <div>Kasir: {data.transaction.user?.username ?? "-"}</div>
              <div>{new Date(data.transaction.createdAt).toLocaleString("id-ID")}</div>

              <div className="border-t border-dashed border-neutral-400 my-2" />

              {data.transaction.items.map((item) => (
                <div key={item.id} className="mb-1">
                  <div>{item.product.name}</div>
                  <div className="flex justify-between">
                    <span>{item.qty} x {item.price.toLocaleString("id-ID")}</span>
                    <span>Rp{item.subtotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              ))}

              <div className="border-t border-dashed border-neutral-400 my-2" />

              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>Rp{data.transaction.total.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Bayar</span>
                <span className="uppercase">{data.transaction.paymentMethod}</span>
              </div>

              {data.setting.receiptHeader && (
                <>
                  <div className="border-t border-dashed border-neutral-400 my-2" />
                  <div className="text-center italic">{data.setting.receiptHeader}</div>
                </>
              )}
            </div>

            <div className="px-5 pb-5 print-hide">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 w-full bg-primary-700 hover:bg-primary-800 active:scale-98 text-white text-sm font-semibold py-2.5 rounded-xl shadow-sm transition-all duration-150"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak</span>
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @page {
          size: 80mm auto;
          margin: 4mm 2mm;
        }

        @media print {
          /*
           * 1. Hide everything on the page.
           * 2. Also reset overflow/height on ALL ancestors so the modal's
           *    overflow-y-auto + max-h-[90vh] does NOT clip the receipt.
           */
          html body * {
            visibility: hidden !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            animation: none !important;
            transition: none !important;
          }

          /* Reveal only the receipt content */
          #receipt-print-area,
          #receipt-print-area * {
            visibility: visible !important;
          }

          /*
           * position: absolute (NOT fixed) — avoids the Chrome bug where
           * position:fixed inside a CSS-transformed ancestor (animate-scale-in
           * uses transform: scale()) is positioned relative to that ancestor
           * instead of the viewport, causing clipping.
           */
          #receipt-print-area {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 76mm !important;   /* 80mm page - 2×2mm margin */
            overflow: visible !important;
            height: auto !important;
            background: white !important;
            padding: 2mm !important;
          }

          /* Hide modal chrome & print button */
          .print-hide {
            display: none !important;
            visibility: hidden !important;
          }

          /* Hide the dark overlay backdrop */
          .print-backdrop-hide {
            background: white !important;
            backdrop-filter: none !important;
          }
        }
      `}</style>
    </div>
  );
}
