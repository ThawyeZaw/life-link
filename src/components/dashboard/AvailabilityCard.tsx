"use client";

import { useState } from "react";
import { Activity, HeartPulse, Radar, ShieldCheck, Signal } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export const AvailabilityCard = ({ profile }: { profile: Profile }) => {
  const [available, setAvailable] = useState(profile.is_available);
  const [updating, setUpdating] = useState(false);

  const toggle = async () => {
    if (updating) return;

    const next = !available;

    setAvailable(next);
    setUpdating(true);

    const { error } = await createClient()
      .from("profiles")
      .update({ is_available: next })
      .eq("id", profile.id);

    if (error) {
      setAvailable(!next);
    }

    setUpdating(false);
  };

  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-[24px] border p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition sm:rounded-[28px] sm:p-5 ${
        available
          ? "border-emerald-200 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdf4_100%)]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -right-12 -top-14 h-44 w-44 rounded-full blur-3xl ${
            available ? "bg-emerald-200/60" : "bg-slate-200/50"
          }`}
        />

        {available && (
          <>
            <div className="absolute right-8 top-8 h-20 w-20 rounded-full border border-emerald-300/30" />
            <div className="absolute right-11 top-11 h-14 w-14 rounded-full border border-emerald-300/30" />
            <div className="absolute right-[3.55rem] top-[3.55rem] h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.75)]">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-70" />
            </div>
          </>
        )}
      </div>

      <div className="relative flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white shadow-lg sm:h-14 sm:w-14 ${
              available
                ? "bg-emerald-500 shadow-emerald-500/20"
                : "bg-slate-800 shadow-slate-900/15"
            }`}
          >
            {profile.blood_type ?? "?"}

            {available && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-red-500" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex items-center gap-1.5 text-sm font-black text-slate-950 sm:text-base">
                <HeartPulse className="h-4 w-4 shrink-0 text-red-500" />
                Donor radar
              </p>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  available
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-slate-200 bg-slate-100 text-slate-500"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    available ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {available ? "Live" : "Offline"}
              </span>
            </div>

            <p className="mt-1.5 max-w-md text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              {available
                ? "Your profile can appear in compatible emergency radar scans."
                : "Your donor profile is hidden from nearby emergency searches."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          role="switch"
          aria-checked={available}
          aria-label={
            available
              ? "Turn off donor availability"
              : "Turn on donor availability"
          }
          disabled={updating}
          className={`relative mt-1 h-8 w-14 shrink-0 rounded-full border transition duration-300 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
            available
              ? "border-emerald-500 bg-emerald-500 focus:ring-emerald-100"
              : "border-slate-300 bg-slate-300 focus:ring-slate-100"
          }`}
        >
          <span
            className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ${
              available ? "left-7" : "left-1"
            }`}
          >
            {updating && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            )}
          </span>
        </button>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatusItem
          icon={<Radar className="h-4 w-4" />}
          label="Radar"
          value={available ? "Visible" : "Hidden"}
          active={available}
        />

        <StatusItem
          icon={<Signal className="h-4 w-4" />}
          label="Status"
          value={available ? "Ready" : "Paused"}
          active={available}
        />

        <div className="col-span-2 sm:col-span-1">
          <StatusItem
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Privacy"
            value="Protected"
          />
        </div>
      </div>

      <div
        className={`relative mt-3 flex items-start gap-2 rounded-2xl border px-3 py-3 text-xs leading-5 ${
          available
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-800"
            : "border-slate-200 bg-slate-50 text-slate-600"
        }`}
      >
        <Activity
          className={`mt-0.5 h-4 w-4 shrink-0 ${
            available ? "text-emerald-600" : "text-slate-400"
          }`}
        />

        <span>
          {available
            ? "You may receive requests that match your blood type and nearby area."
            : "Turn donor radar on whenever you are ready to receive compatible requests."}
        </span>
      </div>
    </div>
  );
};

type StatusItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
};

const StatusItem = ({
  icon,
  label,
  value,
  active = false,
}: StatusItemProps) => {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white/80 p-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`shrink-0 ${
            active ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {icon}
        </span>

        <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
      </div>

      <p
        className={`mt-1.5 truncate text-xs font-bold sm:text-sm ${
          active ? "text-emerald-700" : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
};
