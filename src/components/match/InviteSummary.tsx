"use client";

import {
  Building2,
  Droplets,
  MapPin,
  Navigation,
  Phone,
  Radio,
} from "lucide-react";

import { useT } from "@/i18n";
import { StatusPill } from "@/components/ui/StatusPill";
import { URGENCY_META } from "@/lib/blood";
import type { Urgency } from "@/lib/types";

export interface InviteRequest {
  blood_type: string;
  units_needed: number;
  urgency: Urgency;
  status: string;
  patient_name: string | null;
  hospitals: {
    name: string;
    name_mya: string | null;
    township: string | null;
    address: string | null;
    phone: string | null;
  };
}

export const InviteSummary = ({
  request,
  distanceKm,
}: {
  request: InviteRequest;
  distanceKm: number | null;
}) => {
  const { t } = useT();
  const urgency = URGENCY_META[request.urgency];

  const hospitalLocation =
    request.hospitals.address ?? request.hospitals.township ?? "Yangon";

  const patientSuffix = request.patient_name
    ? ` for ${request.patient_name}`
    : "";

  return (
    <section className="relative min-w-0 overflow-hidden rounded-[28px] border border-red-200 bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_55%,#f8fafc_100%)] p-4 shadow-[0_20px_60px_rgba(239,68,68,0.10)] sm:p-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-red-200/60 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute right-5 top-5 h-24 w-24 rounded-full border border-red-200/60" />
        <div className="absolute right-9 top-9 h-16 w-16 rounded-full border border-red-300/60" />
        <div className="absolute right-[3.65rem] top-[3.6rem] h-3 w-3 rounded-full bg-red-500 shadow-[0_0_22px_rgba(239,68,68,0.65)]">
          <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-70" />
        </div>
      </div>

      <div className="relative">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-16 min-w-16 shrink-0 items-center justify-center rounded-[22px] bg-red-600 px-3 text-xl font-black text-white shadow-[0_14px_32px_rgba(220,38,38,0.28)]">
              {request.blood_type}

              <span className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-red-500" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-red-700">
                  <Radio className="h-3 w-3" />
                  {t("match.liveInvitation")}
                </span>

                <StatusPill
                  label={urgency.label}
                  className={urgency.className}
                />
              </div>

              <h2 className="mt-2 text-lg font-black tracking-[-0.025em] text-slate-950 sm:text-xl">
                {t("match.bloodDonationNeeded")}
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {t("match.reviewDetails")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white bg-white/80 p-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-slate-400">
              <Droplets className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.12em]">
                {t("match.bloodType")}
              </span>
            </div>

            <p className="mt-1.5 text-base font-black text-slate-950">
              {request.blood_type}
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 p-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-slate-400">
              <Droplets className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.12em]">
                {t("match.unitsNeeded")}
              </span>
            </div>

            <p className="mt-1.5 text-base font-black text-slate-950">
              {request.units_needed} unit
              {request.units_needed > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="mt-3 flex min-w-0 items-start gap-2 rounded-2xl border border-red-200 bg-red-50/80 px-3 py-3 text-sm font-bold leading-5 text-red-800">
          <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

          <span className="min-w-0">
            {t("match.bloodNeededFor", {
              units: request.units_needed,
              bloodType: request.blood_type,
              patient: patientSuffix,
            })}
          </span>
        </div>

        <article className="mt-4 min-w-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.07)]">
          <div className="relative overflow-hidden border-b border-slate-100 bg-slate-50/80 p-4">
            <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-red-100/70 blur-3xl" />

            <div className="relative flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                <Building2 className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  {t("match.donationLocation")}
                </p>

                <h3 className="mt-1 break-words text-base font-black text-slate-950">
                  {request.hospitals.name}
                </h3>

                {request.hospitals.name_mya && (
                  <p className="mt-1 break-words text-sm font-medium text-slate-600">
                    {request.hospitals.name_mya}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                <MapPin className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  {t("match.address")}
                </p>

                <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-700">
                  {hospitalLocation}
                </p>

                {distanceKm != null && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-red-600">
                    <Navigation className="h-3.5 w-3.5 shrink-0" />
                    {t("match.approxDistance", { distance: distanceKm })}
                  </p>
                )}
              </div>
            </div>

            {request.hospitals.phone && (
              <a
                href={`tel:${request.hospitals.phone}`}
                className="group flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-3 text-sm font-black text-red-700 transition hover:border-red-300 hover:bg-red-100 active:scale-[0.99]"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                    <Phone className="h-4 w-4" />
                  </span>

                  <span className="truncate">{request.hospitals.phone}</span>
                </span>

                <span className="shrink-0 text-xs font-black uppercase tracking-[0.1em]">
                  {t("match.call")}
                </span>
              </a>
            )}
          </div>
        </article>
      </div>
    </section>
  );
};
