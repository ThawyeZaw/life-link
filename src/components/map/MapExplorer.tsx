"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Building2,
  Droplets,
  Loader2,
  MapPin,
  Radio,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { HospitalMap } from "./HospitalMap";
import type { BloodRequest, Hospital } from "@/lib/types";

export type MapRequest = Pick<
  BloodRequest,
  "id" | "blood_type" | "units_needed" | "urgency" | "hospital_id"
>;

export const MapExplorer = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [requests, setRequests] = useState<MapRequest[]>([]);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const loadMapData = async () => {
      setLoading(true);

      const [hospitalsResult, requestsResult] = await Promise.all([
        supabase
          .from("hospitals")
          .select("id, name, name_mya, township, address, phone, lat, lng"),
        supabase
          .from("requests")
          .select("id, blood_type, units_needed, urgency, hospital_id")
          .in("status", ["OPEN", "MATCHED"]),
      ]);

      setHospitals((hospitalsResult.data as Hospital[]) ?? []);
      setRequests((requestsResult.data as MapRequest[]) ?? []);
      setLoading(false);
    };

    loadMapData();
  }, []);

  const requestsByHospital = useMemo(() => {
    const map = new Map<string, MapRequest[]>();

    for (const request of requests) {
      map.set(request.hospital_id, [
        ...(map.get(request.hospital_id) ?? []),
        request,
      ]);
    }

    return map;
  }, [requests]);

  const hospitalsNeedingBlood = useMemo(
    () => hospitals.filter((hospital) => requestsByHospital.has(hospital.id)),
    [hospitals, requestsByHospital],
  );

  const criticalRequestCount = useMemo(
    () => requests.filter((request) => request.urgency === "CRITICAL").length,
    [requests],
  );

  return (
    <div className="relative h-[calc(100dvh-4.5rem)] min-h-[560px] w-full overflow-hidden bg-slate-100">
      <HospitalMap
        hospitals={hospitals}
        requestsByHospital={requestsByHospital}
        selected={selected}
        onSelect={setSelected}
      />

      <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 sm:left-4 sm:right-auto sm:top-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-[20px] border border-white/80 bg-white/90 p-2 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>

            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-red-700">
              Live network
            </span>
          </div>

          <div className="hidden h-6 w-px bg-slate-200 sm:block" />

          <MapStat
            icon={<Building2 className="h-3.5 w-3.5" />}
            value={hospitals.length}
            label="Hospitals"
          />

          <MapStat
            icon={<Droplets className="h-3.5 w-3.5" />}
            value={requests.length}
            label="Requests"
          />

          {criticalRequestCount > 0 && (
            <MapStat
              icon={<Activity className="h-3.5 w-3.5" />}
              value={criticalRequestCount}
              label="Critical"
              critical
            />
          )}
        </div>
      </div>

      {loading && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
            <Loader2 className="h-5 w-5 animate-spin text-red-600" />

            <div>
              <p className="text-sm font-black text-slate-950">
                Loading blood network
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Finding hospitals and active requests
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && hospitalsNeedingBlood.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-3 sm:pb-4">
          <div className="mb-2 flex items-center justify-between gap-3 px-3 sm:px-4">
            <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 shadow-sm backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 sm:text-xs">
                Needs blood now
              </p>

              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-black text-white">
                {hospitalsNeedingBlood.length}
              </span>
            </div>

            <div className="hidden items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-bold text-slate-500 shadow-sm backdrop-blur-xl sm:flex">
              <Radio className="h-3.5 w-3.5 text-red-500" />
              Select a hospital
            </div>
          </div>

          <div className="pointer-events-auto flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 sm:px-4">
            {hospitalsNeedingBlood.map((hospital) => {
              const hospitalRequests =
                requestsByHospital.get(hospital.id) ?? [];

              const criticalCount = hospitalRequests.filter(
                (request) => request.urgency === "CRITICAL",
              ).length;

              const isSelected = selected?.id === hospital.id;

              return (
                <button
                  key={hospital.id}
                  type="button"
                  onClick={() => setSelected(hospital)}
                  className={`group relative w-[280px] shrink-0 snap-start overflow-hidden rounded-[24px] border bg-white/95 p-4 text-left shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 sm:w-[310px] ${
                    isSelected
                      ? "border-red-300 ring-4 ring-red-100"
                      : "border-white/90 hover:border-red-200"
                  }`}
                >
                  <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-red-100/80 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-[0_10px_24px_rgba(220,38,38,0.22)]">
                          <Building2 className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950">
                            {hospital.name}
                          </p>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
                            <span className="truncate">
                              {hospital.township ?? "Yangon"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-red-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Live
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {hospitalRequests.map((request) => (
                        <span
                          key={request.id}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-black ${
                            request.urgency === "CRITICAL"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : request.urgency === "URGENT"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          <Droplets className="h-3 w-3" />
                          {request.blood_type}
                          <span className="font-bold opacity-70">
                            {request.units_needed}u
                          </span>
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        {hospitalRequests.length} active request
                        {hospitalRequests.length > 1 ? "s" : ""}
                      </p>

                      {criticalCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600">
                          <Activity className="h-3.5 w-3.5" />
                          {criticalCount} critical
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const MapStat = ({
  icon,
  value,
  label,
  critical = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  critical?: boolean;
}) => {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${
        critical ? "bg-red-50 text-red-700" : "bg-slate-50 text-slate-700"
      }`}
    >
      <span className={critical ? "text-red-500" : "text-slate-400"}>
        {icon}
      </span>

      <span className="text-xs font-black">{value}</span>

      <span className="hidden text-[10px] font-bold uppercase tracking-[0.08em] opacity-70 sm:inline">
        {label}
      </span>
    </div>
  );
};
