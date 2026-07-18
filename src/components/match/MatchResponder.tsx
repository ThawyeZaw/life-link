"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  HeartHandshake,
  Loader2,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import { InviteSummary, type InviteRequest } from "./InviteSummary";

const input =
  "min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100";

export const MatchResponder = ({ token }: { token: string }) => {
  const [data, setData] = useState<{
    match: {
      status: string;
      distance_km: number | null;
      donor_first_name: string;
    };
    request: InviteRequest;
  } | null>(null);

  const [notFound, setNotFound] = useState(false);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<"ACCEPTED" | "DECLINED" | null>(null);

  useEffect(() => {
    fetch(`/api/match/${token}`)
      .then(async (response) =>
        response.ok ? setData(await response.json()) : setNotFound(true),
      )
      .catch(() => setNotFound(true));
  }, [token]);

  const respond = async (action: "accept" | "decline") => {
    setBusy(true);
    setError("");

    const response = await fetch(`/api/match/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        phone,
        note,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      setError(json.error ?? "Something went wrong");
      setBusy(false);
      return;
    }

    setResult(json.status);
    setBusy(false);
  };

  if (notFound) {
    return (
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white px-5 py-14 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-red-100 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-slate-200 bg-slate-50 text-slate-400">
          <XCircle className="h-8 w-8" />
        </div>

        <h1 className="relative mt-5 text-xl font-black tracking-[-0.025em] text-slate-950">
          Invitation unavailable
        </h1>

        <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          This invitation link is invalid, has expired, or is no longer
          available.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.09)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>

          <div>
            <p className="text-sm font-black text-slate-950">
              Checking your invitation
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Loading the emergency request details
            </p>
          </div>
        </div>
      </div>
    );
  }

  const finalStatus =
    result ?? (data.match.status !== "INVITED" ? data.match.status : null);

  if (finalStatus) {
    const accepted = ["ACCEPTED", "CONFIRMED", "DONATED"].includes(finalStatus);

    return (
      <div className="space-y-5">
        <section
          className={`relative overflow-hidden rounded-[32px] border p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 ${
            accepted
              ? "border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5_0%,#ffffff_62%,#f8fafc_100%)]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div
            className={`pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full blur-3xl ${
              accepted ? "bg-emerald-200/60" : "bg-slate-100"
            }`}
          />

          <div
            className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] shadow-lg ${
              accepted
                ? "bg-emerald-500 text-white shadow-emerald-200"
                : "border border-slate-200 bg-slate-50 text-slate-400 shadow-slate-100"
            }`}
          >
            {accepted ? (
              <CheckCircle2 className="h-10 w-10" />
            ) : (
              <XCircle className="h-10 w-10" />
            )}
          </div>

          {accepted && (
            <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Response confirmed
            </span>
          )}

          <h2 className="relative mx-auto mt-4 max-w-xl text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
            {accepted
              ? "Thank you — you may save a life today"
              : "Your response has been recorded"}
          </h2>

          <p className="relative mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
            {accepted
              ? "Your contact details were shared with the requester. They or the hospital will contact you to arrange the donation."
              : "No problem. Thank you for being part of the donor network. You may be alerted again when someone nearby needs your help."}
          </p>

          {accepted && (
            <div className="relative mx-auto mt-6 flex max-w-md items-start gap-3 rounded-2xl border border-emerald-200 bg-white/80 p-4 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Phone className="h-4 w-4" />
              </span>

              <div>
                <p className="text-sm font-black text-slate-900">
                  Keep your phone nearby
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  The requester or hospital may call you with the next steps.
                </p>
              </div>
            </div>
          )}
        </section>

        {accepted && (
          <InviteSummary
            request={data.request}
            distanceKm={data.match.distance_km}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[32px] border border-red-200 bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_62%,#f8fafc_100%)] px-5 py-7 text-center shadow-[0_24px_70px_rgba(239,68,68,0.10)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-red-200/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-600 text-white shadow-[0_14px_32px_rgba(220,38,38,0.28)]">
          <HeartHandshake className="h-8 w-8" />
        </div>

        <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-red-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          Blood match found
        </span>

        <h1 className="relative mt-4 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
          Hi {data.match.donor_first_name}, you&apos;re a match
        </h1>

        <p className="relative mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
          Someone near you needs your blood type. Review the request below and
          let them know whether you can help.
        </p>
      </section>

      <InviteSummary
        request={data.request}
        distanceKm={data.match.distance_km}
      />

      <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-red-50 blur-3xl" />

        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
            <Phone className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Contact information
            </p>

            <h2 className="mt-1 text-lg font-black tracking-[-0.025em] text-slate-950">
              How can the requester reach you?
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Your details are only shared after you accept.
            </p>
          </div>
        </div>

        <div className="relative mt-5 space-y-3">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.11em] text-slate-500">
              Phone number
            </span>

            <input
              className={input}
              type="tel"
              placeholder="09 xxx xxx xxx"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.11em] text-slate-500">
              Availability note
              <span className="ml-1 font-medium normal-case tracking-normal text-slate-400">
                optional
              </span>
            </span>

            <textarea
              className={`${input} min-h-24 resize-y py-3`}
              placeholder="For example: I can arrive after 4 PM."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs leading-5 text-emerald-800">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Your phone number is never public. It is shared only with this
              requester after you accept.
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            >
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => respond("accept")}
            disabled={busy || phone.trim().length < 6}
            className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-base font-black text-white shadow-[0_14px_32px_rgba(220,38,38,0.26)] transition hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <HeartHandshake className="h-5 w-5 transition group-hover:scale-110" />
            )}

            {busy ? "Sending response..." : "Accept — I’ll donate"}
          </button>

          <button
            type="button"
            onClick={() => respond("decline")}
            disabled={busy}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            I can&apos;t donate this time
          </button>

          <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] font-medium text-slate-400">
            <LockKeyhole className="h-3.5 w-3.5" />
            Secure donor response
          </p>
        </div>
      </section>
    </div>
  );
};
