"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MATCH_STATUS_META } from "@/lib/blood";
import { StatusPill } from "@/components/ui/StatusPill";

interface Invitation {
  match_id: string;
  token: string;
  match_status: keyof typeof MATCH_STATUS_META;
  distance_km: number | null;
  blood_type: string;
  units_needed: number;
  urgency: string;
  hospital_name: string;
  hospital_township: string | null;
}

export const InvitationsList = () => {
  const [invites, setInvites] = useState<Invitation[] | null>(null);

  useEffect(() => {
    const load = () =>
      createClient()
        .rpc("get_my_invitations")
        .then(({ data }) => setInvites((data as Invitation[]) ?? []));
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!invites || invites.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <Mail className="h-4 w-4" /> Donation invitations
      </h2>
      {invites.map((inv) => {
        const meta = MATCH_STATUS_META[inv.match_status];
        const card = (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-red-200">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {inv.blood_type}
              </span>
              <div>
                <p className="text-base font-semibold text-slate-900">{inv.hospital_name}</p>
                <p className="text-sm text-slate-500">
                  {inv.units_needed} unit{inv.units_needed > 1 ? "s" : ""}
                  {inv.distance_km != null && ` · ~${inv.distance_km} km`}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusPill label={meta.label} className={meta.className} />
              {inv.match_status === "INVITED" && (
                <span className="text-xs font-semibold text-red-600">Respond →</span>
              )}
            </div>
          </div>
        );
        return inv.match_status === "INVITED" ? (
          <Link key={inv.match_id} href={`/match/${inv.token}`}>{card}</Link>
        ) : (
          <div key={inv.match_id}>{card}</div>
        );
      })}
    </section>
  );
};
