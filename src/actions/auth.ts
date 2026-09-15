"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/auth";

export async function loginAction(
  locale: string,
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) {
    return { error: "loginError" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "loginError" };
  }

  await setSession({ userId: user.id, username: user.username, role: user.role });
  redirect(`/${locale}/dashboard`);
}

export async function logoutAction(locale: string) {
  await clearSession();
  redirect(`/${locale}/login`);
}
