"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { StockMovementType } from "@prisma/client";

export async function getStockMovements(productId: string) {
  return prisma.stockMovement.findMany({
    where: { productId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/**
 * Stock In / Stock Out / Penyesuaian manual (F-INV-01..03). Atomik:
 * update stok produk + catat StockMovement dalam satu transaksi.
 * `delta` sudah bertanda dari sisi client (positif = nambah, negatif = kurang).
 */
export async function recordStockMovement(
  locale: string,
  input: { productId: string; delta: number; type: StockMovementType; note?: string }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("FORBIDDEN");

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id: input.productId } });
    const newStock = product.stock + input.delta;
    if (newStock < 0) throw new Error("STOCK_NEGATIVE");

    await tx.product.update({ where: { id: input.productId }, data: { stock: newStock } });
    await tx.stockMovement.create({
      data: {
        productId: input.productId,
        createdBy: session.userId,
        qty: input.delta,
        type: input.type,
        note: input.note || null,
      },
    });
  });

  revalidatePath(`/${locale}/produk`);
  revalidatePath(`/${locale}/produk/${input.productId}/stok`);
  revalidatePath(`/${locale}/dashboard`);
}
