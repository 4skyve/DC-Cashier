"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return session;
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { username: "asc" }],
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      role: true,
      isActive: true,
      avatarUrl: true,
    },
  });
}

export async function createUser(
  locale: string,
  input: {
    username: string;
    password: string;
    role: "admin" | "kasir";
  }
) {
  await requireAdmin();

  const username = input.username.trim();

  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    throw new Error("USERNAME_TAKEN");
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    10
  );

  await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: input.role,
    },
  });

  revalidatePath(`/${locale}/pengguna`);
}

export async function updateUser(
  locale: string,
  id: string,
  input: {
    username: string;
    password?: string;
    role: "admin" | "kasir";
  }
) {
  const session = await requireAdmin();

  const username = input.username.trim();

  const existing = await prisma.user.findFirst({
    where: {
      username,
      NOT: {
        id,
      },
    },
  });

  if (existing) {
    throw new Error("USERNAME_TAKEN");
  }

  const data: {
    username: string;
    role: "admin" | "kasir";
    passwordHash?: string;
  } = {
    username,
    role: input.role,
  };

  // Password hanya diubah jika diisi
  if (input.password?.trim()) {
    data.passwordHash = await bcrypt.hash(
      input.password.trim(),
      10
    );
  }

  // Jangan mengubah session akun yang sedang login
  // selain data username/role yang memang boleh diedit.
  await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath(`/${locale}/pengguna`);
  revalidatePath(`/${locale}/pengguna/${id}/edit`);
}

export async function toggleUserActive(
  locale: string,
  id: string,
  isActive: boolean
) {
  const session = await requireAdmin();

  // Akun sendiri tidak boleh dinonaktifkan
  if (session.userId === id) {
    throw new Error("CANNOT_CHANGE_SELF");
  }

  await prisma.user.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath(`/${locale}/pengguna`);
}

export async function deleteUser(
  locale: string,
  id: string
) {
  const session = await requireAdmin();

  // Akun sendiri tidak boleh dihapus
  if (session.userId === id) {
    throw new Error("CANNOT_DELETE_SELF");
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath(`/${locale}/pengguna`);
}