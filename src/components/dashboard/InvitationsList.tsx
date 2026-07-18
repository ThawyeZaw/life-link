"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Droplets,
  Mail,
  MapPin,
  Radio,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setRefreshing(true);

      const { data } = await createClient().rpc("get_my_invitations");

      if (mounted) {
        setInvites((data as Invitation[]) ?? []);
        setRefreshing(false);
      }
    };

    load();

    const interval = setInterval(load, 8000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (invites === null) {
    return (
      <section className="min-w-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-950">
              Scanning invitations
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Checking the donor network for matching requests.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (invites.length === 0) return null;

  const activeInvitations = invites.filter(
    (invite) => invite.match_status === "INVITED",
  ).length;

  return (
    <section className="min-w-0 space-y-3">
      <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff7f7_100%)] p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-red-200/45 blur-3xl" />

          <div className="absolute right-7 top-5 h-20 w-20 rounded-full border border-red-200/60" />
          <div className="absolute right-10 top-8 h-14 w-14 rounded-full border border-red-200/60" />
          <div className="absolute right-[3.6rem] top-[3.4rem] h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]">
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-70" />
          </div>
        </div>

        <div className="relative flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-[0_12px_28px_rgba(239,68,68,0.24)]">
              <Mail className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-500 sm:text-xs">
                  Donor radar
                </p>

                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>

              <h2 className="mt-1.5 text-lg font-black tracking-[-0.025em] text-slate-950 sm:text-xl">
                Donation invitations
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Review compatible emergency requests sent to your donor profile.
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm sm:flex">
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                refreshing ? "animate-spin text-red-500" : "text-slate-400"
              }`}
            />
            Auto-updating
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white bg-white/80 p-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="h-4 w-4 shrink-0 text-red-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                Active
              </span>
            </div>

            <p className="mt-1.5 text-lg font-black text-slate-950">
              {activeInvitations}
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 p-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                Privacy
              </span>
            </div>

            <p className="mt-1.5 text-sm font-black text-emerald-700">
              Protected
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {invites.map((invite) => {
          const meta = MATCH_STATUS_META[invite.match_status];
          const isInvited = invite.match_status === "INVITED";

          const card = (
            <article
              className={`group relative min-w-0 overflow-hidden rounded-[22px] border bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.055)] transition duration-300 sm:rounded-[26px] sm:p-5 ${
                isInvited
                  ? "border-red-200 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-[0_18px_50px_rgba(239,68,68,0.12)]"
                  : "border-slate-200"
              }`}
            >
              {isInvited && (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              )}

              <div className="flex min-w-0 items-start gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-sm font-black text-white shadow-[0_10px_24px_rgba(239,68,68,0.22)] sm:h-14 sm:w-14 sm:text-base">
                  {invite.blood_type}

                  {isInvited && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-red-500" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-black leading-5 text-slate-950 sm:text-base">
                        {invite.hospital_name}
                      </p>

                      {invite.hospital_township && (
                        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">
                            {invite.hospital_township}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 self-start">
                      <StatusPill
                        label={meta.label}
                        className={meta.className}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-700">
                      <Droplets className="h-3.5 w-3.5" />
                      {invite.units_needed}{" "}
                      {invite.units_needed === 1 ? "unit" : "units"}
                    </span>

                    {invite.distance_km != null && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-600">
                        <MapPin className="h-3.5 w-3.5" />~{invite.distance_km}{" "}
                        km
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold capitalize text-amber-700">
                      <Clock3 className="h-3.5 w-3.5" />
                      {invite.urgency.toLowerCase()}
                    </span>
                  </div>

                  {isInvited && (
                    <div className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white transition group-hover:bg-red-600">
                      <span>Review invitation</span>

                      <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  )}
                </div>
              </div>
            </article>
          );

          return isInvited ? (
            <Link
              key={invite.match_id}
              href={`/match/${invite.token}`}
              className="block min-w-0 rounded-[22px] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100 sm:rounded-[26px]"
            >
              {card}
            </Link>
          ) : (
            <div key={invite.match_id} className="min-w-0">
              {card}
            </div>
          );
        })}
      </div>
    </section>
  );
};
