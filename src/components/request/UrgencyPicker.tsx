"use client";

import type { ReactNode } from "react";
import { CalendarDays, Check, Clock3, Siren } from "lucide-react";

import { URGENCY_META } from "@/lib/blood";
import type { Urgency } from "@/lib/types";

const ICONS: Record<Urgency, ReactNode> = {
  CRITICAL: <Siren className="h-5 w-5" />,
  URGENT: <Clock3 className="h-5 w-5" />,
  STANDARD: <CalendarDays className="h-5 w-5" />,
};

const DESCRIPTIONS: Record<Urgency, string> = {
  CRITICAL: "Immediate response",
  URGENT: "Needed very soon",
  STANDARD: "Planned donation",
};

const ACTIVE_STYLES: Record<Urgency, string> = {
  CRITICAL:
    "border-red-600 bg-red-600 text-white shadow-[0_12px_28px_rgba(220,38,38,0.24)]",
  URGENT:
    "border-amber-500 bg-amber-500 text-white shadow-[0_12px_28px_rgba(245,158,11,0.22)]",
  STANDARD:
    "border-slate-900 bg-slate-900 text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)]",
};

const ICON_STYLES: Record<Urgency, string> = {
  CRITICAL: "bg-red-50 text-red-600",
  URGENT: "bg-amber-50 text-amber-600",
  STANDARD: "bg-slate-100 text-slate-600",
};

export const UrgencyPicker = ({
  value,
  onChange,
}: {
  value: Urgency;
  onChange: (urgency: Urgency) => void;
}) => {
  return (
    <div
      className="grid gap-2.5 sm:grid-cols-3"
      role="radiogroup"
      aria-label="Request urgency"
    >
      {(Object.keys(URGENCY_META) as Urgency[]).map((urgency) => {
        const selected = value === urgency;

        return (
          <button
            key={urgency}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(urgency)}
            className={`group relative flex min-h-[88px] items-center gap-3 overflow-hidden rounded-[20px] border p-3.5 text-left transition duration-200 active:scale-[0.98] ${
              selected
                ? ACTIVE_STYLES[urgency]
                : "border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
            }`}
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] transition ${
                selected ? "bg-white/15 text-white" : ICON_STYLES[urgency]
              }`}
            >
              {ICONS[urgency]}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={`block text-sm font-black tracking-[-0.01em] ${
                  selected ? "text-white" : "text-slate-900"
                }`}
              >
                {URGENCY_META[urgency].label}
              </span>

              <span
                className={`mt-1 block text-[11px] font-medium leading-4 ${
                  selected ? "text-white/75" : "text-slate-400"
                }`}
              >
                {DESCRIPTIONS[urgency]}
              </span>
            </span>

            <span
              className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border transition ${
                selected
                  ? "border-white/30 bg-white text-slate-900"
                  : "border-slate-200 bg-white text-transparent"
              }`}
            >
              <Check className="h-3 w-3" />
            </span>

            {selected && urgency === "CRITICAL" && (
              <span className="pointer-events-none absolute inset-0">
                <span className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-white/10" />
                <span className="absolute bottom-3 right-4 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
