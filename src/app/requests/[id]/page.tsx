"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { useT } from "@/i18n";
import { createClient } from "@/lib/supabase/client";
import { RequestFlow } from "@/components/radar/RequestFlow";
import type { BloodRequest } from "@/lib/types";

const RequestPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { t } = useT();
  const { id } = use(params);

  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [hasMatches, setHasMatches] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: req } = await supabase
        .from("requests")
        .select(
          "*, hospitals(id, name, name_mya, township, address, phone, lat, lng)",
        )
        .eq("id", id)
        .single();

      if (!req) {
        setLoading(false);
        return;
      }

      setRequest(req as BloodRequest);

      const { data: matches } = await supabase.rpc("get_request_matches", {
        p_request_id: id,
      });

      setHasMatches((matches?.length ?? 0) > 0);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff7f7_0%,#ffffff_48%,#f8fafc_100%)]">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />
          <span className="text-sm font-semibold">{t("request.detail.searching")}...</span>
        </div>
      </main>
    );
  }

  if (!request) notFound();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff7f7_0%,#ffffff_48%,#f8fafc_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-[360px] w-[360px] rounded-full bg-red-200/40 blur-[110px]" />
        <div className="absolute -right-28 bottom-10 h-[360px] w-[360px] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("request.detail.back")}
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-sm font-semibold text-emerald-700 sm:flex">
            <ShieldCheck className="h-4 w-4" />
            {t("request.detail.privacyProtected")}
          </div>
        </div>

        <section className="mx-auto mt-6 max-w-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-white shadow-[0_16px_40px_rgba(239,68,68,0.28)]">
              <Image
                src="/logo.png"
                alt="LifeLink"
                width={44}
                height={44}
                priority
                className="h-full rounded-2xl w-full object-cover"
              />
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/80 px-4 py-2 text-sm font-bold text-red-600 shadow-sm backdrop-blur-xl">
              <Activity className="h-4 w-4" />
              {t("request.detail.liveEmergency")}
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {t("request.detail.headline")}
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              {t("request.detail.description")}
            </p>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <LockKeyhole className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    {t("request.detail.consentFirst")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {t("request.detail.consentDesc")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <Activity className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-950">
                    {hasMatches
                      ? t("request.detail.matchingActive")
                      : t("request.detail.searching")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {hasMatches
                      ? t("request.detail.matchingActiveDesc")
                      : t("request.detail.searchingDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white/90 p-3 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-4">
            <div className="rounded-[24px] bg-white">
              <RequestFlow
                request={request as BloodRequest}
                initialHasMatches={hasMatches}
              />
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-slate-400">
            {t("request.detail.privacyFooter")}
          </p>
        </section>
      </div>
    </main>
  );
};

export default RequestPage;
