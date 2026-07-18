"use client";

import {
  CheckCheck,
  HeartHandshake,
  Loader2,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldCheck,
} from "lucide-react";

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
    <article className="group relative min-w-0 overflow-hidden rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-[0_20px_52px_rgba(15,23,42,0.09)] sm:p-5">
      <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-red-100/70 blur-3xl" />

      <div className="relative space-y-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-12 min-w-12 shrink-0 items-center justify-center rounded-[18px] bg-red-600 px-2 text-sm font-black text-white shadow-[0_10px_24px_rgba(220,38,38,0.22)]">
              {match.donor_blood_type}

              {["ACCEPTED", "CONFIRMED"].includes(match.status) && (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500" />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-black text-slate-950">
                {match.donor_name}
              </p>

              <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span className="truncate">
                    {match.donor_township ?? "Yangon"}
                  </span>
                </span>

                {match.distance_km != null && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>Approximately {match.distance_km} km away</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <StatusPill label={meta.label} className={meta.className} />
          </div>
        </div>

        {match.contact_phone && (
          <div className="overflow-hidden rounded-[22px] border border-emerald-200 bg-emerald-50/80">
            <div className="flex items-center gap-2 border-b border-emerald-200/80 px-3.5 py-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />

              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                Donor contact unlocked
              </p>
            </div>

            <div className="space-y-2 p-3">
              <a
                href={`tel:${match.contact_phone}`}
                className="group/phone flex min-h-12 min-w-0 items-center justify-between gap-3 rounded-2xl bg-white px-3 text-sm font-black text-emerald-700 shadow-sm transition hover:bg-emerald-100"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Phone className="h-4 w-4" />
                  </span>

                  <span className="truncate">{match.contact_phone}</span>
                </span>

                <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.1em]">
                  Call
                </span>
              </a>

              {match.contact_note && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-white/80 px-3 py-3 text-sm leading-5 text-emerald-900">
                  <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                  <p className="min-w-0 break-words">
                    &ldquo;{match.contact_note}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {match.status === "ACCEPTED" && (
          <button
            type="button"
            onClick={() => onAction(match.id, "confirm")}
            disabled={busy}
            className="group/button flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(5,150,105,0.22)] transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <HeartHandshake className="h-4 w-4 transition group-hover/button:scale-110" />
            )}

            {busy ? "Confirming donor..." : "Confirm this donor"}
          </button>
        )}

        {match.status === "CONFIRMED" && (
          <button
            type="button"
            onClick={() => onAction(match.id, "donated")}
            disabled={busy}
            className="group/button flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,23,42,0.20)] transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4 transition group-hover/button:scale-110" />
            )}

            {busy ? "Updating donation..." : "Mark blood donated"}
          </button>
        )}

        {match.status === "DONATED" && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <CheckCheck className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-black text-emerald-900">
                Donation completed
              </p>

              <p className="mt-0.5 text-xs leading-5 text-emerald-700">
                This donor has successfully completed the donation.
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
