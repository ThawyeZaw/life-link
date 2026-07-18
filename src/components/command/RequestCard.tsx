"use client";

// src/components/command/RequestCard.tsx
// LifeLink — Command center request card
// Team Vertex Red

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  MapPin,
  Navigation,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import { clsx } from "clsx";

import { UrgencyBadge } from "@/components/ui/UrgencyBadge";
import { BloodTypeBadge } from "@/components/ui/BloodTypeBadge";
import type { RequestWithDetails } from "@/utils/supabase";

interface RequestCardProps {
  request: RequestWithDetails;
  distanceKm?: number;
  onManage?: (id: string) => void;
}

type RequestStatus = "OPEN" | "IN_PROGRESS" | "FULFILLED" | "EXPIRED";

const STATUS_META: Record<
  RequestStatus,
  {
    label: string;
    description: string;
    icon: typeof Radio;
    badge: string;
    dot: string;
    panel: string;
  }
> = {
  OPEN: {
    label: "Awaiting donors",
    description: "Matching compatible donors nearby",
    icon: Radio,
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    panel: "border-blue-100 bg-blue-50/60",
  },
  IN_PROGRESS: {
    label: "Response active",
    description: "At least one donor is responding",
    icon: Navigation,
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    panel: "border-amber-100 bg-amber-50/60",
  },
  FULFILLED: {
    label: "Request fulfilled",
    description: "Required blood units secured",
    icon: CheckCircle2,
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    panel: "border-emerald-100 bg-emerald-50/60",
  },
  EXPIRED: {
    label: "Request expired",
    description: "This request is no longer active",
    icon: Clock3,
    badge: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
    panel: "border-slate-200 bg-slate-50",
  },
};

function timeAgo(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  const differenceMinutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60_000),
  );

  if (differenceMinutes < 1) return "Just now";
  if (differenceMinutes < 60) return `${differenceMinutes}m ago`;

  const differenceHours = Math.floor(differenceMinutes / 60);

  if (differenceHours < 24) return `${differenceHours}h ago`;

  return `${Math.floor(differenceHours / 24)}d ago`;
}

function getRequestCode(id: string) {
  return `REQ-${id.slice(0, 6).toUpperCase()}`;
}

export function RequestCard({
  request,
  distanceKm = 2.4,
  onManage,
}: RequestCardProps) {
  const hospitalName = request.hospital?.name ?? "Unknown hospital";
  const township = request.hospital?.township ?? "Township unavailable";

  const statusKey = (
    request.status in STATUS_META ? request.status : "OPEN"
  ) as RequestStatus;

  const status = STATUS_META[statusKey];
  const StatusIcon = status.icon;
  const requestCode = getRequestCode(request.id);

  const unitsNeeded =
    typeof request.units_needed === "number" ? request.units_needed : 1;

  const responseCount =
    "responses_count" in request && typeof request.responses_count === "number"
      ? request.responses_count
      : statusKey === "IN_PROGRESS"
        ? 1
        : 0;

  return (
    <article
      className={clsx(
        "group relative overflow-hidden rounded-[1.65rem] border bg-white transition-all duration-300",
        "shadow-[0_14px_45px_rgba(15,23,42,0.06)]",
        "hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)]",
        request.urgency === "CRITICAL"
          ? "border-red-100"
          : request.urgency === "URGENT"
            ? "border-amber-100"
            : "border-slate-100",
      )}
    >
      <div
        aria-hidden="true"
        className={clsx(
          "absolute inset-x-0 top-0 h-1",
          request.urgency === "CRITICAL"
            ? "bg-gradient-to-r from-red-500 via-rose-500 to-red-400"
            : request.urgency === "URGENT"
              ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"
              : "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400",
        )}
      />

      <div
        aria-hidden="true"
        className={clsx(
          "absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-60 blur-3xl transition-transform duration-500 group-hover:scale-125",
          request.urgency === "CRITICAL"
            ? "bg-red-100"
            : request.urgency === "URGENT"
              ? "bg-amber-100"
              : "bg-blue-100",
        )}
      />

      <div className="relative p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <UrgencyBadge urgency={request.urgency} />

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Clock3 className="h-3.5 w-3.5" />
            {timeAgo(request.created_at)}
          </div>
        </div>

        <div className="mt-5 flex items-start gap-4">
          <div className="relative shrink-0">
            <BloodTypeBadge bloodType={request.blood_type ?? "?"} size="md" />

            {statusKey === "OPEN" && (
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-50" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-black tracking-tight text-[#0D1933]">
                  {hospitalName}
                </h3>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {township}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <Navigation className="h-3.5 w-3.5 text-slate-400" />
                    {distanceKm.toFixed(1)} km
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onManage?.(request.id)}
                aria-label={`Manage ${requestCode}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 transition group-hover:border-slate-200 group-hover:bg-white group-hover:text-[#0D1933]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                {requestCode}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                <Droplets className="h-3.5 w-3.5" />
                {unitsNeeded} {unitsNeeded === 1 ? "unit" : "units"}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>
          </div>
        </div>

        <div
          className={clsx(
            "mt-5 flex items-start gap-3 rounded-2xl border p-3.5",
            status.panel,
          )}
        >
          <div
            className={clsx(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              status.badge,
            )}
          >
            <StatusIcon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black text-[#0D1933]">
                {status.label}
              </p>

              <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                <span
                  className={clsx(
                    "h-2 w-2 rounded-full",
                    status.dot,
                    statusKey === "OPEN" && "animate-pulse",
                  )}
                />
                Live status
              </span>
            </div>

            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              {status.description}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <RequestMetric
            icon={Droplets}
            value={`${unitsNeeded}`}
            label="Units"
          />

          <RequestMetric
            icon={Users}
            value={`${responseCount}`}
            label="Responses"
          />

          <RequestMetric
            icon={Activity}
            value={
              request.urgency === "CRITICAL"
                ? "<15m"
                : request.urgency === "URGENT"
                  ? "<30m"
                  : "<2h"
            }
            label="Target"
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Blood request
            </p>

            <p className="mt-1 truncate text-xs font-bold text-slate-600">
              {request.blood_type ?? "Unknown"} blood required
            </p>
          </div>

          <button
            id={`manage-${request.id}`}
            type="button"
            onClick={() => onManage?.(request.id)}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0D1933] px-4 text-xs font-black text-white shadow-[0_10px_25px_rgba(13,25,51,0.16)] transition hover:-translate-y-0.5 hover:bg-[#192A4F] active:scale-[0.98]"
          >
            Manage
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function RequestMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Droplets;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        <p className="truncate text-xs font-black text-[#0D1933]">{value}</p>
      </div>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
