"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, setSession } from "@/lib/auth";

export async function getOwnProfile() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
}

/**
 * Foto profil boleh diganti siapa saja yang login (Admin & Kasir),
 * karena murni tampilan, bukan identitas transaksi.
 */
export async function updateOwnAvatar(locale: string, avatarDataUrl: string) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");

  await prisma.user.update({
    where: { id: session.userId },
    data: { avatarUrl: avatarDataUrl },
  });
  revalidatePath(`/${locale}`, "layout");
}

/**
 * Ubah username/password HANYA untuk Admin (mengubah identitas/akses
 * miliknya sendiri). Kasir tidak boleh mengubah ini sama sekali --
 * mencegah kasir "menyamar" jadi identitas lain saat input transaksi.
 */
export async function updateOwnProfile(
  locale: string,
  input: { username: string; newPassword?: string }
) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (session.role !== "admin") throw new Error("FORBIDDEN");

  if (input.username !== session.username) {
    const existing = await prisma.user.findUnique({ where: { username: input.username } });
    if (existing) throw new Error("USERNAME_TAKEN");
  }

  const data: { username: string; passwordHash?: string } = { username: input.username };
  if (input.newPassword) {
    data.passwordHash = await bcrypt.hash(input.newPassword, 10);
  }

  const updated = await prisma.user.update({ where: { id: session.userId }, data });

  await setSession({ userId: updated.id, username: updated.username, role: updated.role });
  revalidatePath(`/${locale}`, "layout");
}
