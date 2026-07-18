"use client";

// src/components/broadcast/FacilitySelector.tsx
// LifeLink — Receiving facility selector
// Team Vertex Red

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  MapPin,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { clsx } from "clsx";

import type { Hospital } from "@/utils/supabase";

interface FacilitySelectorProps {
  hospitals: Hospital[];
  selectedId: string;
  onChange: (id: string) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const MAX_VISIBLE_FACILITIES = 6;

export function FacilitySelector({
  hospitals,
  selectedId,
  onChange,
  loading = false,
  disabled = false,
  error,
  className,
}: FacilitySelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedHospital = useMemo(
    () => hospitals.find((hospital) => hospital.id === selectedId),
    [hospitals, selectedId],
  );

  const filteredHospitals = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return hospitals;
    }

    return hospitals.filter((hospital) =>
      [hospital.name, hospital.township]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }, [hospitals, search]);

  const visibleHospitals = filteredHospitals.slice(0, MAX_VISIBLE_FACILITIES);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const openSelector = () => {
    if (disabled || loading || hospitals.length === 0) {
      return;
    }

    setIsOpen(true);
  };

  const selectHospital = (hospital: Hospital) => {
    onChange(hospital.id);
    setIsOpen(false);
    setSearch("");
  };

  const clearSelection = () => {
    onChange("");
    setSearch("");
  };

  if (loading) {
    return <FacilitySelectorLoading />;
  }

  if (hospitals.length === 0) {
    return <EmptyFacilityState />;
  }

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={openSelector}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="facility-options"
        className={clsx(
          "group flex min-h-16 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left",
          "transition duration-200",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-50",
          selectedHospital
            ? "border-emerald-200 bg-emerald-50/60 shadow-[0_10px_30px_rgba(16,185,129,0.08)]"
            : "border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-white",
          error && "border-red-300 bg-red-50/50",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition",
            selectedHospital
              ? "bg-emerald-500 text-white"
              : error
                ? "bg-red-100 text-red-500"
                : "bg-white text-emerald-600 shadow-sm",
          )}
        >
          <Building2 className="h-5 w-5" />
        </span>

        <span className="min-w-0 flex-1">
          {selectedHospital ? (
            <>
              <span className="block truncate text-sm font-black text-[#0D1933]">
                {selectedHospital.name}
              </span>

              <span className="mt-1 flex items-center gap-1.5 truncate text-[11px] font-medium text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

                <span className="truncate">
                  {selectedHospital.township || "Verified receiving facility"}
                </span>
              </span>
            </>
          ) : (
            <>
              <span
                className={clsx(
                  "block text-sm font-black",
                  error ? "text-red-700" : "text-[#0D1933]",
                )}
              >
                Select receiving facility
              </span>

              <span
                className={clsx(
                  "mt-1 block text-[11px]",
                  error ? "text-red-500" : "text-slate-500",
                )}
              >
                Search an approved hospital or township
              </span>
            </>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {selectedHospital && (
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-emerald-700 sm:inline-flex">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          )}

          <ChevronDown
            className={clsx(
              "h-4 w-4 text-slate-400 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </span>
      </button>

      {error && (
        <p
          id="facility-selector-error"
          className="mt-2 text-xs font-bold text-red-600"
        >
          {error}
        </p>
      )}

      {selectedHospital && !error && (
        <div className="mt-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Approved LifeLink facility
          </div>

          <button
            type="button"
            onClick={clearSelection}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-3 w-3" />
            Change
          </button>
        </div>
      )}

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-40 overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_24px_65px_rgba(15,23,42,0.16)]">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                ref={searchInputRef}
                id="facility-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search hospital or township"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-[#0D1933] outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear facility search"
                  className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div
            id="facility-options"
            role="listbox"
            aria-label="Approved receiving facilities"
            className="max-h-[340px] overflow-y-auto overscroll-contain p-2"
          >
            {visibleHospitals.length > 0 ? (
              <div className="space-y-1">
                {visibleHospitals.map((hospital) => {
                  const isSelected = hospital.id === selectedId;

                  return (
                    <button
                      key={hospital.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectHospital(hospital)}
                      className={clsx(
                        "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                        isSelected
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-transparent hover:border-slate-100 hover:bg-slate-50",
                      )}
                    >
                      <span
                        className={clsx(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          isSelected
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-white",
                        )}
                      >
                        <Building2 className="h-4 w-4" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-[#0D1933]">
                          {hospital.name}
                        </span>

                        <span className="mt-1 flex items-center gap-1.5 truncate text-[10px] font-medium text-slate-500">
                          <MapPin className="h-3 w-3 shrink-0" />

                          <span className="truncate">
                            {hospital.township || "Verified hospital facility"}
                          </span>
                        </span>
                      </span>

                      <span
                        className={clsx(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-200 bg-white text-transparent",
                        )}
                      >
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search className="h-5 w-5" />
                </div>

                <p className="mt-3 text-sm font-black text-[#0D1933]">
                  No facilities found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try another hospital name or township.
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 rounded-xl bg-[#0D1933] px-4 py-2 text-[10px] font-black text-white"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />

              <span className="text-[10px] font-bold text-slate-500">
                Approved LifeLink facilities
              </span>
            </div>

            <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-slate-500 shadow-sm">
              {filteredHospitals.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function FacilitySelectorLoading() {
  return (
    <div className="space-y-2" aria-live="polite">
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-200" />

          <div className="min-w-0 flex-1">
            <div className="h-3 w-36 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-52 max-w-full rounded bg-slate-200" />
          </div>

          <div className="h-4 w-4 rounded bg-slate-200" />
        </div>
      </div>

      <p className="px-1 text-[10px] font-medium text-slate-400">
        Loading approved facilities...
      </p>
    </div>
  );
}

function EmptyFacilityState() {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Building2 className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-black text-[#0D1933]">
        No approved facilities
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
        No receiving hospital is currently available for this broadcast.
      </p>
    </div>
  );
}
