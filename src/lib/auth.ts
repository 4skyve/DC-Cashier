import { cookies } from "next/headers";

export type Session = {
  userId: string;
  username: string;
  role: "admin" | "kasir";
};

const COOKIE_NAME = "dcs_session";

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;

  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session) {
  const store = await cookies();

  store.set(
    COOKIE_NAME,
    JSON.stringify(session),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    }
  );
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/* =========================
   ROLE HELPERS
========================= */

export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();

  if (session.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return session;
}