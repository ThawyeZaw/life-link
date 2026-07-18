"use client";

// ============================================================================
// LifeLink — Organisation Page (/org)
// Overview (name, verified badge, invite code for admins), member list with
// remove (admins), join-by-invite-code and create-organisation flows.
// ============================================================================

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Check,
  Copy,
  KeyRound,
  Loader2,
  LogOut,
  Megaphone,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type {
  Organization,
  OrganizationMember,
  OrgRole,
  OrgType,
} from "@/utils/supabase/types";

const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: "hospital", label: "Hospital" },
  { value: "ngo", label: "NGO" },
  { value: "blood_bank", label: "Blood bank" },
  { value: "community", label: "Community group" },
  { value: "other", label: "Other" },
];

const ORG_TYPE_LABELS: Record<OrgType, string> = {
  hospital: "Hospital",
  ngo: "NGO",
  blood_bank: "Blood bank",
  community: "Community group",
  other: "Organisation",
};

type MemberWithProfile = OrganizationMember & {
  full_name: string;
  blood_type: string | null;
  township: string | null;
};

export default function OrganizationPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [myRole, setMyRole] = useState<OrgRole | null>(null);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Join / create forms
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgType, setNewOrgType] = useState<OrgType>("community");
  const [creating, setCreating] = useState(false);

  const loadOrganization = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        setOrg(null);
        setLoading(false);
        return;
      }

      setMyRole(membership.role as OrgRole);

      const { data: orgRow } = await supabase
        .from("organizations")
        .select(
          "id, name, org_type, township, address, phone, is_verified, owner_id, hospital_id, created_at, updated_at"
        )
        .eq("id", membership.org_id)
        .single();

      if (!orgRow) {
        setOrg(null);
        setLoading(false);
        return;
      }
      setOrg(orgRow as Organization);

      // Members + their profiles (visible to co-members via RLS)
      const { data: memberRows } = await supabase
        .from("organization_members")
        .select("id, org_id, user_id, role, joined_at")
        .eq("org_id", orgRow.id)
        .order("joined_at");

      const memberList = (memberRows || []) as OrganizationMember[];
      const userIds = memberList.map((m) => m.user_id);

      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, full_name, blood_type, township")
        .in("id", userIds);

      const profileMap = new Map(
        (profileRows || []).map((p) => [p.id, p])
      );

      setMembers(
        memberList.map((m) => {
          const p = profileMap.get(m.user_id);
          return {
            ...m,
            full_name: p?.full_name || "Member",
            blood_type: p?.blood_type ?? null,
            township: p?.township ?? null,
          };
        })
      );

      // Invite code — admins only
      if (membership.role === "admin") {
        const { data: code } = await supabase.rpc("get_my_org_invite_code", {
          p_org_id: orgRow.id,
        });
        setInviteCode((code as string) || null);
      }
    } catch (e) {
      console.error("[org] Load failed:", e);
      setError("Could not load your organisation.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrganization();
  }, [loadOrganization]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length < 4) return;
    setJoining(true);
    setError(null);
    const supabase = createClient();
    const { error: joinError } = await supabase.rpc("join_organization_by_code", {
      p_code: joinCode.trim(),
    });
    if (joinError) {
      setError(
        joinError.message.includes("INVALID_CODE")
          ? "That invite code doesn't match any organisation."
          : joinError.message
      );
      setJoining(false);
      return;
    }
    setJoinCode("");
    setJoining(false);
    await loadOrganization();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrgName.trim().length < 2) return;
    setCreating(true);
    setError(null);
    const supabase = createClient();
    const { error: createError } = await supabase.rpc("create_organization", {
      p_name: newOrgName.trim(),
      p_org_type: newOrgType,
    });
    if (createError) {
      setError(createError.message);
      setCreating(false);
      return;
    }
    setCreating(false);
    await loadOrganization();
  };

  const handleRemoveMember = async (memberId: string) => {
    const supabase = createClient();
    const { error: removeError } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId);
    if (removeError) {
      setError(removeError.message);
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleLeave = async () => {
    if (!userId || !org) return;
    const supabase = createClient();
    const { error: leaveError } = await supabase
      .from("organization_members")
      .delete()
      .eq("org_id", org.id)
      .eq("user_id", userId);
    if (leaveError) {
      setError(leaveError.message);
      return;
    }
    setOrg(null);
    setMembers([]);
    setMyRole(null);
  };

  const copyInvite = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F6FB]">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F6FB] pb-16">
      <header className="bg-[#101B35] px-5 pb-16 pt-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Organisation
          </p>
        </div>
      </header>

      <div className="mx-auto -mt-10 max-w-3xl space-y-5 px-5">
        {error && (
          <p className="rounded-2xl bg-red-50 px-5 py-4 text-xs font-semibold text-red-600 shadow">
            {error}
          </p>
        )}

        {!org ? (
          <>
            {/* Join by invite code */}
            <section className="rounded-[1.75rem] bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                  <KeyRound className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#101B35]">
                    Join an organisation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Enter the invite code shared by your organisation admin.
                  </p>
                </div>
              </div>
              <form onSubmit={handleJoin} className="mt-5 flex gap-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 4F7A2B9C"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold tracking-widest text-[#101B35] outline-none transition focus:border-emerald-400"
                  maxLength={12}
                />
                <button
                  type="submit"
                  disabled={joining || joinCode.trim().length < 4}
                  className="flex min-w-24 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
                </button>
              </form>
            </section>

            {/* Create organisation */}
            <section className="rounded-[1.75rem] bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100">
                    <Building2 className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#101B35]">
                      Create an organisation
                    </h2>
                    <p className="text-xs text-slate-500">
                      For hospitals, NGOs, blood banks and communities.
                    </p>
                  </div>
                </div>
                {!showCreate && (
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#101B35] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#18294f]"
                  >
                    <Plus className="h-4 w-4" />
                    New
                  </button>
                )}
              </div>

              {showCreate && (
                <form onSubmit={handleCreate} className="mt-5 space-y-4">
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Organisation name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#101B35] outline-none transition focus:border-red-400"
                  />
                  <select
                    value={newOrgType}
                    onChange={(e) => setNewOrgType(e.target.value as OrgType)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#101B35] outline-none transition focus:border-red-400"
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 text-sm font-bold text-white transition hover:bg-red-400 disabled:opacity-60"
                  >
                    {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create organisation
                  </button>
                </form>
              )}
            </section>
          </>
        ) : (
          <>
            {/* Org overview */}
            <section className="rounded-[1.75rem] bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-red-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)]">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-black text-[#101B35]">{org.name}</h1>
                      {org.is_verified && (
                        <span className="flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-600">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {ORG_TYPE_LABELS[org.org_type]}
                      {org.township ? ` · ${org.township}` : ""}
                    </p>
                  </div>
                </div>

                <Link
                  href="/broadcast"
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-red-400"
                >
                  <Megaphone className="h-4 w-4" />
                  Broadcast request
                </Link>
              </div>

              {!org.is_verified && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <p className="text-[11px] leading-4 text-slate-500">
                    Verified organisations get a matching priority boost. Verification
                    is granted by the LifeLink team.
                  </p>
                </div>
              )}
            </section>

            {/* Invite code — admins only */}
            {myRole === "admin" && (
              <section className="rounded-[1.75rem] bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                    <KeyRound className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#101B35]">Invite code</h2>
                    <p className="text-xs text-slate-500">
                      Share this code so members can join your organisation.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <p className="flex-1 rounded-xl bg-slate-100 px-5 py-3.5 text-center font-mono text-lg font-black tracking-[0.3em] text-[#101B35]">
                    {inviteCode || "········"}
                  </p>
                  <button
                    type="button"
                    onClick={copyInvite}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                    aria-label="Copy invite code"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </section>
            )}

            {/* Members */}
            <section className="rounded-[1.75rem] bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                    <Users className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#101B35]">
                      Members ({members.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      People in your organisation.
                    </p>
                  </div>
                </div>

                {userId !== org.owner_id && (
                  <button
                    type="button"
                    onClick={handleLeave}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Leave
                  </button>
                )}
              </div>

              <ul className="mt-4 divide-y divide-slate-100">
                {members.map((member) => (
                  <li key={member.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#101B35] text-xs font-black text-white">
                        {member.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#101B35]">
                          {member.full_name}
                          {member.user_id === userId && (
                            <span className="ml-2 text-[10px] font-bold text-slate-400">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {member.blood_type ? `${member.blood_type} · ` : ""}
                          {member.township || "Township not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                          member.role === "admin"
                            ? "bg-red-100 text-red-500"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {member.role}
                      </span>
                      {myRole === "admin" &&
                        member.user_id !== userId &&
                        member.user_id !== org.owner_id && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                            aria-label={`Remove ${member.full_name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
