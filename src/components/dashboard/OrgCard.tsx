"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Check,
  Copy,
  Crown,
  MapPin,
  Radio,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import type { Organization } from "@/lib/types";

interface Member {
  full_name: string;
  blood_type: string | null;
  township: string | null;
  role: string;
}

export const OrgCard = ({ org }: { org: Organization }) => {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch(`/api/org/members?orgId=${org.id}`)
      .then((response) => response.json())
      .then((json) => {
        if (mounted) {
          setMembers(json.members ?? []);
        }
      })
      .catch(() => {
        if (mounted) {
          setMembers([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [org.id]);

  const copy = async () => {
    await navigator.clipboard.writeText(org.invite_code);

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const memberCount = members?.length ?? 0;
  const adminCount =
    members?.filter((member) => member.role === "admin").length ?? 0;

  return (
    <section className="relative min-w-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)] sm:rounded-[30px]">
      {/* Background details */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-red-100/70 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute right-5 top-5 h-24 w-24 rounded-full border border-red-200/50" />
        <div className="absolute right-9 top-9 h-16 w-16 rounded-full border border-red-200/50" />

        <div className="absolute right-[3.65rem] top-[3.6rem] h-3 w-3 rounded-full bg-red-500 shadow-[0_0_24px_rgba(239,68,68,0.75)]">
          <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-70" />
        </div>
      </div>

      {/* Organization header */}
      <div className="relative border-b border-slate-100 p-4 sm:p-6">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] sm:h-14 sm:w-14">
            <Building2 className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-500 sm:text-xs">
                Organization network
              </p>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            </div>

            <h2 className="mt-2 break-words text-xl font-black tracking-[-0.03em] text-slate-950 sm:text-2xl">
              {org.name}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 sm:text-sm">
              <span className="inline-flex items-center gap-1.5 capitalize">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {org.org_type.replaceAll("_", " ")}
              </span>

              {org.township && (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="break-words">{org.township}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <SummaryItem
            icon={<Users className="h-4 w-4" />}
            label="Members"
            value={members === null ? "—" : memberCount.toString()}
            active
          />

          <SummaryItem
            icon={<Crown className="h-4 w-4" />}
            label="Admins"
            value={members === null ? "—" : adminCount.toString()}
          />

          <div className="col-span-2 sm:col-span-1">
            <SummaryItem
              icon={<Radio className="h-4 w-4" />}
              label="Network"
              value="Active"
            />
          </div>
        </div>
      </div>

      <div className="relative space-y-5 p-4 sm:p-6">
        {/* Invite code */}
        <div className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_100%)] p-4 sm:rounded-[24px] sm:p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-100/60 blur-3xl" />

          <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-xs">
                  Invite code
                </p>

                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                  Private
                </span>
              </div>

              <p className="mt-2 break-all font-mono text-xl font-black tracking-[0.16em] text-slate-950 sm:text-2xl sm:tracking-[0.22em]">
                {org.invite_code}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Share this code with trusted donors to join your organization.
              </p>
            </div>

            <button
              type="button"
              onClick={copy}
              className={`inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] sm:w-auto ${
                copied ? "bg-emerald-500" : "bg-slate-950 hover:bg-red-600"
              }`}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}

              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="min-w-0">
          <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Users className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-black text-slate-950 sm:text-base">
                  Members
                </h3>

                <p className="text-xs text-slate-500">
                  {members === null
                    ? "Loading organization network"
                    : `${memberCount} connected ${
                        memberCount === 1 ? "member" : "members"
                      }`}
                </p>
              </div>
            </div>

            {members !== null && members.length > 0 && (
              <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                {memberCount}
              </span>
            )}
          </div>

          {members === null ? (
            <MembersLoadingState />
          ) : members.length === 0 ? (
            <EmptyMembersState />
          ) : (
            <ul className="min-w-0 space-y-2">
              {members.map((member, index) => {
                const isAdmin = member.role === "admin";

                return (
                  <li
                    key={`${member.full_name}-${index}`}
                    className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-red-200 hover:bg-red-50/20 sm:p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black ${
                          member.blood_type
                            ? "bg-red-500 text-white shadow-[0_8px_20px_rgba(239,68,68,0.18)]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {member.blood_type ?? "—"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                          <p className="break-words text-sm font-bold leading-5 text-slate-900 sm:text-base">
                            {member.full_name}
                          </p>

                          {isAdmin && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-700">
                              <Crown className="h-3 w-3" />
                              Admin
                            </span>
                          )}
                        </div>

                        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                          {member.township ? (
                            <>
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">
                                {member.township}
                              </span>
                            </>
                          ) : (
                            <>
                              <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span>Organization member</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        isAdmin
                          ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]"
                          : "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)]"
                      }`}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

const MembersLoadingState = () => {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
        >
          <div className="h-10 w-10 shrink-0 rounded-2xl bg-slate-200" />

          <div className="min-w-0 flex-1">
            <div className="h-3.5 w-2/5 rounded-full bg-slate-200" />
            <div className="mt-2 h-3 w-1/4 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyMembersState = () => {
  return (
    <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center sm:rounded-[24px]">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <Users className="h-5 w-5" />
      </div>

      <h4 className="mt-3 text-sm font-black text-slate-900">No members yet</h4>

      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
        Share the invite code above with trusted donors to grow your network.
      </p>
    </div>
  );
};

type SummaryItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
};

const SummaryItem = ({
  icon,
  label,
  value,
  active = false,
}: SummaryItemProps) => {
  return (
    <div className="min-w-0 rounded-2xl border border-white bg-white/80 p-3 shadow-sm backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`shrink-0 ${active ? "text-red-500" : "text-slate-400"}`}
        >
          {icon}
        </span>

        <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
      </div>

      <p
        className={`mt-1.5 truncate text-sm font-black ${
          active ? "text-red-600" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
};
