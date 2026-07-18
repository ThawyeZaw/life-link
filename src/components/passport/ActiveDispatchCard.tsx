"use client";

// src/components/donor/ActiveDispatchCard.tsx
// LifeLink — Active emergency dispatch card
// Team Vertex Red

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Droplets,
  MapPin,
  Navigation,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

import { UrgencyBadge } from "@/components/ui/UrgencyBadge";
import type { RequestWithDetails } from "@/utils/supabase";

interface ActiveDispatchCardProps {
  request: RequestWithDetails;
  distanceKm?: number;
  onRespond?: () => void;
  isResponding?: boolean;
  hasResponded?: boolean;
  className?: string;
}

const formatTimeAgo = (dateString: string) => {
  const createdAt = new Date(dateString).getTime();

  if (Number.isNaN(createdAt)) {
    return "Recently";
  }

  const differenceMinutes = Math.max(
    0,
    Math.floor((Date.now() - createdAt) / 60_000),
  );

  if (differenceMinutes < 1) {
    return "Just now";
  }

  if (differenceMinutes < 60) {
    return `${differenceMinutes}m ago`;
  }

  const differenceHours = Math.floor(differenceMinutes / 60);

  if (differenceHours < 24) {
    return `${differenceHours}h ago`;
  }

  const differenceDays = Math.floor(differenceHours / 24);

  return `${differenceDays}d ago`;
};

export function ActiveDispatchCard({
  request,
  distanceKm = 1.8,
  onRespond,
  isResponding = false,
  hasResponded = false,
  className,
}: ActiveDispatchCardProps) {
  const hospitalName = request.hospital?.name ?? "Nearby partner hospital";
  const bloodType = request.blood_type ?? "—";
  const unitsRequired = request.units_needed ?? 1;
  const requestCode =
    "id" in request && typeof request.id === "string"
      ? request.id.slice(0, 8).toUpperCase()
      : "ACTIVE";

  const isCritical = request.urgency === "CRITICAL";

  return (
    <article
      className={clsx(
        "group relative mx-4 overflow-hidden rounded-[1.75rem] border bg-white",
        "shadow-[0_24px_65px_rgba(15,23,42,0.12)] transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_30px_80px_rgba(15,23,42,0.16)]",
        isCritical ? "border-red-100" : "border-amber-100",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={clsx(
          "absolute inset-x-0 top-0 h-1.5",
          isCritical
            ? "bg-gradient-to-r from-red-700 via-red-500 to-rose-400"
            : "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-300",
        )}
      />

      <div
        aria-hidden="true"
        className={clsx(
          "absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl",
          isCritical ? "bg-red-100/80" : "bg-amber-100/80",
        )}
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl"
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyBadge urgency={request.urgency} />

            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-red-700">
              <Radio className="h-3 w-3" />
              Active dispatch
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400">
            <Clock3 className="h-3.5 w-3.5" />
            {formatTimeAgo(request.created_at)}
          </div>
        </div>

        <div className="mt-5 flex items-start gap-4">
          <div
            className={clsx(
              "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
              "shadow-[0_12px_30px_rgba(239,68,68,0.2)]",
              isCritical
                ? "bg-gradient-to-br from-red-600 to-rose-500 text-white"
                : "bg-gradient-to-br from-amber-500 to-orange-500 text-white",
            )}
          >
            <AlertTriangle className="h-6 w-6" strokeWidth={2.4} />

            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span
                className={clsx(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                  isCritical ? "bg-red-400" : "bg-amber-400",
                )}
              />
              <span
                className={clsx(
                  "relative inline-flex h-3 w-3 rounded-full border-2 border-white",
                  isCritical ? "bg-red-500" : "bg-amber-500",
                )}
              />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Emergency blood request
            </p>

            <h3 className="mt-1 truncate text-lg font-black tracking-tight text-[#0D1933] sm:text-xl">
              {hospitalName}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                {Math.max(distanceKm, 0).toFixed(1)} km away
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Verified hospital
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-red-100 bg-gradient-to-br from-red-50 via-white to-rose-50">
          <div className="flex items-center gap-4 p-4">
            <div className="relative shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D1933] text-base font-black text-white shadow-[0_12px_28px_rgba(13,25,51,0.2)]">
                {bloodType}
              </div>

              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white bg-red-500 text-white">
                <Droplets className="h-3 w-3 fill-current" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-[#0D1933]">
                    Patient match confirmed
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Your blood type is urgently required
                  </p>
                </div>

                <span className="rounded-full border border-red-100 bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-red-600 shadow-sm">
                  Direct match
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <DispatchMetric
                  label="Units needed"
                  value={`${unitsRequired}`}
                />

                <DispatchMetric label="Request code" value={requestCode} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-red-100/80 bg-white/60 px-4 py-3">
            <Navigation className="h-3.5 w-3.5 text-red-500" />

            <p className="text-[10px] font-bold text-slate-500">
              Respond now to receive hospital directions and preparation steps.
            </p>
          </div>
        </div>

        <button
          id="dispatch-respond-btn"
          type="button"
          onClick={onRespond}
          disabled={!onRespond || isResponding || hasResponded}
          className={clsx(
            "mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5",
            "text-sm font-black text-white shadow-[0_14px_35px_rgba(220,38,38,0.28)]",
            "transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
            hasResponded
              ? "cursor-default bg-emerald-600 shadow-[0_14px_35px_rgba(5,150,105,0.22)]"
              : isResponding
                ? "cursor-wait bg-red-500"
                : onRespond
                  ? "bg-gradient-to-r from-red-700 via-red-600 to-rose-500 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(220,38,38,0.34)] active:translate-y-0 active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-300 shadow-none",
          )}
        >
          {hasResponded ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Response acknowledged
            </>
          ) : isResponding ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Sending response...
            </>
          ) : (
            <>
              Acknowledge &amp; Respond
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>

          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Secure response through LifeLink
          </p>
        </div>
      </div>
    </article>
  );
}

interface DispatchMetricProps {
  label: string;
  value: string;
}

function DispatchMetric({ label, value }: DispatchMetricProps) {
  return (
    <div className="rounded-xl border border-white bg-white/80 px-3 py-2 shadow-sm">
      <p className="text-[8px] font-black uppercase tracking-[0.11em] text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-xs font-black text-[#0D1933]">
        {value}
      </p>
    </div>
  );
}
