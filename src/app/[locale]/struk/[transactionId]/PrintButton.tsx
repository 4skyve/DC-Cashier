"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-150"
    >
      <Printer className="w-4 h-4" />
      <span>Cetak Struk</span>
    </button>
  );
}
