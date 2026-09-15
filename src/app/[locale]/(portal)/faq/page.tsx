"use client";

import { useState } from "react";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

type FAQItem = {
  question: string;
  answer: string;
};

const generalFAQs: FAQItem[] = [
  {
    question: "Kapan jam operasional toko?",
    answer:
      "Toko kami melayani kebutuhan pelanggan pada jam operasional yang telah ditentukan. Untuk memastikan ketersediaan layanan, silakan menuju ke halaman kontak.",
  },
  {
    question: "Apakah ada minimum belanja?",
    answer:
      "Tidak ada minimal belanja di toko offline kami, silahkan belanja sesuai dengan kebutuhan anda dan akan kami melayani dengan baik.",
  },
  {
    question: "Apakah ada produk lain selain makanan dan minuman?",
    answer:
      "Untuk saat ini, toko kami baru menyediakan produk makanan dan minuman. Semoga di kedepannya toko kami juga menyediakan barang-barang kebutuhan yang lainnya.",
  },
  {
    question: "Bagaimana cara mengecek ketersediaan stok?",
    answer:
      "Pelanggan dapat melihat ketersediaan stok melalui halaman produk, atau menanyakan langsung melalui WhatsApp."
  },
];

const productFAQs: FAQItem[] = [
  {
    question: "Bagaimana cara melakukan pembelian?",
    answer:
      "Pelanggan dapat mengunjungi langsung toko offline kami di alamat yang tertera, atau memesan melalui WhatsApp apabila alamat memungkinkan.",
  },
  {
    question: "Bagaimana proses pemesanan via WhatsApp?",
    answer:
      "Hubungi nomor WhatsApp kami dan informasikan produk serta jumlah yang ingin dipesan. Tim kami akan membantu memproses pesanan dan memberikan informasi selanjutnya.",
  },
  {
    question: "Apakah semua orang dapat memesan via WhatsApp?",
    answer:
      "Tidak, pemesanan melalui WhatsApp hanya dapat dilakukan apabila alamat pemesan <5km",
  },
  {
    question: "Bagaimana dengan sistem pengiriman?",
    answer:
      "Pengiriman akan dilakukan langsung oleh pemilik toko, sehingga proses pengantaran dapat dijamin keamanannya.",
  },
];

