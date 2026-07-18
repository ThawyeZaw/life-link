"use client";

import { Check, ShieldCheck } from "lucide-react";
import type { DonorCandidate } from "@/lib/types";

export const DonorList = ({
  donors,
  selected,
  onToggle,
}: {
  donors: DonorCandidate[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) => (
  <div className="flex flex-col gap-2">
    <p className="flex items-center gap-1.5 text-xs text-slate-500">
      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
      Names & contacts stay hidden until a donor accepts. Distances are from the hospital.
    </p>
    {donors.map((d) => {
      const isSelected = selected.has(d.donor_id);
      return (
        <button
          key={d.donor_id}
          disabled={d.already_invited}
          onClick={() => onToggle(d.donor_id)}
          className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
            d.already_invited
              ? "border-slate-200 bg-slate-50 opacity-60"
              : isSelected
                ? "border-red-500 bg-red-50"
                : "border-slate-200 bg-white hover:border-red-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {d.blood_type}
            </span>
            <div>
              <p className="text-base font-semibold text-slate-900">{d.display_name}</p>
              <p className="text-sm text-slate-500">
                {d.township ?? "Yangon"} · ~{d.distance_km} km away
              </p>
            </div>
          </div>
          {d.already_invited ? (
            <span className="text-xs font-medium text-slate-400">Alerted</span>
          ) : (
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                isSelected ? "border-red-600 bg-red-600 text-white" : "border-slate-300"
              }`}
            >
              {isSelected && <Check className="h-3.5 w-3.5" />}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
