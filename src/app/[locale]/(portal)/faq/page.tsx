"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

type FAQItem = {
  question: string;
  answer: string;
};

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
  const t = useTranslations("faq");
  const [openGeneral, setOpenGeneral] = useState<number | null>(null);
  const [openProduct, setOpenProduct] = useState<number | null>(null);

  const generalFAQs: FAQItem[] = [
    { question: t("q1"), answer: t("a1") },
    { question: t("q2"), answer: t("a2") },
    { question: t("q3"), answer: t("a3") },
    { question: t("q4"), answer: t("a4") },
  ];

  const productFAQs: FAQItem[] = [
    { question: t("q5"), answer: t("a5") },
    { question: t("q6"), answer: t("a6") },
    { question: t("q7"), answer: t("a7") },
    { question: t("q8"), answer: t("a8") },
  ];

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
                {t("title")}
              </h1>

              <p className="mx-auto mt-3 max-w-[680px] text-[13px] leading-6 text-white/90 sm:mt-4 sm:text-sm md:text-[15px]">
                {t("subtitle")}
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
            {t("generalTitle")}
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
            {t("productTitle")}
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