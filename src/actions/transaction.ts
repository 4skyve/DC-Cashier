"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { PaymentMethod } from "@prisma/client";

type CartLine = { productId: string; qty: number };

function generateTransactionNumber() {
  const now = new Date();
  const stamp = now.toISOString().replace(/\D/g, "").slice(0, 14);
  return `TRX-${stamp}-${Math.floor(Math.random() * 900 + 100)}`;
}

/**
 * Ambil daftar transaksi dengan pagination.
 */
export async function getTransactions(opts: {
  page?: number;
  perPage?: number;
}) {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 20;

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      include: { user: true, items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.transaction.count(),
  ]);

  return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

/**
 * Retur/Refund transaksi POS: mengembalikan stok tiap item, mencatat
 * StockMovement tipe "return", dan menandai transaksi berstatus "returned".
 * Hanya Admin. Atomik (NF-09).
 */
export async function refundTransaction(locale: string, transactionId: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("FORBIDDEN");

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUniqueOrThrow({
      where: { id: transactionId },
      include: { items: true },
    });
    if (transaction.status !== "completed") throw new Error("INVALID_STATE");

    for (const item of transaction.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.qty } },
      });
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          createdBy: session.userId,
          qty: item.qty,
          type: "return",
          note: `Retur transaksi ${transaction.transactionNumber}`,
        },
      });
    }

    await tx.transaction.update({ where: { id: transactionId }, data: { status: "returned" } });
  });

  revalidatePath(`/${locale}/riwayat`);
  revalidatePath(`/${locale}/dashboard`);
}

/**
 * Hapus data transaksi (murni untuk keperluan bersih-bersih data uji coba/demo,
 * BUKAN alur bisnis retur). Tidak mengembalikan stok. Admin only.
 */
export async function deleteTransaction(locale: string, transactionId: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") throw new Error("FORBIDDEN");

  await prisma.$transaction(async (tx) => {
    await tx.transactionItem.deleteMany({ where: { transactionId } });
    await tx.transaction.delete({ where: { id: transactionId } });
  });

  revalidatePath(`/${locale}/riwayat`);
  revalidatePath(`/${locale}/dashboard`);
}

/**
 * Membuat transaksi POS (offline). Sesuai NF-09: pengecekan stok dan
 * pengurangan stok dilakukan dalam satu database transaction (atomik)
 * agar tidak terjadi race condition / stok minus.
 */
export async function createPosTransaction(
  locale: string,
  lines: CartLine[],
  paymentMethod: PaymentMethod
) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (lines.length === 0) throw new Error("EMPTY_CART");

  const result = await prisma.$transaction(async (tx) => {
    let total = 0;
    const transactionNumber = generateTransactionNumber();

    const transaction = await tx.transaction.create({
      data: {
        transactionNumber,
        user: session.userId ? { connect: { id: session.userId } } : undefined,
        source: "pos",
        total: 0,
        paymentMethod,
        status: "completed",
      },
    });

    for (const line of lines) {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: line.productId },
      });
      if (product.stock < line.qty) {
        throw new Error(`OUT_OF_STOCK:${product.name}`);
      }

      const subtotal = product.price * line.qty;
      total += subtotal;

      await tx.transactionItem.create({
        data: {
          transactionId: transaction.id,
          productId: product.id,
          qty: line.qty,
          price: product.price,
          subtotal,
        },
      });

      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: line.qty } },
      });

      await tx.stockMovement.create({
        data: {
          productId: product.id,
          createdBy: session.userId,
          qty: -line.qty,
          type: "transaction",
          note: `Transaksi POS ${transactionNumber}`,
        },
      });
    }

    return tx.transaction.update({
      where: { id: transaction.id },
      data: { total },
    });
  });

  revalidatePath(`/${locale}/kasir`);
  revalidatePath(`/${locale}/produk`);
  revalidatePath(`/${locale}/riwayat`);
  revalidatePath(`/${locale}/dashboard`);
  return result;
}
