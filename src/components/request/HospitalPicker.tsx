"use client";

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Check,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { Hospital } from "@/lib/types";

export const HospitalPicker = ({
  selected,
  onSelect,
}: {
  selected: Hospital | null;
  onSelect: (hospital: Hospital | null) => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Hospital[]>([]);
  const [searching, setSearching] = useState(false);

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) {
      clearTimeout(debounce.current);
    }

    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    debounce.current = setTimeout(async () => {
      const { data } = await createClient()
        .from("hospitals")
        .select("id, name, name_mya, township, address, phone, lat, lng")
        .or(`name.ilike.%${query}%,township.ilike.%${query}%`)
        .limit(8);

      setResults((data as Hospital[]) ?? []);
      setSearching(false);
    }, 250);

    return () => {
      if (debounce.current) {
        clearTimeout(debounce.current);
      }
    };
  }, [query]);

  const clearSelection = () => {
    onSelect(null);
    setQuery("");
    setResults([]);
  };

  const chooseHospital = (hospital: Hospital) => {
    onSelect(hospital);
    setQuery("");
    setResults([]);
  };

  if (selected) {
    return (
      <section className="relative overflow-hidden rounded-[26px] border border-red-200 bg-white p-4 shadow-[0_16px_44px_rgba(15,23,42,0.07)] sm:p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-100/80 blur-3xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-red-600 text-white shadow-[0_10px_26px_rgba(220,38,38,0.24)]">
              <Building2 className="h-5 w-5" />

              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
                <Check className="h-3 w-3" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-red-600">
                  Selected hospital
                </p>

                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              </div>

              <h3 className="mt-1.5 break-words text-base font-black text-slate-950 sm:text-lg">
                {selected.name}
              </h3>

              {selected.name_mya && (
                <p className="mt-0.5 break-words text-sm font-medium text-slate-500">
                  {selected.name_mya}
                </p>
              )}

              <div className="mt-2 flex items-start gap-1.5 text-sm leading-5 text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                <p className="min-w-0 break-words">
                  {selected.township ?? "Yangon"}
                  {selected.address ? ` · ${selected.address}` : ""}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={clearSelection}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
            aria-label="Change hospital"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-3 shadow-[0_16px_44px_rgba(15,23,42,0.07)] transition focus-within:border-red-300 focus-within:shadow-[0_18px_50px_rgba(220,38,38,0.10)]">
        <div className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full bg-red-100/60 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition group-focus-within:text-red-500">
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <label
              htmlFor="hospital-search"
              className="block text-[9px] font-black uppercase tracking-[0.12em] text-slate-400"
            >
              Hospital
            </label>

            <input
              id="hospital-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by hospital name or township"
              autoComplete="off"
              className="min-h-8 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 sm:text-base"
            />
          </div>

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear hospital search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {query.trim() && (
        <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_65px_rgba(15,23,42,0.16)]">
          {searching ? (
            <div className="flex items-center gap-3 px-4 py-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Searching hospitals
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Looking for matching facilities nearby.
                </p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Search results
                  </p>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                    {results.length}
                  </span>
                </div>
              </div>

              <ul className="max-h-80 overflow-y-auto p-2">
                {results.map((hospital) => (
                  <li key={hospital.id}>
                    <button
                      type="button"
                      onClick={() => chooseHospital(hospital)}
                      className="group flex w-full items-start gap-3 rounded-[18px] px-3 py-3 text-left transition hover:bg-red-50"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 transition group-hover:border-red-200 group-hover:bg-white group-hover:text-red-600">
                        <Building2 className="h-4 w-4" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-black text-slate-900">
                          {hospital.name}
                        </span>

                        {hospital.name_mya && (
                          <span className="mt-0.5 block break-words text-xs font-medium text-slate-500">
                            {hospital.name_mya}
                          </span>
                        )}

                        <span className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                          <span className="break-words">
                            {hospital.township ?? "Yangon"}
                            {hospital.address ? ` · ${hospital.address}` : ""}
                          </span>
                        </span>
                      </span>

                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-transparent transition group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="px-5 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Search className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-black text-slate-900">
                No hospitals found
              </p>

              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
                Try another hospital name or township.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex items-start gap-2 px-1 text-xs leading-5 text-slate-400">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
        <p>Select the hospital coordinating this blood request.</p>
      </div>
    </section>
  );
};
