"use client";

// src/app/passport/page.tsx
// LifeLink — Modern Donor Passport
// Team Vertex Red

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BellRing,
  Check,
  CheckCircle2,
  Clock3,
  Droplets,
  Heart,
  HeartPulse,
  MapPin,
  Navigation,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRoundCheck,
  Wifi,
  Zap,
} from "lucide-react";

import { DonorTopBar } from "@/components/layout/DonorTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { DonorPassportCard } from "@/components/passport/DonorPassportCard";
import { EligibilitySection } from "@/components/passport/EligibilitySection";
import { ActiveDispatchCard } from "@/components/passport/ActiveDispatchCard";
import { DonationHistorySection } from "@/components/passport/DonationHistorySection";

import {
  getMyMatches,
  getMyProfile,
  type Profile,
  type RequestWithDetails,
} from "@/utils/supabase";

import {
  MOCK_ACTIVE_DISPATCH,
  MOCK_DONATION_HISTORY,
  MOCK_PROFILE,
} from "@/components/data/mockData";

type PageMode = "loading" | "live" | "demo";

export default function PassportPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dispatch, setDispatch] = useState<RequestWithDetails | null>(null);
  const [donationCount, setDonationCount] = useState(14);
  const [pageMode, setPageMode] = useState<PageMode>("loading");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  const loadPassport = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setPageMode("loading");
    }

    try {
      const [prof, matches] = await Promise.all([
        getMyProfile(),
        getMyMatches(),
      ]);

      setProfile(prof);

      const completedMatches = matches.filter(
        (match) => match.status === "COMPLETED",
      );

      setDonationCount(completedMatches.length);

      const urgentMatch = matches.find(
        (match) =>
          ["CRITICAL", "URGENT"].includes(match.request.urgency) &&
          match.status === "PENDING",
      );

      if (urgentMatch) {
        setDispatch({
          id: urgentMatch.request.id,
          requester_id: "",
          hospital_id: null,
          request_type: "BLOOD",
          blood_type: urgentMatch.request.blood_type ?? null,
          supply_details: null,
          units_needed: urgentMatch.request.units_needed,
          urgency: urgentMatch.request.urgency,
          status: urgentMatch.request.status,
          township: urgentMatch.request.township ?? null,
          lat: null,
          lng: null,
          expires_at: "",
          created_at: urgentMatch.created_at,
          updated_at: urgentMatch.updated_at,
          requester: {
            id: "",
            full_name: "Emergency patient",
            phone: null,
            blood_type: urgentMatch.request.blood_type ?? null,
          },
          hospital: null,
        });
      } else {
        setDispatch(null);
      }

      setPageMode("live");
    } catch (error) {
      console.error("Unable to load LifeLink donor passport:", error);

      setProfile(MOCK_PROFILE);
      setDispatch(MOCK_ACTIVE_DISPATCH);
      setDonationCount(14);
      setPageMode("demo");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPassport();
  }, [loadPassport]);

  const displayProfile = profile ?? MOCK_PROFILE;

  const livesImpacted = useMemo(
    () => Math.max(donationCount * 3, 12),
    [donationCount],
  );

  const impactStats = useMemo(
    () => [
      {
        label: "Donations",
        value: donationCount,
        icon: Droplets,
        styles: "bg-red-50 text-red-500",
      },
      {
        label: "Lives impacted",
        value: livesImpacted,
        icon: HeartPulse,
        styles: "bg-pink-50 text-pink-500",
      },
      {
        label: "Donor level",
        value: "Hero",
        icon: Trophy,
        styles: "bg-amber-50 text-amber-500",
      },
    ],
    [donationCount, livesImpacted],
  );

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-28 text-[#111827]">
      <DonorTopBar title="Donor Passport" />

      {pageMode === "loading" ? (
        <PassportLoadingState />
      ) : (
        <main>
          {/* Hero passport area */}
          <section className="relative overflow-hidden bg-[#0D1933]">
            <div
              aria-hidden="true"
              className="absolute inset-0 overflow-hidden"
            >
              <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-red-500/25 blur-[90px]" />
              <div className="absolute -right-28 top-24 h-80 w-80 rounded-full bg-emerald-400/15 blur-[100px]" />
              <div className="absolute bottom-0 left-1/3 h-56 w-96 rounded-full bg-blue-500/10 blur-[90px]" />

              <div
                className="absolute inset-0 opacity-[0.045]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />
            </div>

            <div className="relative mx-auto max-w-3xl px-5 pb-9 pt-5">
              {/* Network status */}
              <div className="mb-5 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-2 backdrop-blur-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>

                  <span className="text-[11px] font-bold text-slate-200">
                    LifeLink network active
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void loadPassport(true)}
                  disabled={isRefreshing}
                  aria-label="Refresh donor passport"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-white backdrop-blur-xl transition hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
                  Digital donor identity
                </p>

                <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                  Your LifeLink Passport
                </h1>

                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                  Your verified donor profile, readiness status, emergency
                  matches, and donation impact in one secure place.
                </p>
              </div>

              {pageMode === "demo" && (
                <div className="mb-5 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100 backdrop-blur-xl">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="text-sm font-bold">Demo passport active</p>
                    <p className="mt-1 text-xs leading-5 text-amber-100/70">
                      Sample information is displayed because no authenticated
                      donor account was found.
                    </p>
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="absolute -inset-2 rounded-[2.25rem] bg-gradient-to-r from-red-500/20 via-white/5 to-emerald-400/20 blur-xl" />

                <div className="relative">
                  <DonorPassportCard
                    profile={displayProfile}
                    donationCount={donationCount}
                  />
                </div>
              </div>

              {/* Quick status */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <StatusPill
                  icon={ShieldCheck}
                  label="Verified"
                  value="Identity"
                  accent="text-emerald-300"
                />

                <StatusPill
                  icon={Wifi}
                  label="Connected"
                  value="Network"
                  accent="text-blue-300"
                />

                <StatusPill
                  icon={Heart}
                  label="Available"
                  value="To donate"
                  accent="text-red-300"
                />
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-3xl space-y-6 px-5 py-6">
            {/* Impact stats */}
            <section>
              <SectionTitle
                eyebrow="Your impact"
                title="A record of lives helped"
                description="Every successful donation contributes to a stronger emergency blood network."
              />

              <div className="mt-4 grid grid-cols-3 gap-3">
                {impactStats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <article
                      key={stat.label}
                      className="group rounded-[1.4rem] border border-white bg-white p-3 shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(15,23,42,0.09)] sm:p-4"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${stat.styles}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <p className="mt-4 text-xl font-black tracking-tight text-[#0D1933] sm:text-2xl">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-[10px] font-semibold leading-4 text-slate-400 sm:text-xs">
                        {stat.label}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Readiness card */}
            <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
              <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-white px-5 py-5">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl" />

                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />

                      <p className="text-[11px] font-black uppercase tracking-[0.17em] text-emerald-600">
                        Donation readiness
                      </p>
                    </div>

                    <h2 className="mt-2 text-xl font-black tracking-tight text-[#0D1933]">
                      Eligibility status
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Confirm your health readiness before responding.
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                    <UserRoundCheck className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <EligibilitySection />
            </section>

            {/* Active dispatch */}
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-red-500" />

                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
                      Live emergency
                    </p>
                  </div>

                  <h2 className="mt-2 text-xl font-black tracking-tight text-[#0D1933]">
                    Active dispatch
                  </h2>
                </div>

                {dispatch && !hasResponded && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-red-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    Action needed
                  </span>
                )}
              </div>

              {dispatch ? (
                hasResponded ? (
                  <DispatchConfirmation />
                ) : (
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-red-500/15 via-transparent to-orange-400/10 blur-lg" />

                    <div className="relative overflow-hidden rounded-[1.75rem]">
                      <ActiveDispatchCard
                        request={dispatch}
                        distanceKm={1.8}
                        onRespond={() => setHasResponded(true)}
                      />
                    </div>
                  </div>
                )
              ) : (
                <EmptyDispatchState />
              )}
            </section>

            {/* Emergency workflow */}
            <section className="rounded-[1.75rem] bg-[#0D1933] p-5 text-white shadow-[0_18px_50px_rgba(13,25,51,0.2)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200">
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    Smart matching
                  </div>

                  <h2 className="mt-4 text-xl font-black tracking-tight">
                    How LifeLink dispatch works
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    Emergency requests are matched using blood compatibility,
                    donor readiness, availability, and distance.
                  </p>
                </div>

                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 sm:flex">
                  <Activity className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <WorkflowStep
                  number="01"
                  icon={BellRing}
                  title="Alert"
                  text="Receive a verified hospital request."
                />

                <WorkflowStep
                  number="02"
                  icon={Navigation}
                  title="Respond"
                  text="Confirm and follow the secure directions."
                />

                <WorkflowStep
                  number="03"
                  icon={HeartPulse}
                  title="Donate"
                  text="Complete the donation and record impact."
                />
              </div>
            </section>

            {/* History */}
            <section>
              <SectionTitle
                eyebrow="Donation journey"
                title="History and achievements"
                description="Celebrate your previous contributions and track your growing impact."
              />

              <div className="mt-4">
                <DonationHistorySection
                  livesSaved={livesImpacted}
                  volumeLiters={3.5}
                  history={MOCK_DONATION_HISTORY}
                />
              </div>
            </section>

            {/* Achievement banner */}
            <section className="relative overflow-hidden rounded-[1.75rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-200/40 blur-3xl" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-lg shadow-amber-200">
                  <Award className="h-7 w-7" />
                </div>

                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600">
                    Community achievement
                  </p>

                  <h3 className="mt-1 text-base font-black text-[#0D1933]">
                    LifeLink Hero Donor
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your continued availability helps build a faster and more
                    reliable emergency response network.
                  </p>
                </div>

                <ArrowRight className="h-5 w-5 shrink-0 text-amber-500" />
              </div>
            </section>
          </div>
        </main>
      )}

      <BottomNav />
    </div>
  );
}

