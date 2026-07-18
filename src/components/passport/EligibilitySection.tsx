"use client";

// src/components/donor/EligibilitySection.tsx
// LifeLink — Donation eligibility overview
// Team Vertex Red

import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Droplets,
  Info,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

interface EligibilityItem {
  type: string;
  status: string;
  eligible: boolean;
  availableInDays?: number;
}

interface EligibilitySectionProps {
  items?: EligibilityItem[];
  onLearnMore?: () => void;
  className?: string;
}

const DEFAULT_ELIGIBILITY_ITEMS: EligibilityItem[] = [
  {
    type: "Whole Blood",
    status: "Eligible today",
    eligible: true,
  },
  {
    type: "Power Red",
    status: "Eligible today",
    eligible: true,
  },
  {
    type: "Platelets",
    status: "Available in 4 days",
    eligible: false,
    availableInDays: 4,
  },
];

export function EligibilitySection({
  items = DEFAULT_ELIGIBILITY_ITEMS,
  onLearnMore,
  className,
}: EligibilitySectionProps) {
  const eligibleCount = items.filter((item) => item.eligible).length;
  const isReady = eligibleCount > 0;

  return (
    <section
      className={clsx(
        "relative mx-4 overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white",
        "shadow-[0_20px_55px_rgba(15,23,42,0.08)]",
        className,
      )}
      aria-label="Donation eligibility"
    >
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-100/70 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-20 h-44 w-44 rounded-full bg-blue-100/50 blur-3xl"
      />

      <div className="relative flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0D1933] text-emerald-300 shadow-[0_10px_26px_rgba(13,25,51,0.18)]">
            <Activity className="h-5 w-5" strokeWidth={2.4} />
          </span>

          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-600">
              Donor health status
            </p>

            <h2 className="mt-0.5 text-base font-black tracking-tight text-[#0D1933]">
              Eligibility
            </h2>

            <p className="mt-1 text-[10px] font-medium text-slate-500">
              Your current donation availability
            </p>
          </div>
        </div>

        <span
          className={clsx(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5",
            "text-[9px] font-black uppercase tracking-[0.1em]",
            isReady
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700",
          )}
        >
          {isReady ? (
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.6} />
          ) : (
            <Clock3 className="h-3.5 w-3.5" strokeWidth={2.6} />
          )}

          {isReady ? "Ready" : "Waiting"}
        </span>
      </div>

      <div className="relative px-5">
        {items.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <EligibilityRow key={item.type} item={item} />
            ))}
          </div>
        ) : (
          <EmptyEligibility />
        )}
      </div>

      <div className="relative border-t border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />

            <p className="text-[9px] font-bold leading-4 text-slate-500">
              Eligibility is based on your most recent donation information.
            </p>
          </div>

          {onLearnMore && (
            <button
              type="button"
              onClick={onLearnMore}
              className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-[#0D1933] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Info className="h-3.5 w-3.5 text-emerald-600" />
              Details
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

interface EligibilityRowProps {
  item: EligibilityItem;
}

function EligibilityRow({ item }: EligibilityRowProps) {
  return (
    <article className="group flex items-center gap-3 py-4">
      <span
        className={clsx(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
          "transition-transform duration-300 group-hover:scale-105",
          item.eligible
            ? "bg-emerald-50 text-emerald-600"
            : "bg-amber-50 text-amber-600",
        )}
      >
        {item.eligible ? (
          <Droplets className="h-5 w-5" strokeWidth={2.4} />
        ) : (
          <CalendarClock className="h-5 w-5" strokeWidth={2.4} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-[#0D1933]">
              {item.type}
            </h3>

            <p
              className={clsx(
                "mt-1 text-[10px] font-semibold",
                item.eligible ? "text-emerald-600" : "text-slate-500",
              )}
            >
              {item.status}
            </p>
          </div>

          <span
            className={clsx(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1",
              "text-[8px] font-black uppercase tracking-[0.09em]",
              item.eligible
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500",
            )}
          >
            {item.eligible ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock3 className="h-3 w-3" />
            )}

            {item.eligible ? "Available" : "Cooldown"}
          </span>
        </div>

        {!item.eligible && item.availableInDays !== undefined && (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                Recovery period
              </span>

              <span className="text-[9px] font-black text-amber-600">
                {item.availableInDays} day
                {item.availableInDays === 1 ? "" : "s"} remaining
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{
                  width: `${Math.max(
                    12,
                    Math.min(100, 100 - item.availableInDays * 10),
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function EmptyEligibility() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Activity className="h-6 w-6" />
      </span>

      <h3 className="mt-4 text-sm font-black text-[#0D1933]">
        No eligibility data
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
        Complete your donor health profile to see which donation types are
        currently available.
      </p>
    </div>
  );
}
