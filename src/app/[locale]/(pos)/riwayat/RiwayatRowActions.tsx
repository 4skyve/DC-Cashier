"use client";

import { useState, useTransition } from "react";
import { deleteTransaction } from "@/actions/transaction";
import ReceiptModal from "@/components/pos/ReceiptModal";

export default function RiwayatRowActions({
  locale,
  transactionId,
  status,
  isAdmin = false,
}: {
  locale: string;
  transactionId: string;
  status: string;
  isAdmin?: boolean;
}) {
  const [isPending, startTransition] =
    useTransition();

  const [showReceipt, setShowReceipt] =
    useState(false);

  const [confirmDelete, setConfirmDelete] =
    useState(false);

  function handleDelete() {
    if (
      !confirm(
        "Hapus transaksi ini?"
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteTransaction(
          locale,
          transactionId
        );
      } catch (error) {
        console.error(error);
        alert(
          "Gagal menghapus transaksi."
        );
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-4">

        {/* LIHAT */}
        <button
          type="button"
          onClick={() =>
            setShowReceipt(true)
          }
          className="text-neutral-500 hover:text-primary-700 transition"
          title="Lihat transaksi"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
            <circle
              cx="12"
              cy="12"
              r="2.5"
            />
          </svg>
        </button>

        {/* PRINT */}
        <button
          type="button"
          onClick={() =>
            setShowReceipt(true)
          }
          className="text-neutral-500 hover:text-primary-700 transition"
          title="Cetak struk"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9V2h12v7" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect
              x="6"
              y="14"
              width="12"
              height="8"
            />
          </svg>
        </button>

        {/* DELETE — admin only */}
        {isAdmin &&
          (!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={isPending}
              className="text-neutral-500 hover:text-red-500 transition disabled:opacity-50"
              title="Hapus transaksi"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-500 hover:underline"
              >
                {isPending ? "..." : "Yakin?"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                Batal
              </button>
            </div>
          ))}

      </div>

      {/* RECEIPT / DETAIL */}
      {showReceipt && (
        <ReceiptModal
          transactionId={transactionId}
          onClose={() =>
            setShowReceipt(false)
          }
        />
      )}
    </>
  );
}