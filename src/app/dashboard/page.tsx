import Link from "next/link";
import {
  Building2,
  HeartPulse,
  Plus,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AvailabilityCard } from "@/components/dashboard/AvailabilityCard";
import { InvitationsList } from "@/components/dashboard/InvitationsList";
import { MyRequests } from "@/components/dashboard/MyRequests";
import { OrgSection } from "@/components/dashboard/OrgSection";
import { OrgCard } from "@/components/dashboard/OrgCard";
import type { Organization, Profile } from "@/lib/types";

const DashboardPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .limit(1)
    .maybeSingle<Organization>();

  if (!profile) return null;

  const isOrg = profile.account_type === "organization";
  const firstName = profile.full_name.split(" ")[0];

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <div className="mx-auto w-full max-w-6xl px-3 py-4 pb-24 sm:px-6 sm:py-8 sm:pb-8 lg:px-8">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-red-100/80 blur-3xl" />
            <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-blue-100/50 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl ${
                  isOrg
                    ? "bg-slate-950 text-white"
                    : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                }`}
              >
                {isOrg ? (
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <UserRound className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-500 sm:text-xs sm:tracking-[0.18em]">
                    {isOrg ? "Organization dashboard" : "Donor dashboard"}
                  </p>

                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    Protected
                  </span>
                </div>

                <h1 className="mt-2 break-words text-xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
                  {isOrg
                    ? (org?.name ?? profile.full_name)
                    : `Hi, ${firstName}`}
                </h1>

                <p className="mt-1 text-sm leading-5 text-slate-600 sm:mt-2 sm:text-base sm:leading-6">
                  {isOrg
                    ? "Manage donors and coordinate urgent requests."
                    : "Manage your availability, requests, and donor activity."}
                </p>
              </div>
            </div>

            <Link
              href="/requests/new"
              className="hidden min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-red-500 px-5 text-sm font-bold text-white shadow-[0_14px_35px_rgba(239,68,68,0.24)] transition hover:-translate-y-0.5 hover:bg-red-600 sm:inline-flex"
            >
              <Plus className="h-5 w-5" />
              Request blood
            </Link>
          </div>
        </section>

        <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <section className="min-w-0 space-y-5">
            {isOrg && org ? (
              <>
                <div className="min-w-0">
                  <SectionHeading
                    eyebrow="Organization"
                    title="Community overview"
                    description="Your organization details and current emergency activity."
                  />

                  <div className="mt-4 min-w-0 overflow-hidden">
                    <OrgCard org={org} />
                  </div>
                </div>

                <div className="min-w-0">
                  <SectionHeading
                    eyebrow="Requests"
                    title="Organization requests"
                    description="Review and manage requests created by your organization."
                  />

                  <div className="mt-4 min-w-0 overflow-hidden">
                    <MyRequests orgId={org.id} title="Organization requests" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="min-w-0">
                  <SectionHeading
                    eyebrow="Availability"
                    title="Your donor status"
                    description="Keep your availability updated so LifeLink can match you accurately."
                  />

                  <div className="mt-4 min-w-0 overflow-hidden">
                    <AvailabilityCard profile={profile} />
                  </div>
                </div>

                <div className="min-w-0">
                  <SectionHeading
                    eyebrow="Requests"
                    title="Your blood requests"
                    description="Track your requests and their latest status."
                  />

                  <div className="mt-4 min-w-0 overflow-hidden">
                    <MyRequests />
                  </div>
                </div>
              </>
            )}
          </section>

          <aside className="min-w-0 space-y-5 lg:sticky lg:top-6">
            {isOrg && org ? (
              <div className="min-w-0 overflow-hidden rounded-[24px] bg-[#07111f] p-5 text-white shadow-[0_22px_70px_rgba(15,23,42,0.16)] sm:rounded-[26px] sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500">
                  <Sparkles className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-xl font-black tracking-tight">
                  Coordinate faster
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Keep your organization active, respond to urgent requests, and
                  help eligible donors take action quickly.
                </p>

                <Link
                  href="/requests/new"
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                  Create request
                </Link>
              </div>
            ) : (
              <>
                <div className="min-w-0">
                  <SectionHeading
                    eyebrow="Invitations"
                    title="Organization invites"
                    description="Review invitations from donor communities."
                    compact
                  />

                  <div className="mt-4 min-w-0 overflow-hidden">
                    <InvitationsList />
                  </div>
                </div>

                <div className="min-w-0">
                  <SectionHeading
                    eyebrow="Community"
                    title="Your organization"
                    description="Join or manage a trusted donor network."
                    compact
                  />

                  <div className="mt-4 min-w-0 overflow-hidden">
                    <OrgSection />
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      <Link
        href="/requests/new"
        className="fixed bottom-4 right-4 z-30 flex h-14 max-w-[calc(100vw-2rem)] items-center justify-center gap-2 rounded-full bg-red-500 px-5 text-sm font-bold text-white shadow-[0_18px_45px_rgba(239,68,68,0.35)] transition active:scale-[0.98] sm:hidden"
      >
        <HeartPulse className="h-5 w-5 shrink-0" />
        Request blood
      </Link>
    </main>
  );
};

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
};

const SectionHeading = ({
  eyebrow,
  title,
  description,
  compact = false,
}: SectionHeadingProps) => {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-500 sm:text-xs sm:tracking-[0.18em]">
        {eyebrow}
      </p>

      <h2
        className={`mt-1.5 break-words font-black tracking-[-0.03em] text-slate-950 ${
          compact ? "text-lg sm:text-xl" : "text-xl sm:text-3xl"
        }`}
      >
        {title}
      </h2>

      <p className="mt-1.5 text-sm leading-5 text-slate-500 sm:leading-6">
        {description}
      </p>
    </div>
  );
};

export default DashboardPage;
