"use client";

import { useState } from "react";
import { MapPin, Radar as RadarIcon, ListChecks } from "lucide-react";
import { REQUEST_STATUS_META, URGENCY_META } from "@/lib/blood";
import { StatusPill } from "@/components/ui/StatusPill";
import { BloodTypeBadge } from "@/components/ui/BloodTypeBadge";
import { RadarSearch } from "./RadarSearch";
import { MatchTracker } from "./MatchTracker";
import type { BloodRequest, RequestStatus } from "@/lib/types";

export const RequestFlow = ({
  request,
  initialHasMatches,
}: {
  request: BloodRequest;
  initialHasMatches: boolean;
}) => {
  const [view, setView] = useState<"radar" | "tracker">(
    initialHasMatches ? "tracker" : "radar"
  );
  const [status, setStatus] = useState<RequestStatus>(request.status);

  const statusMeta = REQUEST_STATUS_META[status];
  const urgencyMeta = URGENCY_META[request.urgency];
  const active = !["COMPLETED", "CANCELLED", "EXPIRED"].includes(status);

  return (
    <div className="flex flex-col gap-6">
      {/* Request summary */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BloodTypeBadge type={request.blood_type} size="lg" />
            <div>
              <p className="text-lg font-bold text-slate-900">
                {request.units_needed} unit{request.units_needed > 1 ? "s" : ""} needed
              </p>
              <StatusPill label={urgencyMeta.label} className={urgencyMeta.className} />
            </div>
          </div>
          <StatusPill label={statusMeta.label} className={statusMeta.className} />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4 shrink-0 text-red-500" />
          {request.hospitals?.name}
          {request.hospitals?.township ? ` · ${request.hospitals.township}` : ""}
        </p>
        {request.notes && <p className="text-sm text-slate-600">{request.notes}</p>}
      </div>

      {/* View switcher */}
      {active && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button
            onClick={() => setView("radar")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
              view === "radar" ? "bg-white text-red-600 shadow-sm" : "text-slate-500"
            }`}
          >
            <RadarIcon className="h-4 w-4" /> Radar
          </button>
          <button
            onClick={() => setView("tracker")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
              view === "tracker" ? "bg-white text-red-600 shadow-sm" : "text-slate-500"
            }`}
          >
            <ListChecks className="h-4 w-4" /> Responses
          </button>
        </div>
      )}

      {view === "radar" && active ? (
        <RadarSearch requestId={request.id} onInvited={() => setView("tracker")} />
      ) : (
        <MatchTracker
          requestId={request.id}
          onStatusChange={(s) => setStatus(s as RequestStatus)}
        />
      )}
    </div>
  );
};
