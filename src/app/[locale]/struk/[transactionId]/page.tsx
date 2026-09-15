import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStoreSetting } from "@/actions/setting";
import { getSession } from "@/lib/auth";
import PrintButton from "./PrintButton";

export default async function StrukPage({
  params,
}: {
  params: Promise<{ locale: string; transactionId: string }>;
}) {
  const { locale, transactionId } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}/login`);

  const [transaction, setting] = await Promise.all([
    prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { items: { include: { product: true } }, user: true },
    }),
    getStoreSetting(),
  ]);

  if (!transaction) notFound();

  const isNarrow = setting.receiptPaperSize === "58mm";

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center py-8 px-4">
      <div className="print-hide mb-4">
        <PrintButton />
      </div>

      <div
        id="receipt"
        className={`bg-white shadow-sm font-mono text-[12px] leading-relaxed p-4 ${
          isNarrow ? "w-[260px]" : "w-[320px]"
        }`}
      >
        <div className="text-center">
          <div className="font-bold text-sm">{setting.storeName}</div>
          {setting.storeAddress && <div>{setting.storeAddress}</div>}
          {setting.storePhone && <div>Telp: {setting.storePhone}</div>}
        </div>

        <div className="border-t border-dashed border-neutral-400 my-2" />

        <div>No: {transaction.transactionNumber}</div>
        <div>Kasir: {transaction.user?.username ?? "-"}</div>
        <div>{transaction.createdAt.toLocaleString("id-ID")}</div>

        <div className="border-t border-dashed border-neutral-400 my-2" />

        {transaction.items.map((item) => (
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
          <span>Rp{transaction.total.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Bayar</span>
          <span className="uppercase">{transaction.paymentMethod}</span>
        </div>

        {setting.receiptHeader && (
          <>
            <div className="border-t border-dashed border-neutral-400 my-2" />
            <div className="text-center italic">{setting.receiptHeader}</div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          @page { margin: 0; }
          body { margin: 0; }
          .print-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
}
