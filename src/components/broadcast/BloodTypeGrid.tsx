"use client";

// src/components/broadcast/BloodTypeGrid.tsx
// LifeLink — Blood type multi-select
// Team Vertex Red

import { Check, Droplets } from "lucide-react";
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
}

export function BloodTypeGrid({ selected, onChange }: BloodTypeGridProps) {
  const toggleBloodType = (type: BloodType) => {
    const isSelected = selected.includes(type);

    onChange(
      isSelected
        ? selected.filter((item) => item !== type)
        : [...selected, type],
    );
  };

  const selectAll = () => {
    onChange(ALL_TYPES);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#0D1933]">
            Blood compatibility
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Select one or more required blood groups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearAll}
            disabled={selected.length === 0}
            className="rounded-xl px-3 py-2 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={selectAll}
            disabled={selected.length === ALL_TYPES.length}
            className="rounded-xl bg-[#0D1933] px-3 py-2 text-[11px] font-bold text-white transition hover:bg-[#18294F] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Select all
          </button>
        </div>
      </div>

      <div
        role="group"
        aria-label="Select required blood types"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {ALL_TYPES.map((type) => {
          const isSelected = selected.includes(type);

          return (
            <button
              key={type}
              id={`blood-type-${type
                .replace("+", "positive")
                .replace("-", "negative")}`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleBloodType(type)}
              className={clsx(
                "group relative min-h-24 overflow-hidden rounded-[1.35rem] border-2 p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
                isSelected
                  ? "border-red-500 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[0_14px_30px_rgba(239,68,68,0.22)]"
                  : "border-slate-200 bg-white text-[#0D1933] hover:-translate-y-0.5 hover:border-red-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]",
              )}
            >
              <div
                aria-hidden="true"
                className={clsx(
                  "absolute -right-5 -top-5 h-20 w-20 rounded-full blur-2xl transition",
                  isSelected ? "bg-white/20" : "bg-red-100/60",
                )}
              />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={clsx(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition",
                      isSelected
                        ? "bg-white/15 text-white"
                        : "bg-red-50 text-red-500",
                    )}
                  >
                    <Droplets className="h-4 w-4" />
                  </div>

                  <span
                    className={clsx(
                      "flex h-6 w-6 items-center justify-center rounded-full border transition",
                      isSelected
                        ? "border-white/30 bg-white text-red-500"
                        : "border-slate-200 bg-white text-transparent",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xl font-black tracking-tight">{type}</p>

                  <p
                    className={clsx(
                      "mt-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                      isSelected ? "text-red-100" : "text-slate-400",
                    )}
                  >
                    {isSelected ? "Selected" : "Tap to select"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div
        className={clsx(
          "mt-4 flex items-center justify-between rounded-2xl border px-4 py-3 transition",
          selected.length > 0
            ? "border-red-100 bg-red-50"
            : "border-slate-200 bg-slate-50",
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-black",
              selected.length > 0
                ? "bg-red-500 text-white"
                : "bg-slate-200 text-slate-500",
            )}
          >
            {selected.length}
          </span>

          <p
            className={clsx(
              "text-xs font-bold",
              selected.length > 0 ? "text-red-700" : "text-slate-500",
            )}
          >
            {selected.length === 0
              ? "No blood types selected"
              : selected.length === 1
                ? "1 blood type selected"
                : `${selected.length} blood types selected`}
          </p>
        </div>

        {selected.length > 0 && (
          <p className="max-w-[45%] truncate text-right text-[10px] font-bold text-red-500">
            {selected.join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
