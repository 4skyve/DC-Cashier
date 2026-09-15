import { getTranslations } from "next-intl/server";
import { getUsers } from "@/actions/user";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserManager from "./UserManager";

export default async function PenggunaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations({
    locale,
    namespace: "pengguna",
  });

  const users = await getUsers();

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-primary-800">
          {t("title")}
        </h1>

        <p className="text-sm text-neutral-400">
          {t("subtitle")}
        </p>
      </div>

      <UserManager
        locale={locale}
        users={users}
        currentUserId={session.userId}
      />
    </div>
  );
}