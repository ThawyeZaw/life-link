"use client";

import { MapPin, Phone, Droplets } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { URGENCY_META } from "@/lib/blood";
import type { Urgency } from "@/lib/types";

export interface InviteRequest {
  blood_type: string;
  units_needed: number;
  urgency: Urgency;
  status: string;
  patient_name: string | null;
  hospitals: {
    name: string;
    name_mya: string | null;
    township: string | null;
    address: string | null;
    phone: string | null;
  };
}

export const InviteSummary = ({
  request,
  distanceKm,
}: {
  request: InviteRequest;
  distanceKm: number | null;
}) => {
  const urgency = URGENCY_META[request.urgency];
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-red-200 bg-red-50/60 p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white">
          {request.blood_type}
        </span>
        <StatusPill label={urgency.label} className={urgency.className} />
      </div>
      <p className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <Droplets className="h-4 w-4 shrink-0 text-red-600" />
        {request.units_needed} unit{request.units_needed > 1 ? "s" : ""} of {request.blood_type} blood needed
      </p>
      <div className="rounded-2xl bg-white p-4">
        <p className="text-base font-semibold text-slate-900">{request.hospitals.name}</p>
        {request.hospitals.name_mya && (
          <p className="text-sm text-slate-600">{request.hospitals.name_mya}</p>
        )}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4 shrink-0 text-red-500" />
          {request.hospitals.address ?? request.hospitals.township ?? "Yangon"}
          {distanceKm != null && ` · ~${distanceKm} km from you`}
        </p>
        {request.hospitals.phone && (
          <a href={`tel:${request.hospitals.phone}`}
            className="mt-2 flex min-h-11 items-center gap-1.5 text-sm font-medium text-red-600">
            <Phone className="h-4 w-4" /> {request.hospitals.phone}
          </a>
        )}
      </div>
    </div>
  );
};