function StatusPill({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-xl">
      <Icon className={`h-4 w-4 ${accent}`} />
      <p className="mt-2 text-xs font-bold text-white">{label}</p>
      <p className="mt-0.5 text-[10px] text-slate-400">{value}</p>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl font-black tracking-tight text-[#0D1933]">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function WorkflowStep({
  number,
  icon: Icon,
  title,
  text,
}: {
  number: string;
  icon: typeof BellRing;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <Icon className="h-4 w-4 text-red-300" />
        </div>

        <span className="text-[10px] font-black text-slate-500">{number}</span>
      </div>

      <h3 className="mt-4 text-sm font-black text-white">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
    </article>
  );
}

function DispatchConfirmation() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-emerald-200 bg-white shadow-[0_16px_45px_rgba(16,185,129,0.12)]">
      <div className="relative overflow-hidden bg-emerald-500 px-5 py-5 text-white">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div>
            <p className="text-lg font-black">Response confirmed</p>
            <p className="mt-1 text-xs text-emerald-50">
              The hospital has been notified that you can help.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <InstructionRow
          icon={MapPin}
          title="Wait for location confirmation"
          text="The hospital will confirm where and when to arrive."
          color="bg-red-50 text-red-500"
        />

        <InstructionRow
          icon={Clock3}
          title="Keep your phone available"
          text="Emergency coordinators may contact you shortly."
          color="bg-amber-50 text-amber-500"
        />

        <InstructionRow
          icon={ShieldCheck}
          title="Follow verified instructions"
          text="Only proceed after receiving confirmation through LifeLink."
          color="bg-emerald-50 text-emerald-600"
        />
      </div>
    </div>
  );
}

