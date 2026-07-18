"use client";

import { useState } from "react";
import {
  Activity,
  Building2,
  Droplets,
  FileText,
  ListChecks,
  MapPin,
  Radar as RadarIcon,
  ShieldCheck,
} from "lucide-react";

import { REQUEST_STATUS_META, URGENCY_META } from "@/lib/blood";
import { StatusPill } from "@/components/ui/StatusPill";
import { BloodTypeBadge } from "@/components/ui/BloodTypeBadge";
import { RadarSearch } from "./RadarSearch";
import { MatchTracker } from "./MatchTracker";
import type { BloodRequest, RequestStatus } from "@/lib/types";

export const RequestFlow = ({
  request,
  initialHasMatches,
}: {
  request: BloodRequest;
  initialHasMatches: boolean;
}) => {
  const [view, setView] = useState<"radar" | "tracker">(
    initialHasMatches ? "tracker" : "radar",
  );

  const [status, setStatus] = useState<RequestStatus>(request.status);

  const statusMeta = REQUEST_STATUS_META[status];
  const urgencyMeta = URGENCY_META[request.urgency];

  const active = !["COMPLETED", "CANCELLED", "EXPIRED"].includes(status);

  const unitLabel = `${request.units_needed} unit${
    request.units_needed > 1 ? "s" : ""
  }`;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-red-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative p-4 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="shrink-0">
                  <BloodTypeBadge type={request.blood_type} size="lg" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-red-700">
                      <span className="relative flex h-1.5 w-1.5">
                        {active && (
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                        )}
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                      </span>
                      {active ? "Active emergency" : "Request closed"}
                    </span>

                    <StatusPill
                      label={urgencyMeta.label}
                      className={urgencyMeta.className}
                    />
                  </div>

                  <h1 className="mt-3 text-xl font-black tracking-[-0.035em] text-slate-950 sm:text-2xl">
                    {unitLabel} of blood needed
                  </h1>

                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                    Locate compatible donors, send alerts, and coordinate
                    responses for this request.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <StatusPill
                  label={statusMeta.label}
                  className={statusMeta.className}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryItem
                icon={<Building2 className="h-4 w-4" />}
                label="Hospital"
                value={request.hospitals?.name ?? "Hospital"}
              />

              <SummaryItem
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={request.hospitals?.township ?? "Yangon"}
              />

              <SummaryItem
                icon={<Droplets className="h-4 w-4" />}
                label="Blood requirement"
                value={`${request.blood_type} · ${unitLabel}`}
              />

              <SummaryItem
                icon={<Activity className="h-4 w-4" />}
                label="Current status"
                value={statusMeta.label}
              />
            </div>

            {request.notes && (
              <div className="flex items-start gap-3 rounded-[22px] border border-slate-200 bg-slate-50/90 px-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                  <FileText className="h-4 w-4" />
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Request notes
                  </p>

                  <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                    {request.notes}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

              <p>
                Donor identities and contact details remain protected until they
                accept an emergency invitation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {active && (
        <section className="sticky top-3 z-30 rounded-[24px] border border-white/90 bg-white/90 p-1.5 shadow-[0_14px_38px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div
            className="grid grid-cols-2 gap-1.5"
            role="tablist"
            aria-label="Request workflow"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "radar"}
              onClick={() => setView("radar")}
              className={`group flex min-h-13 items-center justify-center gap-2 rounded-[18px] px-3 text-sm font-black transition duration-200 active:scale-[0.99] ${
                view === "radar"
                  ? "bg-red-600 text-white shadow-[0_10px_26px_rgba(220,38,38,0.25)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <RadarIcon
                className={`h-4 w-4 transition ${
                  view === "radar" ? "" : "group-hover:text-red-500"
                }`}
              />
              Donor radar
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={view === "tracker"}
              onClick={() => setView("tracker")}
              className={`group flex min-h-13 items-center justify-center gap-2 rounded-[18px] px-3 text-sm font-black transition duration-200 active:scale-[0.99] ${
                view === "tracker"
                  ? "bg-slate-950 text-white shadow-[0_10px_26px_rgba(15,23,42,0.22)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <ListChecks
                className={`h-4 w-4 transition ${
                  view === "tracker" ? "" : "group-hover:text-red-500"
                }`}
              />
              Responses
            </button>
          </div>
        </section>
      )}

      <div className="min-w-0">
        {view === "radar" && active ? (
          <RadarSearch
            requestId={request.id}
            onInvited={() => setView("tracker")}
          />
        ) : (
          <MatchTracker
            requestId={request.id}
            onStatusChange={(nextStatus) =>
              setStatus(nextStatus as RequestStatus)
            }
          />
        )}
      </div>
    </div>
  );
};

const SummaryItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50/80 px-3.5 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-bold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
};
