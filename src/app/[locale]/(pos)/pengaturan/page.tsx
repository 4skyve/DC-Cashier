import { getTranslations } from "next-intl/server";
import { getStoreSetting } from "@/actions/setting";
import SettingsForm from "./SettingsForm";

export default async function PengaturanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "settings",
  });

  const setting = await getStoreSetting();

  return (
    <div className="max-w-[1100px] space-y-1">
      <h1 className="text-xl font-bold text-neutral-900">
        {t("title")}
      </h1>

      <p className="text-sm text-neutral-500 mb-5">
        {t("subtitle")}
      </p>

      <SettingsForm
        locale={locale}
        setting={setting}
      />
    </div>
  );
}