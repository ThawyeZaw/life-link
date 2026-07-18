"use client";

import { Check, Droplets, MapPin, Radar, ShieldCheck } from "lucide-react";

import type { DonorCandidate } from "@/lib/types";

export const DonorList = ({
  donors,
  selected,
  onToggle,
}: {
  donors: DonorCandidate[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) => {
  return (
    <section className="space-y-3">
      <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

        <p>
          Names and contact details stay private until a donor accepts.
          Distances are measured from the hospital.
        </p>
      </div>

      <div className="space-y-2.5">
        {donors.map((donor, index) => {
          const isSelected = selected.has(donor.donor_id);

          return (
            <button
              key={donor.donor_id}
              type="button"
              disabled={donor.already_invited}
              onClick={() => onToggle(donor.donor_id)}
              aria-pressed={isSelected}
              className={`group relative flex min-h-[84px] w-full min-w-0 items-center justify-between gap-3 overflow-hidden rounded-[24px] border p-3.5 text-left shadow-sm transition duration-300 sm:p-4 ${
                donor.already_invited
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-65"
                  : isSelected
                    ? "border-red-300 bg-red-50 shadow-[0_16px_38px_rgba(239,68,68,0.12)] ring-4 ring-red-100"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-red-200 hover:shadow-[0_16px_38px_rgba(15,23,42,0.08)]"
              }`}
            >
              <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-red-100/60 blur-3xl" />

              <div className="relative flex min-w-0 flex-1 items-center gap-3">
                <div className="relative flex h-12 min-w-12 shrink-0 items-center justify-center rounded-[18px] bg-red-600 px-2 text-sm font-black text-white shadow-[0_10px_24px_rgba(220,38,38,0.22)]">
                  {donor.blood_type}

                  {!donor.already_invited && (
                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-black text-slate-950 sm:text-base">
                      {donor.display_name}
                    </p>

                    {!donor.already_invited && index < 3 && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-red-700">
                        <Radar className="h-3 w-3" />
                        Nearby
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
                      <span className="truncate">
                        {donor.township ?? "Yangon"}
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      Approximately {donor.distance_km} km away
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative shrink-0 pl-1">
                {donor.already_invited ? (
                  <span className="inline-flex min-h-8 items-center rounded-full border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                    Alerted
                  </span>
                ) : (
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition duration-300 ${
                      isSelected
                        ? "scale-105 border-red-600 bg-red-600 text-white shadow-[0_8px_18px_rgba(220,38,38,0.25)]"
                        : "border-slate-300 bg-white text-transparent group-hover:border-red-300"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {donors.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
            <Droplets className="h-5 w-5" />
          </div>

          <p className="mt-4 text-sm font-black text-slate-900">
            No eligible donors found
          </p>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
            Try expanding the search radius or checking again shortly.
          </p>
        </div>
      )}
    </section>
  );
};
