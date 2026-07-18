"use client";

import { useEffect, useState } from "react";
import { Users, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Organization } from "@/lib/types";

export const OrgSection = () => {
  const [org, setOrg] = useState<Organization | null | undefined>(undefined);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data } = await createClient()
      .from("organizations")
      .select("*")
      .limit(1)
      .maybeSingle();
    setOrg((data as Organization) ?? null);
  };

  useEffect(() => {
    load();
  }, []);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/org/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: code }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(json.error ?? "Could not join");
      return;
    }
    setMessage(`Joined ${json.orgName}!`);
    load();
  };

  if (org === undefined) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <Users className="h-4 w-4" /> Organization
      </h2>
      {org ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-base font-semibold text-slate-900">{org.name}</p>
          <p className="text-sm text-slate-500 capitalize">
            {org.org_type.replace("_", " ")}{org.township ? ` · ${org.township}` : ""}
          </p>
        </div>
      ) : (
        <form onSubmit={join} className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-300 p-4">
          <p className="text-sm text-slate-500">
            Part of a donor group? Enter its invite code.
          </p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. YANGON01"
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-red-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || code.trim().length < 4}
              className="flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
            </button>
          </div>
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </form>
      )}
    </section>
  );
};
