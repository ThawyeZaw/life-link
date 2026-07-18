"use client";

import { useEffect, useState } from "react";
import { Loader2, HeartHandshake, CheckCircle2, XCircle } from "lucide-react";
import { InviteSummary, type InviteRequest } from "./InviteSummary";

const input =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base placeholder:text-slate-400 focus:border-red-500 focus:outline-none";

export const MatchResponder = ({ token }: { token: string }) => {
  const [data, setData] = useState<{
    match: { status: string; distance_km: number | null; donor_first_name: string };
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
      .then(async (r) => (r.ok ? setData(await r.json()) : setNotFound(true)))
      .catch(() => setNotFound(true));
  }, [token]);

  const respond = async (action: "accept" | "decline") => {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/match/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, phone, note }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      setBusy(false);
      return;
    }
    setResult(json.status);
    setBusy(false);
  };

  if (notFound)
    return <p className="py-16 text-center text-base text-slate-500">This invitation link is invalid or has expired.</p>;
  if (!data)
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-red-500" /></div>;

  const finalStatus = result ?? (data.match.status !== "INVITED" ? data.match.status : null);

  if (finalStatus) {
    const accepted = ["ACCEPTED", "CONFIRMED", "DONATED"].includes(finalStatus);
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        {accepted ? (
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        ) : (
          <XCircle className="h-14 w-14 text-slate-400" />
        )}
        <h2 className="text-xl font-bold text-slate-900">
          {accepted ? "Thank you — you may save a life today" : "Response recorded"}
        </h2>
        <p className="max-w-sm text-base text-slate-500">
          {accepted
            ? "Your contact details were shared with the requester. They or the hospital will call you to arrange the donation."
            : "No problem — thank you for being a registered donor. You'll be alerted when someone needs you again."}
        </p>
        {accepted && <InviteSummary request={data.request} distanceKm={data.match.distance_km} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Hi {data.match.donor_first_name}, you&apos;re a match
        </h1>
        <p className="mt-1 text-base text-slate-500">
          Someone near you needs your blood type. Will you help?
        </p>
      </div>

      <InviteSummary request={data.request} distanceKm={data.match.distance_km} />

      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-700">
          Share your contact so the requester can reach you
        </p>
        <input className={input} type="tel" placeholder="Phone number *"
          value={phone} onChange={(e) => setPhone(e.target.value)} />
        <textarea className={`${input} min-h-20 py-2.5`} placeholder="When are you available? (optional)"
          value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="text-xs text-slate-500">
          Only shared with this requester after you accept. Never public.
        </p>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <button onClick={() => respond("accept")} disabled={busy || phone.trim().length < 6}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 text-base font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <HeartHandshake className="h-4 w-4" />}
          Accept — I&apos;ll donate
        </button>
        <button onClick={() => respond("decline")} disabled={busy}
          className="flex min-h-11 items-center justify-center rounded-full text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50">
          I can&apos;t donate this time
        </button>
      </div>
    </div>
  );
};