function FAQCard({
  item,
  index,
  openIndex,
  setOpenIndex,
}: {
  item: FAQItem;
  index: number;
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
}) {
  const isOpen = openIndex === index;

  return (
    <div
      className={`overflow-hidden rounded-xl bg-white transition-all duration-300 hover:shadow-sm ${
        isOpen ? "shadow-md" : "shadow-none"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpenIndex(isOpen ? null : index)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-black/[0.015] sm:px-6 sm:py-[17px]"
      >
        <span className="text-[12px] font-semibold text-[#182235] sm:text-[13px]">
          {item.question}
        </span>

        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center text-[22px] font-normal text-[#0E2F55] transition-transform duration-300 ${
            isOpen ? "rotate-45" : "rotate-0"
          }`}
        >
          +
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[11px] leading-5 text-[#687182] sm:px-6 sm:text-xs">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openGeneral, setOpenGeneral] = useState<number | null>(null);
  const [openProduct, setOpenProduct] = useState<number | null>(null);

  return (
    <main className="bg-[#EEF3FF]">

      {/* =====================================================
          HERO FAQ
      ===================================================== */}
      <section className="mx-auto max-w-[1200px] px-5 pt-8 sm:pt-12 md:px-6 md:pt-11 lg:px-0">

        <AnimateOnScroll y={16}>
          <div className="flex min-h-[220px] items-center justify-center rounded-[20px] bg-[#1F416B] px-6 py-10 text-center sm:min-h-[270px] sm:rounded-[24px] sm:py-12 md:min-h-[285px]">

            <div className="mx-auto max-w-[760px] text-white">

              <h1 className="text-[clamp(1.5rem,5vw,2.5rem)] font-bold leading-[1.2] tracking-tight">
                Pertanyaan yang Sering Diajukan
              </h1>

              <p className="mx-auto mt-3 max-w-[680px] text-[13px] leading-6 text-white/90 sm:mt-4 sm:text-sm md:text-[15px]">
                Temukan jawaban untuk pertanyaan umum seputar pembelian grosir,
                pengiriman, dan layanan kami.
              </p>

            </div>

          </div>
        </AnimateOnScroll>
      </section>


      {/* =====================================================
          FAQ UMUM
      ===================================================== */}
      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:py-16 md:px-6 md:py-20 lg:px-0">

        <AnimateOnScroll>
          <h2 className="text-center text-xl font-bold text-[#182235] sm:text-2xl md:text-[28px] lg:text-[30px]">
            Kenali Duo Caesar Lebih Dekat
          </h2>
        </AnimateOnScroll>

        <div className="mt-7 grid grid-cols-1 gap-3.5 sm:mt-8 sm:gap-4 md:grid-cols-2">

          {/* LEFT */}
          <div className="space-y-3.5 sm:space-y-4">
            {generalFAQs.slice(0, 2).map((item, index) => (
              <AnimateOnScroll key={`${item.question}-${index}`} delay={index * 80} y={16}>
                <FAQCard
                  item={item}
                  index={index}
                  openIndex={openGeneral}
                  setOpenIndex={setOpenGeneral}
                />
              </AnimateOnScroll>
            ))}
          </div>

          {/* RIGHT */}
          <div className="space-y-3.5 sm:space-y-4">
            {generalFAQs.slice(2, 4).map((item, index) => (
              <AnimateOnScroll key={`${item.question}-${index + 2}`} delay={80 + index * 80} y={16}>
                <FAQCard
                  item={item}
                  index={index + 2}
                  openIndex={openGeneral}
                  setOpenIndex={setOpenGeneral}
                />
              </AnimateOnScroll>
            ))}
          </div>

        </div>
      </section>


      {/* =====================================================
          DIVIDER
      ===================================================== */}
      <div className="mx-auto max-w-[1200px] px-5 md:px-6 lg:px-0">
        <div className="h-px bg-[#DCE3F0]" />
      </div>


      {/* =====================================================
          FAQ PRODUK & LAYANAN
      ===================================================== */}
      <section className="mx-auto max-w-[1200px] px-5 py-12 pb-14 sm:py-14 sm:pb-16 md:px-6 md:py-16 md:pb-20 lg:px-0">

        <AnimateOnScroll>
          <h2 className="text-center text-xl font-bold text-[#182235] sm:text-2xl md:text-[28px] lg:text-[30px]">
            Pertanyaan Seputar Produk & Layanan
          </h2>
        </AnimateOnScroll>

        <div className="mt-7 grid grid-cols-1 gap-3.5 sm:mt-8 sm:gap-4 md:grid-cols-2">

          {/* LEFT */}
          <div className="space-y-3.5 sm:space-y-4">
            {productFAQs.slice(0, 2).map((item, index) => (
              <AnimateOnScroll key={`${item.question}-${index}`} delay={index * 80} y={16}>
                <FAQCard
                  item={item}
                  index={index}
                  openIndex={openProduct}
                  setOpenIndex={setOpenProduct}
                />
              </AnimateOnScroll>
            ))}
          </div>

          {/* RIGHT */}
          <div className="space-y-3.5 sm:space-y-4">
            {productFAQs.slice(2, 4).map((item, index) => (
              <AnimateOnScroll key={`${item.question}-${index + 2}`} delay={80 + index * 80} y={16}>
                <FAQCard
                  item={item}
                  index={index + 2}
                  openIndex={openProduct}
                  setOpenIndex={setOpenProduct}
                />
              </AnimateOnScroll>
            ))}
          </div>

        </div>
      </section>

    </main>
  );
}