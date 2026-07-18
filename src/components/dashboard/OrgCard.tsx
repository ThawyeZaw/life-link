"use client";

import { useEffect, useState } from "react";
import { Users, Copy, Check } from "lucide-react";
import type { Organization } from "@/lib/types";

interface Member {
  full_name: string;
  blood_type: string | null;
  township: string | null;
  role: string;
}

export const OrgCard = ({ org }: { org: Organization }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/org/members?orgId=${org.id}`)
      .then((r) => r.json())
      .then((json) => setMembers(json.members ?? []));
  }, [org.id]);

  const copy = async () => {
    await navigator.clipboard.writeText(org.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5">
      <div>
        <p className="text-lg font-bold text-slate-900">{org.name}</p>
        <p className="text-sm capitalize text-slate-500">
          {org.org_type.replace("_", " ")}{org.township ? ` · ${org.township}` : ""}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Invite code
          </p>
          <p className="text-xl font-bold tracking-[0.2em] text-slate-900">{org.invite_code}</p>
        </div>
        <button
          onClick={copy}
          className="flex min-h-11 items-center gap-1.5 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <Users className="h-4 w-4" /> Members ({members.length})
        </p>
        <ul className="flex flex-col divide-y divide-slate-100">
          {members.map((m, i) => (
            <li key={i} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-700">
                  {m.blood_type ?? "—"}
                </span>
                <span className="text-base text-slate-800">{m.full_name}</span>
              </div>
              <span className="text-xs text-slate-400">
                {m.role === "admin" ? "Admin" : m.township ?? "Member"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
