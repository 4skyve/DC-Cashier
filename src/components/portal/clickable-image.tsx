"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type ClickableImageProps = {
  src: string;
  alt: string;
  className?: string; // class untuk wrapper (div)
  imgClassName?: string; // class tambahan untuk <img>
};

export function ClickableImage({
  src,
  alt,
  className = "",
  imgClassName = "",
}: ClickableImageProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (open) {
      // trigger fade/scale-in setelah mount
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleClick = () => {
    setPop(true);
    setOpen(true);
    setTimeout(() => setPop(false), 200);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Lihat ${alt} lebih besar`}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className={`cursor-zoom-in overflow-hidden outline-none ${className}`}
      >
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-transform duration-300 ease-out hover:scale-105 ${
            pop ? "scale-90" : "scale-100"
          } ${imgClassName}`}
        />
      </div>

      {open && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 transition-opacity duration-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        >
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl transition-transform duration-200 ease-out ${
              visible ? "scale-100" : "scale-90"
            }`}
          />

          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:scale-110 hover:bg-white/20 active:scale-95 sm:right-6 sm:top-6"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}