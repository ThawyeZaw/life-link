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
} from "lucide-react";
import { clsx } from "clsx";

import type { Urgency } from "@/utils/supabase";

interface UrgencySelectorProps {
  value: Urgency;
  onChange: (urgency: Urgency) => void;
}

const OPTIONS = [
  {
    value: "CRITICAL" as Urgency,
    label: "Critical",
    shortLabel: "Immediate",
    description:
      "Life-threatening emergency requiring the widest donor reach and fastest response.",
    responseTime: "Under 15 minutes",
    reach: "Maximum radius",
    icon: AlertTriangle,
    secondaryIcon: Zap,
    selectedCard:
      "border-red-500 bg-gradient-to-br from-red-500 via-red-500 to-rose-600 text-white shadow-[0_18px_45px_rgba(239,68,68,0.24)]",
    idleCard:
      "border-red-100 bg-red-50/60 text-red-950 hover:border-red-300 hover:bg-red-50",
    idleIcon: "bg-red-100 text-red-600",
    selectedBadge: "bg-white/15 text-red-50",
    idleBadge: "bg-white text-red-600",
  },
  {
    value: "URGENT" as Urgency,
    label: "Urgent",
    shortLabel: "High priority",
    description:
      "A serious shortage or time-sensitive requirement needing a rapid donor response.",
    responseTime: "Under 30 minutes",
    reach: "Expanded radius",
    icon: Clock3,
    secondaryIcon: ShieldAlert,
    selectedCard:
      "border-amber-500 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-[0_18px_45px_rgba(245,158,11,0.24)]",
    idleCard:
      "border-amber-100 bg-amber-50/60 text-amber-950 hover:border-amber-300 hover:bg-amber-50",
    idleIcon: "bg-amber-100 text-amber-600",
    selectedBadge: "bg-white/15 text-amber-50",
    idleBadge: "bg-white text-amber-700",
  },
  {
    value: "STANDARD" as Urgency,
    label: "Routine",
    shortLabel: "Planned",
    description:
      "A standard restock or scheduled requirement without immediate clinical danger.",
    responseTime: "Within 2 hours",
    reach: "Standard radius",
    icon: Activity,
    secondaryIcon: Radio,
    selectedCard:
      "border-blue-500 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-[0_18px_45px_rgba(59,130,246,0.22)]",
    idleCard:
      "border-blue-100 bg-blue-50/60 text-blue-950 hover:border-blue-300 hover:bg-blue-50",
    idleIcon: "bg-blue-100 text-blue-600",
    selectedBadge: "bg-white/15 text-blue-50",
    idleBadge: "bg-white text-blue-700",
  },
] as const;

export function UrgencySelector({ value, onChange }: UrgencySelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Select emergency urgency"
      className="grid gap-3"
    >
      {OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;
        const SecondaryIcon = option.secondaryIcon;

        return (
          <button
            key={option.value}
            id={`urgency-${option.value.toLowerCase()}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={clsx(
              "group relative w-full overflow-hidden rounded-[1.5rem] border-2 p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 sm:p-5",
              isSelected ? option.selectedCard : option.idleCard,
            )}
          >
            <div
              aria-hidden="true"
              className={clsx(
                "absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-opacity",
                isSelected ? "bg-white/20" : "bg-white/70",
              )}
            />

            <div
              aria-hidden="true"
              className={clsx(
                "absolute bottom-0 right-4 transition-all duration-300",
                isSelected
                  ? "translate-y-3 text-white/10"
                  : "translate-y-4 text-slate-900/[0.03]",
              )}
            >
              <SecondaryIcon className="h-24 w-24" strokeWidth={1.4} />
            </div>

            <div className="relative flex items-start gap-4">
              <div
                className={clsx(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all",
                  isSelected ? "bg-white/15 text-white" : option.idleIcon,
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black tracking-tight">
                        {option.label}
                      </h3>

                      <span
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]",
                          isSelected ? option.selectedBadge : option.idleBadge,
                        )}
                      >
                        {option.shortLabel}
                      </span>
                    </div>

                    <p
                      className={clsx(
                        "mt-2 max-w-xl text-xs leading-5",
                        isSelected ? "text-white/80" : "text-slate-500",
                      )}
                    >
                      {option.description}
                    </p>
                  </div>

                  <span
                    className={clsx(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all",
                      isSelected
                        ? "border-white/30 bg-white text-slate-900"
                        : "border-slate-200 bg-white text-transparent",
                    )}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold",
                      isSelected
                        ? "bg-white/15 text-white"
                        : "bg-white text-slate-600 shadow-sm",
                    )}
                  >
                    <Clock3 className="h-3.5 w-3.5" />
                    {option.responseTime}
                  </span>

                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold",
                      isSelected
                        ? "bg-white/15 text-white"
                        : "bg-white text-slate-600 shadow-sm",
                    )}
                  >
                    <Radio className="h-3.5 w-3.5" />
                    {option.reach}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
