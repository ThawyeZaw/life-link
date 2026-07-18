"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
    const [{ data: rows }, { data: req }] = await Promise.all([
      supabase.rpc("get_request_matches", { p_request_id: requestId }),
      supabase.from("requests").select("status").eq("id", requestId).single(),
    ]);
    setMatches((rows as TrackedMatch[]) ?? []);
    if (req?.status) onStatusChange(req.status);
  }, [requestId, onStatusChange]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000); // live updates while donors respond
    return () => clearInterval(interval);
  }, [load]);

  const act = async (matchId: string, action: "confirm" | "donated") => {
    setBusyId(matchId);
    await fetch("/api/match/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, action }),
    });
    await load();
    setBusyId(null);
  };

  if (matches === null) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-red-500" />
      </div>
    );
  }

  const accepted = matches.filter((m) => ["ACCEPTED", "CONFIRMED", "DONATED"].includes(m.status));
  const waiting = matches.filter((m) => m.status === "INVITED");
  const others = matches.filter((m) => ["DECLINED", "CANCELLED"].includes(m.status));

  return (
    <div className="flex flex-col gap-5">
      {accepted.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Responded — ready to coordinate
          </h3>
          {accepted.map((m) => (
            <MatchCard key={m.id} match={m} busy={busyId === m.id} onAction={act} />
          ))}
        </section>
      )}

      {waiting.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Waiting for reply ({waiting.length})
          </h3>
          {waiting.map((m) => (
            <MatchCard key={m.id} match={m} busy={false} onAction={act} />
          ))}
        </section>
      )}

      {others.length > 0 && (
        <section className="flex flex-col gap-2 opacity-70">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Not available
          </h3>
          {others.map((m) => (
            <MatchCard key={m.id} match={m} busy={false} onAction={act} />
          ))}
        </section>
      )}

      {matches.length === 0 && (
        <p className="py-6 text-center text-base text-slate-500">
          No donors alerted yet — run a radar scan.
        </p>
      )}
    </div>
  );
};
