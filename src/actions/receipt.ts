"use server";

import { prisma } from "@/lib/prisma";
import { getStoreSetting } from "@/actions/setting";

export async function getReceiptData(transactionId: string) {
  const [transaction, setting] = await Promise.all([
    prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { items: { include: { product: true } }, user: true },
    }),
    getStoreSetting(),
  ]);

  if (!transaction) return null;
  return { transaction, setting };
}
