"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("hospitals")
      .select("id, name, name_mya, township, address, phone, lat, lng")
      .then(({ data }) => setHospitals((data as Hospital[]) ?? []));
    supabase
      .from("requests")
      .select("id, blood_type, units_needed, urgency, hospital_id")
      .in("status", ["OPEN", "MATCHED"])
      .then(({ data }) => setRequests((data as MapRequest[]) ?? []));
  }, []);

  const requestsByHospital = useMemo(() => {
    const map = new Map<string, MapRequest[]>();
    for (const r of requests) {
      map.set(r.hospital_id, [...(map.get(r.hospital_id) ?? []), r]);
    }
    return map;
  }, [requests]);

  const hospitalsNeedingBlood = useMemo(
    () => hospitals.filter((h) => requestsByHospital.has(h.id)),
    [hospitals, requestsByHospital]
  );

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full">
      <HospitalMap
        hospitals={hospitals}
        requestsByHospital={requestsByHospital}
        selected={selected}
        onSelect={setSelected}
      />

      {/* Bottom cards: places needing blood right now */}
      {hospitalsNeedingBlood.length > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-4">
          <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Needs blood now ({hospitalsNeedingBlood.length})
          </p>
          <div className="pointer-events-auto flex gap-3 overflow-x-auto px-4 pb-1">
            {hospitalsNeedingBlood.map((h) => {
              const reqs = requestsByHospital.get(h.id)!;
              return (
                <button
                  key={h.id}
                  onClick={() => setSelected(h)}
                  className="flex w-64 shrink-0 flex-col gap-1.5 rounded-2xl border border-red-100 bg-white/95 p-4 text-left shadow-lg backdrop-blur"
                >
                  <p className="truncate text-sm font-bold text-slate-900">{h.name}</p>
                  <p className="text-xs text-slate-500">{h.township ?? "Yangon"}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {reqs.map((r) => (
                      <span
                        key={r.id}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold text-white ${
                          r.urgency === "CRITICAL" ? "bg-red-600" : r.urgency === "URGENT" ? "bg-amber-500" : "bg-slate-500"
                        }`}
                      >
                        {r.blood_type} · {r.units_needed}u
                      </span>
                    ))}
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
