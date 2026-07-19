"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, HeartPulse, LockKeyhole, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";
import { useT } from "@/i18n";

const LoginPage = () => {
  const { t } = useT();
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f8_0%,#ffffff_55%,#f8fafc_100%)] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Link>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 sm:text-sm">
            <ShieldCheck className="h-4 w-4" />
            {t("login.secureLogin")}
          </div>
        </div>

        <section className="grid min-h-[calc(100vh-92px)] overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
          {/* Desktop visual panel */}
          <div className="relative hidden overflow-hidden bg-[#07111f] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-28 top-0 h-80 w-80 rounded-full bg-red-500/20 blur-[110px]" />
              <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-blue-400/10 blur-[130px]" />

              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 shadow-lg shadow-red-500/20">
                  <HeartPulse className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xl font-black tracking-tight">
                    Life<span className="text-red-400">Link</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {t("login.emergencyNetwork")}
                  </p>
                </div>
              </div>

              <div className="mt-20">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-300">
                  {t("login.welcomeBack")}
                </p>

                <h1 className="mt-5 max-w-xl text-5xl font-black leading-[1.03] tracking-[-0.05em]">
                  {t("login.headline")}
                </h1>

                <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
                  {t("login.description")}
                </p>
              </div>
            </div>

            <div className="relative space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                  <LockKeyhole className="h-5 w-5 text-emerald-300" />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    {t("login.accountPrivate")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {t("login.accountPrivateDesc")}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-red-400/15 bg-red-500/10 p-4">
                <p className="text-sm font-bold text-red-200">
                  {t("login.emergencyAlert")}
                </p>
              </div>
            </div>
          </div>

          {/* Login form */}
          <div className="flex items-center justify-center px-4 py-7 sm:px-8 sm:py-10 lg:px-14 xl:px-20">
            <div className="w-full max-w-md">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-red-200 blur-xl" />

                  <div className="relative rounded-3xl border border-red-100 bg-white p-2 shadow-lg">
                    <Image
                      src="/logo.png"
                      alt="LifeLink"
                      width={64}
                      height={64}
                      priority
                      className="rounded-2xl object-contain"
                    />
                  </div>
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-500 sm:text-sm">
                  {t("login.secureAccess")}
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  {t("login.loginTitle")}
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600 sm:text-base">
                  {t("login.loginDesc")}
                </p>
              </div>

              <div className="mt-7 rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6">
                <Suspense
                  fallback={
                    <div className="flex min-h-40 items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-red-500" />
                    </div>
                  }
                >
                  <LoginForm />
                </Suspense>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                {t("login.newToLifelink")}{" "}
                <Link
                  href="/signup"
                  className="font-bold text-red-600 transition hover:text-red-700 hover:underline"
                >
                  {t("login.createAccount")}
                </Link>
              </p>

              <div className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-400">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  {t("login.protectedInfo")}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
