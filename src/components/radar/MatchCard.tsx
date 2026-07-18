"use client";

import { Loader2, Phone, HeartHandshake, CheckCheck } from "lucide-react";
import { MATCH_STATUS_META } from "@/lib/blood";
import { StatusPill } from "@/components/ui/StatusPill";

export interface TrackedMatch {
  id: string;
  status: keyof typeof MATCH_STATUS_META;
  distance_km: number | null;
  donor_name: string;
  donor_blood_type: string;
  donor_township: string | null;
  contact_phone: string | null;
  contact_note: string | null;
}

export const MatchCard = ({
  match,
  busy,
  onAction,
}: {
  match: TrackedMatch;
  busy: boolean;
  onAction: (id: string, action: "confirm" | "donated") => void;
}) => {
  const meta = MATCH_STATUS_META[match.status];
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {match.donor_blood_type}
          </span>
          <div>
            <p className="text-base font-semibold text-slate-900">{match.donor_name}</p>
            <p className="text-sm text-slate-500">
              {match.donor_township ?? "Yangon"}
              {match.distance_km != null && ` · ~${match.distance_km} km`}
            </p>
          </div>
        </div>
        <StatusPill label={meta.label} className={meta.className} />
      </div>

      {match.contact_phone && (
        <div className="rounded-xl bg-emerald-50 p-3">
          <a href={`tel:${match.contact_phone}`}
            className="flex min-h-11 items-center gap-2 text-base font-semibold text-emerald-700">
            <Phone className="h-4 w-4" /> {match.contact_phone}
          </a>
          {match.contact_note && (
            <p className="mt-1 text-sm text-emerald-800">&ldquo;{match.contact_note}&rdquo;</p>
          )}
        </div>
      )}

      {match.status === "ACCEPTED" && (
        <button
          onClick={() => onAction(match.id, "confirm")}
          disabled={busy}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartHandshake className="h-4 w-4" />}
          Confirm this donor
        </button>
      )}

      {match.status === "CONFIRMED" && (
        <button
          onClick={() => onAction(match.id, "donated")}
          disabled={busy}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
          Mark blood donated
        </button>
      )}
    </div>
  );
};
