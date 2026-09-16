"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ProductUnit } from "@prisma/client";

export async function getActiveProducts(search?: string) {
  return prisma.product.findMany({
    where: {
      status: "active",
      ...(search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {}),
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}

export async function getAllProducts(opts?: {
  page?: number;
  perPage?: number;
  sort?: string;
  categoryId?: string;
  q?: string;
}) {
  const page = opts?.page ?? 1;
  const perPage = opts?.perPage ?? 15;

  const [sortField, sortDir] = (
    opts?.sort ?? "createdAt-desc"
  ).split("-") as [string, "asc" | "desc"];

  const where = {
    ...(opts?.categoryId
      ? {
          categoryId: opts.categoryId,
        }
      : {}),
    ...(opts?.q
      ? {
          name: {
            contains: opts.q,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        [sortField]: sortDir,
      },
      skip: (page - 1) * perPage,
      take: perPage,
    }),

    prisma.product.count({
      where,
    }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(
      1,
      Math.ceil(total / perPage)
    ),
  };
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
      products: {
        select: {
          id: true,
          name: true,
          barcode: true,
          price: true,
          stock: true,
          imageUrl: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((category) => ({
    ...category,
    products: category.products.map((product) => ({
      ...product,
      price: Number(product.price),
    })),
  }));
}

export async function createCategory(
  locale: string,
  name: string
) {
  const category = await prisma.category.create({
    data: {
      name,
    },
  });

  revalidatePath(`/${locale}/kategori`);
  
  return category;
}

export async function updateCategory(
  locale: string,
  id: string,
  name: string
) {
  await prisma.category.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });

  revalidatePath(`/${locale}/kategori`);
}

export async function deleteCategory(
  locale: string,
  id: string
) {
  const count = await prisma.product.count({
    where: {
      categoryId: id,
    },
  });

  if (count > 0) {
    throw new Error("CATEGORY_HAS_PRODUCTS");
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  revalidatePath(`/${locale}/kategori`);
}

type CreateProductInput = {
  name: string;
  categoryId: string;
  unit: ProductUnit;
  price: number;
  stock: number;
  barcode?: string;
  expiredDate?: string;
  description?: string;
  imageUrl?: string;
};

export async function createProduct(
  locale: string,
  input: CreateProductInput
) {
  await prisma.product.create({
    data: {
      name: input.name,
      categoryId: input.categoryId,
      unit: input.unit,
      price: input.price,
      stock: input.stock,
      barcode: input.barcode || null,
      expiredDate: input.expiredDate
        ? new Date(input.expiredDate)
        : null,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
    },
  });

  revalidatePath(`/${locale}/produk`);
  revalidatePath(`/${locale}/katalog`);
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: {
      id,
    },
  });
}

export async function updateProduct(
  locale: string,
  id: string,
  input: CreateProductInput
) {
  await prisma.product.update({
    where: {
      id,
    },
    data: {
      name: input.name,
      categoryId: input.categoryId,
      unit: input.unit,
      price: input.price,
      barcode: input.barcode || null,
      expiredDate: input.expiredDate
        ? new Date(input.expiredDate)
        : null,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
    },
  });

  revalidatePath(`/${locale}/produk`);
  revalidatePath(`/${locale}/katalog`);
}

export async function toggleProductStatus(
  locale: string,
  id: string,
  status: "active" | "inactive"
) {
  await prisma.product.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  revalidatePath(`/${locale}/produk`);
  revalidatePath(`/${locale}/katalog`);
}

export async function deleteProduct(
  locale: string,
  id: string
) {
  await prisma.product.delete({
    where: {
      id,
    },
  });

  revalidatePath(`/${locale}/produk`);
  revalidatePath(`/${locale}/katalog`);
}