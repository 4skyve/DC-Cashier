import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("admin123", 10);
  const kasirPass = await bcrypt.hash("kasir123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash: adminPass, role: "admin" },
  });
  await prisma.user.upsert({
    where: { username: "kasir1" },
    update: {},
    create: { username: "kasir1", passwordHash: kasirPass, role: "kasir" },
  });

  const snack = await prisma.category.upsert({
    where: { id: "cat-snack" },
    update: {},
    create: { id: "cat-snack", name: "Snack" },
  });
  const drink = await prisma.category.upsert({
    where: { id: "cat-drink" },
    update: {},
    create: { id: "cat-drink", name: "Minuman" },
  });

  await prisma.product.createMany({
    data: [
      { categoryId: snack.id, name: "Oreo Pack", unit: "pack", price: 12000, stock: 50 },
      { categoryId: snack.id, name: "Oreo Box", unit: "box", price: 85000, stock: 15 },
      { categoryId: snack.id, name: "Chitato Renceng", unit: "renceng", price: 45000, stock: 20 },
      { categoryId: snack.id, name: "Chitato Pcs", unit: "pcs", price: 9000, stock: 60 },
      { categoryId: drink.id, name: "Teh Botol Box", unit: "box", price: 55000, stock: 25 },
    ],
    skipDuplicates: true,
  });

  await prisma.storeSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "DCS Snacks Wholesale",
      storeAddress: "Jl. Industri Snack No.42, Surabaya",
      storePhone: "0812-3456-7890",
      lowStockThreshold: 5,
      nearExpiredDays: 7,
      receiptPaperSize: "58mm",
    },
  });

  console.log("Seed selesai. Login: admin/admin123 atau kasir1/kasir123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
