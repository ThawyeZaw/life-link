// src/app/page.tsx
// LifeLink — Emergency Blood Network
// Team Vertex Red

import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  Activity,
  ArrowRight,
  BellRing,
  Building2,
  CheckCircle2,
  Clock3,
  Droplets,
  Heart,
  Hospital,
  LogIn,
  LogOut,
  MapPin,
  Radio,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "LifeLink — Emergency Blood Network Myanmar",
  description:
    "LifeLink connects verified hospitals, patients, and blood donors across Myanmar in real time.",
};

const stats = [
  {
    value: "202",
    label: "Hospitals",
    icon: Hospital,
  },
  {
    value: "1,400+",
    label: "Ready donors",
    icon: Users,
  },
  {
    value: "24/7",
    label: "Emergency network",
    icon: Clock3,
  },
];

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Verified requests",
    description:
      "Emergency blood requests are managed through trusted hospitals.",
  },
  {
    icon: Radio,
    title: "Real-time dispatch",
    description:
      "Compatible nearby donors can be notified as soon as help is needed.",
  },
  {
    icon: MapPin,
    title: "Location-based matching",
    description:
      "Donors are prioritised by blood type, availability, and distance.",
  },
];

export default async function HomePage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let isOrganisation = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, account_type")
      .eq("id", user.id)
      .single();
    displayName = profile?.full_name || user.email || "Account";
    isOrganisation = profile?.account_type === "organisation";
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F8FC] text-[#162033]">
      <section className="relative isolate overflow-hidden bg-[#101B35]">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:px-10 lg:pb-24">
          <nav className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="LifeLink home"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500 shadow-[0_10px_35px_rgba(239,68,68,0.35)]">
                <Droplets className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="text-xl font-black tracking-tight text-white">
                  Life<span className="text-red-400">Link</span>
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  by Team Vertex Red
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur lg:flex">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                Emergency network online
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={isOrganisation ? "/org" : "/profile"}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    <UserCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="max-w-[10rem] truncate">{displayName}</span>
                  </Link>
                  <form action="/auth/signout" method="POST">
                    <button
                      type="submit"
                      aria-label="Sign out"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 backdrop-blur transition hover:bg-white/10 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-xs font-bold text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)] transition hover:bg-red-400"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
              )}
            </div>
          </nav>

          <div className="grid items-center gap-12 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3.5 py-2 text-xs font-bold text-red-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Myanmar&apos;s emergency blood response network
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.06] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
                Every second counts.
                <br />
                <span className="bg-gradient-to-r from-red-400 via-red-300 to-orange-300 bg-clip-text text-transparent">
                  Every match saves a life.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                LifeLink connects verified hospitals, patients, and compatible
                blood donors in real time, helping urgent requests reach the
                right people faster.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/command"
                  className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 text-sm font-bold text-white shadow-[0_18px_40px_rgba(239,68,68,0.3)] transition hover:-translate-y-0.5 hover:bg-red-400"
                >
                  Request Blood
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/profile"
                  className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <Heart className="h-4 w-4 text-emerald-400" />
                  Become a Donor
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Verified hospital requests
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Privacy-first matching
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Available 24/7
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-red-500/20 to-emerald-400/10 blur-2xl" />

              <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white p-5 shadow-2xl sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-red-600">
                      <BellRing className="h-3.5 w-3.5" />
                      Critical request
                    </div>

                    <h2 className="mt-4 text-xl font-black tracking-tight text-[#101B35] sm:text-2xl">
                      O− blood needed urgently
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Yangon General Hospital
                    </p>
                  </div>

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-red-500 text-xl font-black text-white shadow-lg shadow-red-200">
                    O−
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-400">
                      Required
                    </p>

                    <p className="mt-1 text-base font-black text-[#101B35]">
                      2 units
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-400">
                      Needed within
                    </p>

                    <p className="mt-1 text-base font-black text-red-600">
                      90 minutes
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                        <Users className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-black text-emerald-950">
                          8 compatible donors nearby
                        </p>

                        <p className="text-xs text-emerald-700">
                          Closest eligible donor is 1.8 km away
                        </p>
                      </div>
                    </div>

                    <Activity className="h-5 w-5 shrink-0 text-emerald-600" />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href="/broadcast"
                    className="group flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#101B35] px-4 text-sm font-bold text-white transition hover:bg-[#18294f]"
                  >
                    Dispatch donors
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/inventory"
                    aria-label="Open blood inventory"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  >
                    <Droplets className="h-5 w-5" />
                  </Link>
                </div>
              </article>

              <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#172541] px-4 py-3 text-white shadow-xl sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>

                <div>
                  <p className="text-xs font-bold">Match confirmed</p>
                  <p className="text-[10px] text-slate-400">
                    Donor responding now
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-3 divide-x divide-white/10 rounded-[1.75rem] border border-white/10 bg-white/5 p-3 backdrop-blur sm:p-5 lg:mt-20">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center justify-center px-2 py-3 text-center sm:flex-row sm:gap-3"
                >
                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-white/10 sm:flex">
                    <Icon className="h-5 w-5 text-red-300" />
                  </div>

                  <div className="sm:text-left">
                    <p className="text-base font-black text-white sm:text-xl">
                      {stat.value}
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium text-slate-400 sm:text-xs">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
            Enter LifeLink
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#101B35] sm:text-4xl">
            How are you using LifeLink?
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
            Choose your role to access the emergency tools designed for you.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Link
            href="/profile"
            id="role-donor"
            className="group relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_16px_50px_rgba(16,24,40,0.07)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_22px_65px_rgba(16,185,129,0.13)] sm:p-8"
          >
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-100/70 blur-2xl transition group-hover:scale-125" />

            <div className="relative">
              <div className="flex items-start justify-between gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100">
                  <Heart className="h-8 w-8 text-emerald-600" />
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white">
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
                Donor access
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-[#101B35]">
                I&apos;m a blood donor
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Manage your donor passport, update availability, receive
                compatible emergency requests, and track your impact.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {["Donor Profile", "Nearby requests", "Eligibility status"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </Link>

          <Link
            href="/command"
            id="role-hospital"
            className="group relative overflow-hidden rounded-[2rem] border border-red-100 bg-white p-6 shadow-[0_16px_50px_rgba(16,24,40,0.07)] transition duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-[0_22px_65px_rgba(239,68,68,0.13)] sm:p-8"
          >
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-red-100/70 blur-2xl transition group-hover:scale-125" />

            <div className="relative">
              <div className="flex items-start justify-between gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-100">
                  <Building2 className="h-8 w-8 text-red-600" />
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-red-200 group-hover:bg-red-500 group-hover:text-white">
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-red-500">
                Hospital access
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-[#101B35]">
                I&apos;m a hospital
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Create emergency broadcasts, coordinate responding donors,
                monitor blood stock, and manage active requests.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "Command center",
                  "Emergency broadcasts",
                  "Blood inventory",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Link
            href="/broadcast"
            id="quick-broadcast"
            className="group flex items-center justify-between rounded-3xl border border-red-100 bg-red-50 p-5 transition hover:border-red-200 hover:bg-red-100/70"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
                <BellRing className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-black text-red-950">
                  Create emergency request
                </p>

                <p className="mt-1 text-xs text-red-700/70">
                  Notify compatible nearby donors
                </p>
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-red-400 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/inventory"
            id="quick-inventory"
            className="group flex items-center justify-between rounded-3xl border border-emerald-100 bg-emerald-50 p-5 transition hover:border-emerald-200 hover:bg-emerald-100/70"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                <Droplets className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-black text-emerald-950">
                  View blood inventory
                </p>

                <p className="mt-1 text-xs text-emerald-700/70">
                  Monitor blood-group availability
                </p>
              </div>
            </div>

            <ArrowRight className="h-5 w-5 text-emerald-500 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="grid gap-5 md:grid-cols-3">
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-3xl border border-slate-100 bg-[#FAFBFD] p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#101B35] text-white">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-5 text-base font-black text-[#101B35]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="bg-[#101B35] px-5 py-8 text-center">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-red-400" />

            <p className="text-sm font-black text-white">
              Life<span className="text-red-400">Link</span>
            </p>
          </div>

          <p className="text-xs text-slate-400">
            Built with care for Myanmar · Team Vertex Red
          </p>

          <p className="text-xs font-semibold text-slate-400">
            Connecting blood. Saving lives.
          </p>
        </div>
      </footer>
    </main>
  );
}
