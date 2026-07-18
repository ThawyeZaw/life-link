"use client";

// src/components/broadcast/FacilitySelector.tsx
// LifeLink — Receiving facility selector
// Team Vertex Red

import { useMemo, useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

import type { Hospital } from "@/utils/supabase";

interface FacilitySelectorProps {
  hospitals: Hospital[];
  selectedId: string;
  onChange: (id: string) => void;
  loading?: boolean;
}

export function FacilitySelector({
  hospitals,
  selectedId,
  onChange,
  loading = false,
}: FacilitySelectorProps) {
  const [search, setSearch] = useState("");

  const selectedHospital = useMemo(
    () => hospitals.find((hospital) => hospital.id === selectedId),
    [hospitals, selectedId],
  );

  const filteredHospitals = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return hospitals;

    return hospitals.filter((hospital) =>
      [hospital.name, hospital.township]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [hospitals, search]);

  if (loading) {
    return (
      <div className="space-y-3" aria-live="polite">
        <div className="animate-pulse rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-200" />

            <div className="flex-1">
              <div className="h-3 w-32 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-48 rounded bg-slate-200" />
            </div>

            <div className="h-5 w-5 rounded bg-slate-200" />
          </div>
        </div>

        <p className="text-xs font-medium text-slate-400">
          Loading approved hospital facilities...
        </p>
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>

        <h3 className="mt-4 text-sm font-black text-[#0D1933]">
          No facilities available
        </h3>

        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
          No approved hospital facilities could be found for this broadcast.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          id="facility-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search hospital or township"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-[#0D1933] outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
        />
      </div>

      <div className="relative">
        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />

        <select
          id="facility-selector"
          value={selectedId}
          onChange={(event) => onChange(event.target.value)}
          className={clsx(
            "h-14 w-full appearance-none rounded-2xl border bg-white pl-11 pr-12 text-sm outline-none transition",
            selectedId
              ? "border-emerald-200 font-bold text-[#0D1933] shadow-[0_10px_30px_rgba(16,185,129,0.08)]"
              : "border-slate-200 font-medium text-slate-500",
            "focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50",
          )}
        >
          <option value="">Select receiving facility</option>

          {filteredHospitals.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
              {hospital.township ? ` — ${hospital.township}` : ""}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      {search && filteredHospitals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs font-bold text-slate-500">
            No hospitals match “{search}”
          </p>
        </div>
      )}

      {selectedHospital && (
        <article className="relative overflow-hidden rounded-[1.4rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-4">
          <div
            aria-hidden="true"
            className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-200/40 blur-2xl"
          />

          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-100">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#0D1933]">
                    {selectedHospital.name}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {selectedHospital.township ||
                        "Verified hospital facility"}
                    </span>
                  </div>
                </div>

                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Approved receiving facility
              </div>
            </div>
          </div>
        </article>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />

          <p className="text-xs font-bold text-slate-600">
            Verified LifeLink facilities
          </p>
        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500 shadow-sm">
          {hospitals.length}
        </span>
      </div>
    </div>
  );
}
