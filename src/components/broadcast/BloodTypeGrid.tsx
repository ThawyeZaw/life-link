"use client";

// src/components/broadcast/BloodTypeGrid.tsx
// LifeLink — Accessible blood type multi-select
// Team Vertex Red

import { Check, Droplets, RotateCcw } from "lucide-react";
import { clsx } from "clsx";

import type { BloodType } from "@/utils/supabase";

const ALL_TYPES: BloodType[] = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
];

interface BloodTypeGridProps {
  selected: BloodType[];
  onChange: (types: BloodType[]) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function BloodTypeGrid({
  selected,
  onChange,
  disabled = false,
  error,
  className,
}: BloodTypeGridProps) {
  const selectedSet = new Set(selected);
  const allSelected = selected.length === ALL_TYPES.length;
  const hasSelection = selected.length > 0;

  const toggleBloodType = (type: BloodType) => {
    if (disabled) {
      return;
    }

    const nextTypes = selectedSet.has(type)
      ? selected.filter((item) => item !== type)
      : ALL_TYPES.filter((item) => selectedSet.has(item) || item === type);

    onChange(nextTypes);
  };

  const toggleAll = () => {
    if (disabled) {
      return;
    }

    onChange(allSelected ? [] : ALL_TYPES);
  };

  const clearSelection = () => {
    if (disabled || !hasSelection) {
      return;
    }

    onChange([]);
  };

  return (
    <div className={className}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Droplets className="h-4 w-4" />
            </span>

            <div>
              <h3 className="text-sm font-black text-[#0D1933]">
                Required blood types
              </h3>

              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                Select every blood group needed for this request.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleAll}
          disabled={disabled}
          className={clsx(
            "inline-flex h-9 shrink-0 items-center justify-center rounded-xl px-3",
            "text-[10px] font-black transition",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-100",
            allSelected
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-[#0D1933] text-white hover:bg-[#18294F]",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>

      <div
        role="group"
        aria-label="Required blood types"
        aria-describedby={error ? "blood-type-error" : undefined}
        className="grid grid-cols-4 gap-2 sm:gap-3"
      >
        {ALL_TYPES.map((type) => {
          const isSelected = selectedSet.has(type);

          return (
            <button
              key={type}
              id={`blood-type-${type
                .replace("+", "positive")
                .replace("-", "negative")}`}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${type} blood type${isSelected ? ", selected" : ""}`}
              disabled={disabled}
              onClick={() => toggleBloodType(type)}
              className={clsx(
                "group relative flex min-h-[76px] flex-col items-center justify-center",
                "overflow-hidden rounded-2xl border p-2 text-center",
                "transition duration-200",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
                isSelected
                  ? "border-red-500 bg-red-500 text-white shadow-[0_10px_24px_rgba(239,68,68,0.2)]"
                  : "border-slate-200 bg-white text-[#0D1933] hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50/40",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border transition",
                  isSelected
                    ? "border-white/25 bg-white text-red-500"
                    : "border-slate-200 bg-white text-transparent",
                )}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>

              <span
                className={clsx(
                  "text-xl font-black tracking-tight sm:text-2xl",
                  isSelected ? "text-white" : "text-[#0D1933]",
                )}
              >
                {type}
              </span>

              <span
                className={clsx(
                  "mt-1 text-[8px] font-black uppercase tracking-[0.08em]",
                  isSelected ? "text-red-100" : "text-slate-400",
                )}
              >
                {isSelected ? "Selected" : "Select"}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={clsx(
          "mt-4 flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-3.5 py-3",
          "transition",
          error
            ? "border-red-200 bg-red-50"
            : hasSelection
              ? "border-emerald-100 bg-emerald-50/70"
              : "border-slate-200 bg-slate-50",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={clsx(
              "flex h-8 min-w-8 shrink-0 items-center justify-center rounded-xl px-2",
              "text-xs font-black",
              error
                ? "bg-red-500 text-white"
                : hasSelection
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-500",
            )}
          >
            {selected.length}
          </span>

          <div className="min-w-0">
            <p
              className={clsx(
                "truncate text-xs font-black",
                error
                  ? "text-red-700"
                  : hasSelection
                    ? "text-emerald-800"
                    : "text-slate-500",
              )}
            >
              {error
                ? error
                : selected.length === 0
                  ? "Choose at least one blood type"
                  : selected.length === 1
                    ? "1 blood type selected"
                    : `${selected.length} blood types selected`}
            </p>

            {hasSelection && !error && (
              <p className="mt-0.5 truncate text-[10px] font-semibold text-emerald-600">
                {selected.join(" · ")}
              </p>
            )}
          </div>
        </div>

        {hasSelection && !allSelected && (
          <button
            type="button"
            onClick={clearSelection}
            disabled={disabled}
            aria-label="Clear selected blood types"
            className={clsx(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              "text-slate-400 transition hover:bg-white hover:text-red-500",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
