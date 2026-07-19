"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { useT } from "@/i18n";
import { NewRequestForm } from "@/components/request/NewRequestForm";

const NewRequestPage = () => {
  const { t } = useT();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Compact mobile-friendly header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white">
              <HeartPulse className="h-5 w-5" />
            </span>

            <span className="hidden text-sm font-black sm:inline">
              Life<span className="text-red-500">Link</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            {t("common.secure")}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Mobile heading: short and action-focused */}
        <section className="mb-5 lg:hidden flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {t("request.new.badge")}
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950">
            {t("request.new.title")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("request.new.subtitle")}
          </p>
        </section>

        <div className="mx-auto max-w-2xl">
          {/* Form comes first in the DOM and on mobile */}
          <section className="order-1">
            <div className="hidden lg:block text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-bold text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {t("request.new.badge")}
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] text-slate-950">
                {t("request.new.title")}
              </h1>

              <p className="mt-3 max-w-xl mx-auto text-base leading-7 text-slate-600">
                {t("request.new.desktopDesc")}
              </p>
            </div>

            <div className="mt-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.07)] sm:p-6 lg:mt-7 lg:p-7">
              <NewRequestForm />
            </div>

            {/* Compact mobile reassurance after form */}
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 lg:hidden">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <p className="text-xs leading-5 text-emerald-800">
                {t("request.new.privacyNote")}
              </p>
            </div>

            {/* Optional information, collapsed on mobile */}
            <details className="mt-4 rounded-2xl border border-slate-200 bg-white lg:hidden">
              <summary className="cursor-pointer px-4 py-4 text-sm font-bold text-slate-800">
                {t("request.new.whatHappensTitle")}
              </summary>

              <div className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-600">
                {t("request.new.whatHappensDesc")}
              </div>
            </details>
          </section>
        </div>
      </div>
    </main>
  );
};

export default NewRequestPage;
