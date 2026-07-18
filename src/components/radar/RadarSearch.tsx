"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import type { DonorCandidate } from "@/lib/types";
import { RadarView } from "./RadarView";
import { DonorList } from "./DonorList";

const RADII = [5, 10, 15, 25, 50];

export const RadarSearch = ({
  requestId,
  onInvited,
}: {
  requestId: string;
  onInvited: () => void;
}) => {
  const [radius, setRadius] = useState(10);
  const [scanning, setScanning] = useState(true);
  const [donors, setDonors] = useState<DonorCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const scan = useCallback(async (r: number) => {
    setScanning(true);
    setError("");
    const started = Date.now();
    try {
      const res = await fetch("/api/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, radiusKm: r }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      // let the sweep animation play at least 1.6s — feels like a real scan
      await new Promise((ok) => setTimeout(ok, Math.max(0, 1600 - (Date.now() - started))));
      const found: DonorCandidate[] = json.donors;
      setDonors(found);
      setSelected(new Set(found.filter((d) => !d.already_invited).map((d) => d.donor_id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }, [requestId]);

  useEffect(() => {
    scan(radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sendInvites = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, donorIds: [...selected] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not send alerts");
      onInvited();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send alerts");
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {RADII.map((r) => (
          <button
            key={r}
            onClick={() => { setRadius(r); scan(r); }}
            disabled={scanning}
            className={`min-h-11 rounded-full px-4 text-sm font-semibold transition-colors ${
              radius === r ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {r} km
          </button>
        ))}
      </div>

      <RadarView donors={donors} radiusKm={radius} scanning={scanning} selected={selected} onToggle={toggle} />

      {scanning ? (
        <p className="text-center text-base text-slate-500">Scanning for compatible donors…</p>
      ) : donors.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-base text-slate-500">No compatible donors in {radius} km.</p>
          <button onClick={() => scan(radius)}
            className="flex min-h-11 items-center gap-2 rounded-full bg-slate-100 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            <RefreshCw className="h-4 w-4" /> Rescan or widen the radius
          </button>
        </div>
      ) : (
        <>
          <DonorList donors={donors} selected={selected} onToggle={toggle} />
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <button
            onClick={sendInvites}
            disabled={sending || selected.size === 0}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 text-base font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Email {selected.size} donor{selected.size === 1 ? "" : "s"}
          </button>
        </>
      )}
    </div>
  );
};
