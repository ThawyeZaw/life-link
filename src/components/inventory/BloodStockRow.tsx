"use client";

// src/components/command/BloodStockRow.tsx
// LifeLink — Blood inventory status row
// Team Vertex Red

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  Minus,
  PackageCheck,
} from "lucide-react";
import { clsx } from "clsx";

import type { BloodStock, StockLevel } from "@/components/data/mockData";

interface BloodStockRowProps {
  stock: BloodStock;
  maxUnits?: number;
  onClick?: (bloodType: string) => void;
}

const LEVEL_CONFIG: Record<
  StockLevel,
  {
    label: string;
    description: string;
    badge: string;
    iconWrapper: string;
    bar: string;
    glow: string;
    icon: typeof AlertTriangle;
  }
> = {
  CRITICAL: {
    label: "Critical",
    description: "Immediate restock required",
    badge: "border-red-200 bg-red-50 text-red-700",
    iconWrapper: "bg-red-100 text-red-600",
    bar: "bg-gradient-to-r from-red-600 to-rose-400",
    glow: "shadow-[0_6px_18px_rgba(239,68,68,0.3)]",
    icon: AlertTriangle,
  },
  LOW: {
    label: "Low stock",
    description: "Inventory below safe level",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    iconWrapper: "bg-amber-100 text-amber-600",
    bar: "bg-gradient-to-r from-amber-500 to-orange-400",
    glow: "shadow-[0_6px_18px_rgba(245,158,11,0.28)]",
    icon: Clock3,
  },
  ADEQUATE: {
    label: "Adequate",
    description: "Inventory within safe range",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconWrapper: "bg-emerald-100 text-emerald-600",
    bar: "bg-gradient-to-r from-emerald-500 to-teal-400",
    glow: "shadow-[0_6px_18px_rgba(16,185,129,0.25)]",
    icon: CheckCircle2,
  },
};

const TREND_CONFIG = {
  up: {
    label: "Rising",
    icon: ArrowUpRight,
    text: "text-emerald-600",
    background: "bg-emerald-50",
  },
  down: {
    label: "Falling",
    icon: ArrowDownRight,
    text: "text-red-600",
    background: "bg-red-50",
  },
  stable: {
    label: "Stable",
    icon: Minus,
    text: "text-slate-500",
    background: "bg-slate-100",
  },
} as const;

export function BloodStockRow({
  stock,
  maxUnits = 40,
  onClick,
}: BloodStockRowProps) {
  const level = LEVEL_CONFIG[stock.level];
  const trend = TREND_CONFIG[stock.trend];
  const LevelIcon = level.icon;
  const TrendIcon = trend.icon;

  const safeMaxUnits = Math.max(maxUnits, 1);
  const percentage = Math.min(
    Math.max((stock.units / safeMaxUnits) * 100, 0),
    100,
  );

  const isInteractive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={() => onClick?.(stock.bloodType)}
      disabled={!isInteractive}
      className={clsx(
        "group relative w-full overflow-hidden rounded-[1.4rem] border border-slate-100 bg-white p-4 text-left transition-all duration-300 sm:p-5",
        isInteractive
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
          : "cursor-default",
      )}
    >
      <div
        aria-hidden="true"
        className={clsx(
          "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-60 blur-3xl",
          stock.level === "CRITICAL" && "bg-red-100",
          stock.level === "LOW" && "bg-amber-100",
          stock.level === "ADEQUATE" && "bg-emerald-100",
        )}
      />

      <div className="relative flex items-center gap-4">
        <div className="relative shrink-0">
          <div
            className={clsx(
              "flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-[#0D1933] text-base font-black text-white shadow-[0_10px_25px_rgba(13,25,51,0.2)] transition-transform duration-300",
              isInteractive && "group-hover:scale-105",
            )}
          >
            {stock.bloodType}
          </div>

          <span
            className={clsx(
              "absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white",
              level.iconWrapper,
            )}
          >
            <LevelIcon className="h-3 w-3" strokeWidth={2.7} />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em]",
                    level.badge,
                  )}
                >
                  <LevelIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {level.label}
                </span>

                <span
                  className={clsx(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em]",
                    trend.background,
                    trend.text,
                  )}
                >
                  <TrendIcon className="h-3.5 w-3.5" />
                  {trend.label}
                </span>
              </div>

              <p className="mt-2 truncate text-xs font-semibold text-slate-500">
                {level.description}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-xl font-black tracking-tight text-[#0D1933]">
                  {stock.units}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  units
                </span>
              </div>

              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                of {safeMaxUnits} capacity
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <Droplets className="h-3.5 w-3.5" />
                Inventory level
              </span>

              <span className="text-[10px] font-black text-slate-500">
                {Math.round(percentage)}%
              </span>
            </div>

            <div
              className="h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label={`${stock.bloodType} inventory`}
              aria-valuemin={0}
              aria-valuemax={safeMaxUnits}
              aria-valuenow={stock.units}
            >
              <div
                className={clsx(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  level.bar,
                  level.glow,
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  level.iconWrapper,
                )}
              >
                <PackageCheck className="h-3.5 w-3.5" />
              </span>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                  Availability
                </p>

                <p className="text-[11px] font-bold text-[#0D1933]">
                  {stock.level === "CRITICAL"
                    ? "Restock now"
                    : stock.level === "LOW"
                      ? "Monitor closely"
                      : "Ready for dispatch"}
                </p>
              </div>
            </div>

            {isInteractive && (
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 transition group-hover:border-slate-200 group-hover:bg-[#0D1933] group-hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
