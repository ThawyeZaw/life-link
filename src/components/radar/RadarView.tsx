"use client";

import { Building2, Check, Radar, ShieldCheck } from "lucide-react";

import type { DonorCandidate } from "@/lib/types";

const angleFor = (id: string) => {
  let hash = 0;

  for (let index = 0; index < id.length; index++) {
    hash = (hash * 31 + id.charCodeAt(index)) % 360;
  }

  return hash;
};

export const RadarView = ({
  donors,
  radiusKm,
  scanning,
  selected,
  onToggle,
}: {
  donors: DonorCandidate[];
  radiusKm: number;
  scanning: boolean;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) => {
  const selectedCount = donors.filter(
    (donor) => selected.has(donor.donor_id) && !donor.already_invited,
  ).length;

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-red-100/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-slate-100 blur-3xl" />

      <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-red-700">
              <span className="relative flex h-1.5 w-1.5">
                {scanning && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              {scanning ? "Scanning" : "Radar ready"}
            </span>
          </div>

          <h3 className="mt-2 text-base font-black tracking-[-0.025em] text-slate-950">
            Donor proximity map
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Select eligible donors directly from the radar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
            <p className="text-sm font-black leading-none text-slate-900">
              {donors.length}
            </p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
              Found
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-center">
            <p className="text-sm font-black leading-none text-red-700">
              {selectedCount}
            </p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.1em] text-red-500">
              Selected
            </p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[420px]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,#ffffff_0%,#fff7f7_46%,#fee2e2_100%)] shadow-[inset_0_0_55px_rgba(239,68,68,0.10),0_24px_55px_rgba(15,23,42,0.10)]" />

        <div className="absolute inset-[2px] overflow-hidden rounded-full border border-red-200/90">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.035)_1px,transparent_1px)] bg-[size:24px_24px]" />

          {[0.33, 0.66, 1].map((ring) => (
            <div
              key={ring}
              className="absolute rounded-full border border-red-200/80"
              style={{
                inset: `${(1 - ring) * 50}%`,
              }}
            />
          ))}

          <div className="absolute bottom-1/2 left-1/2 top-0 w-px -translate-x-1/2 bg-red-200/70" />
          <div className="absolute bottom-0 left-1/2 top-1/2 w-px -translate-x-1/2 bg-red-200/70" />
          <div className="absolute left-0 right-1/2 top-1/2 h-px -translate-y-1/2 bg-red-200/70" />
          <div className="absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 bg-red-200/70" />

          {scanning && (
            <>
              <div
                className="animate-radar-sweep absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(220,38,38,0.42) 0deg, rgba(239,68,68,0.15) 42deg, rgba(239,68,68,0.04) 72deg, transparent 102deg)",
                }}
              />

              <div className="animate-radar-ring absolute inset-[8%] rounded-full border-2 border-red-400/70" />
            </>
          )}

          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-25" />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-[22px] border-4 border-white bg-red-600 text-white shadow-[0_14px_34px_rgba(220,38,38,0.35)]">
              <Building2 className="h-7 w-7" />
            </div>

            <span className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 shadow-sm backdrop-blur">
              Hospital
            </span>
          </div>

          {donors.map((donor, index) => {
            const angle = (angleFor(donor.donor_id) * Math.PI) / 180;

            const distanceRatio = Math.min(donor.distance_km / radiusKm, 1);

            const radialPosition = distanceRatio * 38 + 7;
            const x = 50 + radialPosition * Math.cos(angle);
            const y = 50 + radialPosition * Math.sin(angle);
            const isSelected = selected.has(donor.donor_id);

            return (
              <button
                key={donor.donor_id}
                type="button"
                disabled={donor.already_invited}
                onClick={() =>
                  !donor.already_invited && onToggle(donor.donor_id)
                }
                aria-label={`${donor.display_name}, blood type ${donor.blood_type}`}
                aria-pressed={isSelected}
                className={`animate-blip-in group absolute z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[17px] border-2 text-[10px] font-black shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition duration-300 ${
                  donor.already_invited
                    ? "cursor-not-allowed border-white bg-slate-300 text-slate-600 opacity-75"
                    : isSelected
                      ? "scale-110 border-white bg-red-600 text-white ring-4 ring-red-200"
                      : "border-white bg-white text-red-600 ring-1 ring-red-200 hover:scale-110 hover:bg-red-50"
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  animationDelay: `${index * 90}ms`,
                }}
              >
                {donor.blood_type}

                {isSelected && !donor.already_invited && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm">
                    <Check className="h-3 w-3" />
                  </span>
                )}

                {donor.already_invited && (
                  <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-500" />
                )}

                <span className="pointer-events-none absolute left-1/2 top-[calc(100%+7px)] hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[9px] font-bold text-white shadow-lg group-hover:block">
                  {donor.distance_km} km
                </span>
              </button>
            );
          })}

          {donors.length === 0 && !scanning && (
            <div className="absolute left-1/2 top-[72%] flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 shadow-sm backdrop-blur">
              <Radar className="h-3.5 w-3.5" />
              No signals found
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-3 z-30 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/95 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.11em] text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <Radar className="h-3.5 w-3.5 text-red-500" />
            {radiusKm} km radius
          </span>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2">
        <LegendItem
          markerClassName="bg-red-600 ring-2 ring-red-200"
          label="Selected"
        />

        <LegendItem
          markerClassName="border border-red-200 bg-white"
          label="Available"
        />

        <LegendItem markerClassName="bg-slate-300" label="Alerted" />
      </div>

      <div className="relative mt-3 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs leading-5 text-emerald-800">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p>Donor identities remain private until they accept the invitation.</p>
      </div>
    </section>
  );
};

const LegendItem = ({
  markerClassName,
  label,
}: {
  markerClassName: string;
  label: string;
}) => {
  return (
    <div className="flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-2.5">
      <span className={`h-3 w-3 shrink-0 rounded-full ${markerClassName}`} />
      <span className="truncate text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">
        {label}
      </span>
    </div>
  );
};
