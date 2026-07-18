"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Mail,
  Radar,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";

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
  const [emailResult, setEmailResult] = useState<{
    total: number;
    sent: number;
    failed: number;
  } | null>(null);

  const scan = useCallback(
    async (radiusKm: number) => {
      setScanning(true);
      setError("");

      const started = Date.now();

      try {
        const response = await fetch("/api/radar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            radiusKm,
          }),
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error);
        }

        await new Promise((resolve) =>
          setTimeout(resolve, Math.max(0, 1600 - (Date.now() - started))),
        );

        const found: DonorCandidate[] = json.donors;

        setDonors(found);
        setSelected(
          new Set(
            found
              .filter((donor) => !donor.already_invited)
              .map((donor) => donor.donor_id),
          ),
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : "Scan failed",
        );
      } finally {
        setScanning(false);
      }
    },
    [requestId],
  );

  useEffect(() => {
    scan(radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id: string) => {
    setSelected((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };
  const sendInvites = async () => {
    if (selected.size === 0 || sending) return;

    setSending(true);
    setError("");
    setEmailResult(null);

    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          donorIds: [...selected],
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Could not send alerts");
      }

      const total = Number(json.invited ?? selected.size);
      const sent = Number(json.emailed ?? total);
      const failed = Number(json.failures?.length ?? Math.max(0, total - sent));

      setEmailResult({
        total,
        sent,
        failed,
      });

      onInvited();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not send alerts",
      );
    } finally {
      setSending(false);
    }
  };

  const availableDonors = useMemo(
    () => donors.filter((donor) => !donor.already_invited),
    [donors],
  );

  const alertedDonors = donors.length - availableDonors.length;

  return (
    <section className="space-y-5">
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_22px_65px_rgba(15,23,42,0.07)] sm:p-5">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-red-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.20)]">
                <Radar className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Donor radar
                  </p>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-red-700">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                    </span>
                    Live scan
                  </span>
                </div>

                <h2 className="mt-1 text-lg font-black tracking-[-0.025em] text-slate-950">
                  Find compatible donors nearby
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Choose a radius, scan the network, and alert selected donors.
                </p>
              </div>
            </div>

            {!scanning && donors.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:flex">
                <RadarStat
                  icon={<Users className="h-3.5 w-3.5" />}
                  value={donors.length}
                  label="Found"
                />
                <RadarStat
                  icon={<Send className="h-3.5 w-3.5" />}
                  value={selected.size}
                  label="Selected"
                  active
                />
                <RadarStat
                  icon={<Mail className="h-3.5 w-3.5" />}
                  value={alertedDonors}
                  label="Alerted"
                />
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
              Search radius
            </p>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {RADII.map((radiusOption) => {
                const active = radius === radiusOption;

                return (
                  <button
                    key={radiusOption}
                    type="button"
                    onClick={() => {
                      setRadius(radiusOption);
                      scan(radiusOption);
                    }}
                    disabled={scanning}
                    aria-pressed={active}
                    className={`min-h-11 shrink-0 rounded-2xl border px-4 text-sm font-black transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                      active
                        ? "border-red-600 bg-red-600 text-white shadow-[0_10px_24px_rgba(220,38,38,0.22)]"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    }`}
                  >
                    {radiusOption} km
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <RadarView
        donors={donors}
        radiusKm={radius}
        scanning={scanning}
        selected={selected}
        onToggle={toggle}
      />

      {scanning ? (
        <div className="flex items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>

          <div>
            <p className="text-sm font-black text-slate-950">
              Scanning the donor network
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Searching within {radius} km of the hospital
            </p>
          </div>
        </div>
      ) : donors.length === 0 ? (
        <div className="relative overflow-hidden rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-5 py-11 text-center">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-100/70 blur-3xl" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-slate-200 bg-white text-red-600 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
            <Radar className="h-7 w-7" />
          </div>

          <h3 className="relative mt-5 text-lg font-black tracking-[-0.025em] text-slate-950">
            No compatible donors found
          </h3>

          <p className="relative mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            There are currently no eligible donors within {radius} km. Try
            scanning again or choose a wider radius.
          </p>

          <button
            type="button"
            onClick={() => scan(radius)}
            className="relative mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Rescan network
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <DonorList donors={donors} selected={selected} onToggle={toggle} />
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
          {emailResult && (
            <div className="rounded-xl px-4 py-3 text-sm text-amber-800 bg-amber-50">
              {emailResult.sent > 0
                ? `${emailResult.sent} of ${emailResult.total} donor(s) notified. `
                : `No emails were sent. `}
              {emailResult.failed > 0 && (
                <span>
                  {emailResult.failed} email(s) failed. Check the server logs or
                  verify your Resend domain setup.
                </span>
              )}
            </div>
          )}
          <button
            onClick={sendInvites}
            disabled={sending || selected.size === 0}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 text-base font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Email {selected.size} donor{selected.size === 1 ? "" : "s"}
          </button>
        </div>
      )}

      {error && donors.length === 0 && !scanning && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
};

const RadarStat = ({
  icon,
  value,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  active?: boolean;
}) => {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2.5 ${
        active
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      <span className={active ? "text-red-600" : "text-slate-400"}>{icon}</span>

      <div className="min-w-0">
        <p className="text-sm font-black leading-none">{value}</p>
        <p className="mt-1 truncate text-[9px] font-black uppercase tracking-[0.1em] opacity-70">
          {label}
        </p>
      </div>
    </div>
  );
};
