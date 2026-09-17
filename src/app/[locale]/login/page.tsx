import { getTranslations } from "next-intl/server";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex bg-primary-700 items-center justify-center p-10">
        <div className="text-center text-white">
          <img src="https://cdn.phototourl.com/free/2026-08-30-5da21fa0-19e9-43de-99db-3df48066eb24.png" alt="Duo Caesar" className="mx-auto mb-2 w-64" />
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 bg-[#ffffff]">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-primary-700 flex items-center justify-center">
              <img
                src="https://www.svgrepo.com/show/464260/cashier.svg"
                alt="Kasir"
                width={20}
                height={20}
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <div>
              <div className="font-bold text-primary-800 leading-tight">Caesar Cashier</div>
              <div className="text-xs text-neutral-500">POS &amp; Inventory System</div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-primary-800">{t("loginTitle")}</h1>
          <p className="text-sm text-neutral-500 mt-1 mb-6">{t("loginSubtitle")}</p>
          <LoginForm locale={locale} />

          <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
            <span>© {new Date().getFullYear()} Duo Caesar </span>
            <div className="flex items-center gap-4 uppercase tracking-wide">
              <span className="cursor-pointer hover:text-neutral-600">Support</span>
              <span className="cursor-pointer hover:text-neutral-600">Privacy</span>
              <span className="cursor-pointer hover:text-neutral-600">Terms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}