"use client";

// src/components/broadcast/UrgencySelector.tsx
// LifeLink — Emergency urgency selector
// Team Vertex Red

import {
  Activity,
  AlertTriangle,
  Check,
  Clock3,
  Radio,
  ShieldAlert,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";

import type { Urgency } from "@/utils/supabase";

interface UrgencySelectorProps {
  value: Urgency;
  onChange: (urgency: Urgency) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

interface UrgencyOption {
  value: Urgency;
  label: string;
  shortLabel: string;
  description: string;
  responseTime: string;
  reach: string;
  icon: LucideIcon;
  detailIcon: LucideIcon;
  selectedCard: string;
  selectedIcon: string;
  selectedBadge: string;
  idleCard: string;
  idleIcon: string;
  idleBadge: string;
  radioRing: string;
}

const OPTIONS: UrgencyOption[] = [
  {
    value: "CRITICAL",
    label: "Critical",
    shortLabel: "Immediate",
    description:
      "Life-threatening emergency requiring the fastest donor response and widest alert coverage.",
    responseTime: "Under 15 min",
    reach: "Maximum radius",
    icon: AlertTriangle,
    detailIcon: Zap,
    selectedCard:
      "border-red-500 bg-gradient-to-br from-red-500 via-red-500 to-rose-600 text-white shadow-[0_16px_38px_rgba(239,68,68,0.22)]",
    selectedIcon: "bg-white/15 text-white",
    selectedBadge: "bg-white/15 text-red-50",
    idleCard:
      "border-slate-200 bg-white text-[#0D1933] hover:border-red-200 hover:bg-red-50/40",
    idleIcon: "bg-red-50 text-red-500",
    idleBadge: "bg-red-50 text-red-600",
    radioRing: "focus-visible:ring-red-100",
  },
  {
    value: "URGENT",
    label: "Urgent",
    shortLabel: "High priority",
    description:
      "A serious shortage or time-sensitive requirement needing a rapid donor response.",
    responseTime: "Under 30 min",
    reach: "Expanded radius",
    icon: Clock3,
    detailIcon: ShieldAlert,
    selectedCard:
      "border-amber-500 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-[0_16px_38px_rgba(245,158,11,0.22)]",
    selectedIcon: "bg-white/15 text-white",
    selectedBadge: "bg-white/15 text-amber-50",
    idleCard:
      "border-slate-200 bg-white text-[#0D1933] hover:border-amber-200 hover:bg-amber-50/40",
    idleIcon: "bg-amber-50 text-amber-600",
    idleBadge: "bg-amber-50 text-amber-700",
    radioRing: "focus-visible:ring-amber-100",
  },
  {
    value: "STANDARD",
    label: "Routine",
    shortLabel: "Planned",
    description:
      "A scheduled blood requirement or standard restock without immediate clinical danger.",
    responseTime: "Within 2 hours",
    reach: "Standard radius",
    icon: Activity,
    detailIcon: Radio,
    selectedCard:
      "border-blue-500 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-[0_16px_38px_rgba(59,130,246,0.2)]",
    selectedIcon: "bg-white/15 text-white",
    selectedBadge: "bg-white/15 text-blue-50",
    idleCard:
      "border-slate-200 bg-white text-[#0D1933] hover:border-blue-200 hover:bg-blue-50/40",
    idleIcon: "bg-blue-50 text-blue-600",
    idleBadge: "bg-blue-50 text-blue-700",
    radioRing: "focus-visible:ring-blue-100",
  },
];

export function UrgencySelector({
  value,
  onChange,
  disabled = false,
  error,
  className,
}: UrgencySelectorProps) {
  const selectedOption =
    OPTIONS.find((option) => option.value === value) ?? OPTIONS[1];

  return (
    <div className={className}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-[#0D1933]">
            Emergency priority
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Choose the response speed and donor alert reach.
          </p>
        </div>

        <span
          className={clsx(
            "shrink-0 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em]",
            value === "CRITICAL" && "bg-red-50 text-red-600",
            value === "URGENT" && "bg-amber-50 text-amber-700",
            value === "STANDARD" && "bg-blue-50 text-blue-700",
          )}
        >
          {selectedOption.shortLabel}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Select emergency urgency"
        aria-describedby={error ? "urgency-selector-error" : undefined}
        className="grid gap-3"
      >
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;
          const DetailIcon = option.detailIcon;

          return (
            <button
              key={option.value}
              id={`urgency-${option.value.toLowerCase()}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={clsx(
                "group relative w-full overflow-hidden rounded-[1.35rem] border-2 text-left",
                "transition duration-200",
                "focus-visible:outline-none focus-visible:ring-4",
                option.radioRing,
                isSelected
                  ? clsx(option.selectedCard, "p-4 sm:p-5")
                  : clsx(option.idleCard, "px-4 py-3.5"),
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {isSelected && (
                <>
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/15 blur-3xl"
                  />

                  <DetailIcon
                    aria-hidden="true"
                    className="absolute -bottom-5 right-3 h-24 w-24 text-white/[0.08]"
                    strokeWidth={1.3}
                  />
                </>
              )}

              <div className="relative flex items-start gap-3">
                <span
                  className={clsx(
                    "flex shrink-0 items-center justify-center rounded-2xl transition",
                    isSelected
                      ? clsx("h-11 w-11", option.selectedIcon)
                      : clsx("h-10 w-10", option.idleIcon),
                  )}
                >
                  <Icon
                    className={isSelected ? "h-5 w-5" : "h-4 w-4"}
                    strokeWidth={2.5}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={clsx(
                            "font-black tracking-tight",
                            isSelected ? "text-base" : "text-sm",
                          )}
                        >
                          {option.label}
                        </span>

                        <span
                          className={clsx(
                            "rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em]",
                            isSelected
                              ? option.selectedBadge
                              : option.idleBadge,
                          )}
                        >
                          {option.shortLabel}
                        </span>
                      </span>

                      {!isSelected && (
                        <span className="mt-1 block truncate text-[10px] font-medium text-slate-500">
                          {option.responseTime} · {option.reach}
                        </span>
                      )}
                    </span>

                    <span
                      className={clsx(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition",
                        isSelected
                          ? "border-white/30 bg-white text-slate-900"
                          : "border-slate-200 bg-white text-transparent",
                      )}
                    >
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  </span>

                  {isSelected && (
                    <span className="mt-3 block">
                      <span className="block max-w-xl text-xs leading-5 text-white/80">
                        {option.description}
                      </span>

                      <span className="mt-4 flex flex-wrap gap-2">
                        <UrgencyDetail
                          icon={Clock3}
                          label={option.responseTime}
                        />

                        <UrgencyDetail icon={Radio} label={option.reach} />
                      </span>
                    </span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {error ? (
        <p
          id="urgency-selector-error"
          className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
        >
          {error}
        </p>
      ) : (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span
            className={clsx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              value === "CRITICAL" && "bg-red-500 text-white",
              value === "URGENT" && "bg-amber-500 text-white",
              value === "STANDARD" && "bg-blue-500 text-white",
            )}
          >
            <selectedOption.icon className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p className="text-xs font-black text-[#0D1933]">
              {selectedOption.label} response selected
            </p>

            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500">
              Expected response {selectedOption.responseTime.toLowerCase()} with{" "}
              {selectedOption.reach.toLowerCase()}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function UrgencyDetail({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold text-white">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