function InstructionRow({
  icon: Icon,
  title,
  text,
  color,
}: {
  icon: typeof MapPin;
  title: string;
  text: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-sm font-bold text-[#0D1933]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function EmptyDispatchState() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-dashed border-slate-200 bg-white p-7 text-center">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="relative">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
          <Check className="h-7 w-7" />
        </div>

        <h3 className="mt-5 text-lg font-black text-[#0D1933]">
          No active requests nearby
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          You are connected and ready. LifeLink will notify you when a
          compatible verified request becomes available.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Monitoring emergency network
        </div>
      </div>
    </div>
  );
}

function PassportLoadingState() {
  return (
    <main className="animate-pulse">
      <section className="bg-[#0D1933] px-5 pb-9 pt-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-between">
            <div className="h-8 w-48 rounded-full bg-white/10" />
            <div className="h-11 w-11 rounded-2xl bg-white/10" />
          </div>

          <div className="mt-6 h-7 w-52 rounded-lg bg-white/10" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/10" />

          <div className="mt-6 h-72 rounded-[2rem] bg-white/10" />

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="h-20 rounded-2xl bg-white/10" />
            <div className="h-20 rounded-2xl bg-white/10" />
            <div className="h-20 rounded-2xl bg-white/10" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-6 px-5 py-6">
        <div>
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-3 h-6 w-52 rounded bg-slate-200" />

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="h-28 rounded-[1.4rem] bg-slate-200" />
            <div className="h-28 rounded-[1.4rem] bg-slate-200" />
            <div className="h-28 rounded-[1.4rem] bg-slate-200" />
          </div>
        </div>

        <div className="h-64 rounded-[1.75rem] bg-slate-200" />
        <div className="h-72 rounded-[1.75rem] bg-slate-200" />
        <div className="h-64 rounded-[1.75rem] bg-slate-200" />
      </div>
    </main>
  );
}
