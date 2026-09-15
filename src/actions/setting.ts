"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getStoreSetting() {
  const existing = await prisma.storeSetting.findFirst();
  if (existing) return existing;
  return prisma.storeSetting.create({
    data: { id: "singleton", storeName: "DCS Commerce" },
  });
}

type UpdateSettingInput = {
  storeName: string;
  storePhone?: string;
  storeAddress?: string;
  logoUrl?: string;
  receiptHeader?: string;
  lowStockThreshold: number;
  nearExpiredDays: number;
  receiptPaperSize: string;
  theme?: string;
  defaultLanguage?: string;
  catalogDescription?: string;
};

export async function updateStoreSetting(locale: string, input: UpdateSettingInput) {
  const existing = await prisma.storeSetting.findFirst();
  await prisma.storeSetting.upsert({
    where: { id: existing?.id ?? "singleton" },
    update: input,
    create: { id: "singleton", ...input },
  });
  revalidatePath(`/${locale}/pengaturan`);
  revalidatePath(`/${locale}`);
}
