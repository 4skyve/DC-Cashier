"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { loginAction } from "@/actions/auth";

export default function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction, pending] = useActionState(
    loginAction.bind(null, locale),
    undefined
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-neutral-700 block mb-1.5">
          {t("username")}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.3" />
            </svg>
          </span>
          <input
            name="username"
            required
            placeholder={t("placeholderUsername")}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 pl-10 pr-4 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-700/10 focus:border-primary-600 focus:bg-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-neutral-700">{t("password")}</label>
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder={t("placeholderPassword")}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 pl-10 pr-10 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-700/10 focus:border-primary-600 focus:bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.6 18.6 0 0 1 4.22-5.68M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{t("loginError")}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 bg-primary-700 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-800 disabled:opacity-50"
      >
        {t("loginButton")}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  );
}