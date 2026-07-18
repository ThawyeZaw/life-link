"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Loader2,
  Radar,
  RefreshCw,
  UserRoundX,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { MatchCard, type TrackedMatch } from "./MatchCard";

export const MatchTracker = ({
  requestId,
  onStatusChange,
}: {
  requestId: string;
  onStatusChange: (status: string) => void;
}) => {
  const [matches, setMatches] = useState<TrackedMatch[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();

    const [{ data: rows }, { data: request }] = await Promise.all([
      supabase.rpc("get_request_matches", {
        p_request_id: requestId,
      }),
      supabase.from("requests").select("status").eq("id", requestId).single(),
    ]);

    setMatches((rows as TrackedMatch[]) ?? []);

    if (request?.status) {
      onStatusChange(request.status);
    }
  }, [requestId, onStatusChange]);

  useEffect(() => {
    load();

    const interval = setInterval(load, 4000);

    return () => clearInterval(interval);
  }, [load]);

  const act = async (matchId: string, action: "confirm" | "donated") => {
    setBusyId(matchId);

    try {
      await fetch("/api/match/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          action,
        }),
      });

      await load();
    } finally {
      setBusyId(null);
    }
  };

  const accepted = useMemo(
    () =>
      matches?.filter((match) =>
        ["ACCEPTED", "CONFIRMED", "DONATED"].includes(match.status),
      ) ?? [],
    [matches],
  );

  const waiting = useMemo(
    () => matches?.filter((match) => match.status === "INVITED") ?? [],
    [matches],
  );

  const others = useMemo(
    () =>
      matches?.filter((match) =>
        ["DECLINED", "CANCELLED"].includes(match.status),
      ) ?? [],
    [matches],
  );

  if (matches === null) {
    return (
      <section className="relative min-h-[320px] overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-red-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative flex min-h-[320px] items-center justify-center px-6">
          <div className="flex max-w-sm items-center gap-4 rounded-[22px] border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_18px_48px_rgba(15,23,42,0.09)] backdrop-blur-xl">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-950">
                Tracking donor responses
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Checking invitations and live donation updates.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.07)] sm:p-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-red-100/70 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.20)]">
              <Radar className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Live donor tracker
                </p>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>

              <h2 className="mt-1 text-lg font-black tracking-[-0.025em] text-slate-950">
                Donor responses
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Updates automatically while donors accept or decline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex">
            <TrackerStat
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              value={accepted.length}
              label="Ready"
              tone="success"
            />

            <TrackerStat
              icon={<Clock3 className="h-3.5 w-3.5" />}
              value={waiting.length}
              label="Waiting"
            />

            <TrackerStat
              icon={<Users className="h-3.5 w-3.5" />}
              value={matches.length}
              label="Total"
            />
          </div>
        </div>
      </div>

      {accepted.length > 0 && (
        <TrackerSection
          icon={<Activity className="h-4 w-4" />}
          title="Ready to coordinate"
          description="These donors have responded and may be available."
          count={accepted.length}
          tone="success"
        >
          {accepted.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              busy={busyId === match.id}
              onAction={act}
            />
          ))}
        </TrackerSection>
      )}

      {waiting.length > 0 && (
        <TrackerSection
          icon={<Clock3 className="h-4 w-4" />}
          title="Waiting for reply"
          description="Invitations have been sent and responses are pending."
          count={waiting.length}
        >
          {waiting.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              busy={false}
              onAction={act}
            />
          ))}
        </TrackerSection>
      )}

      {others.length > 0 && (
        <TrackerSection
          icon={<UserRoundX className="h-4 w-4" />}
          title="Not available"
          description="These donors declined or are no longer active for this request."
          count={others.length}
          muted
        >
          {others.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              busy={false}
              onAction={act}
            />
          ))}
        </TrackerSection>
      )}

      {matches.length === 0 && (
        <div className="relative overflow-hidden rounded-[30px] border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-100/70 blur-3xl" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-slate-200 bg-white text-red-600 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
            <Radar className="h-7 w-7" />
          </div>

          <h3 className="relative mt-5 text-lg font-black tracking-[-0.025em] text-slate-950">
            No donors alerted yet
          </h3>

          <p className="relative mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Run a radar scan to find eligible donors near the hospital and send
            emergency invitations.
          </p>

          <div className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 shadow-sm">
            <RefreshCw className="h-3.5 w-3.5" />
            Live updates every 4 seconds
          </div>
        </div>
      )}
    </section>
  );
};

const TrackerStat = ({
  icon,
  value,
  label,
  tone = "default",
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone?: "default" | "success";
}) => {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2.5 ${
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      <span
        className={tone === "success" ? "text-emerald-600" : "text-slate-400"}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-sm font-black leading-none">{value}</p>
        <p className="mt-1 truncate text-[9px] font-black uppercase tracking-[0.1em] opacity-70">
          {label}
        </p>
      </div>
    </div>
  );
};

const TrackerSection = ({
  icon,
  title,
  description,
  count,
  tone = "default",
  muted = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  tone?: "default" | "success";
  muted?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <section className={muted ? "opacity-70" : ""}>
      <div className="mb-3 flex items-start justify-between gap-3 px-1">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              tone === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {icon}
          </span>

          <div className="min-w-0">
            <h3
              className={`text-sm font-black uppercase tracking-[0.1em] ${
                tone === "success" ? "text-emerald-700" : "text-slate-600"
              }`}
            >
              {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <span
          className={`flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-[10px] font-black ${
            tone === "success"
              ? "bg-emerald-600 text-white"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {count}
        </span>
      </div>

      <div className="space-y-3">{children}</div>
    </section>
  );
};
