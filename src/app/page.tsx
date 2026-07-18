import Link from "next/link";

import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Clock3,
  HeartHandshake,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";

const organizationFeatures = [
  {
    icon: Users,
    title: "Centralized member network",
    description:
      "Bring donors, volunteers, coordinators, and community leaders together in one organized workspace.",
  },
  {
    icon: Zap,
    title: "Faster emergency coordination",
    description:
      "Reduce delays by sharing urgent blood requests through a clear and focused response flow.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-first participation",
    description:
      "Keep donor information protected while still enabling trusted and effective coordination.",
  },
];

const trustItems = [
  "Create an organization in minutes",
  "Invite members using a single code",
  "Coordinate urgent requests together",
  "Keep communication simple and focused",
];

const impactStats = [
  {
    value: "24/7",
    label: "Emergency readiness",
    icon: Clock3,
  },
  {
    value: "1 Code",
    label: "Simple member access",
    icon: BadgeCheck,
  },
  {
    value: "1 Network",
    label: "Connected donor community",
    icon: HeartHandshake,
  },
];

const HomePage = () => {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <Hero />

      <HowItWorks />

      <section className="relative overflow-hidden bg-[#07111f] px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-red-500/15 blur-[120px]" />
          <div className="absolute -right-32 bottom-0 h-[460px] w-[460px] rounded-full bg-emerald-400/10 blur-[130px]" />
          <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-[120px]" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:56px_56px]" />

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15">
                  <Sparkles className="h-3.5 w-3.5 text-red-400" />
                </span>
                Built for donor communities
              </div>

              <h2 className="mt-8 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Turn your community into a
                <span className="relative ml-3 inline-block">
                  <span className="relative z-10 text-red-400">
                    life-saving network.
                  </span>
                  <span className="absolute bottom-1 left-0 h-3 w-full rounded-full bg-red-500/10 blur-sm" />
                </span>
              </h2>

              <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Create an organization, invite your members with one code, and
                coordinate urgent blood requests through one trusted digital
                space.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-bold text-slate-950 shadow-[0_18px_60px_rgba(255,255,255,0.14)] transition duration-300 hover:-translate-y-1 hover:bg-slate-100"
                >
                  Create an organization
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/signup"
                  className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-7 text-base font-semibold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.1]"
                >
                  <Building2 className="h-4 w-4 text-emerald-300" />
                  Join with invite code
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {trustItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-slate-300"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-red-500/15 via-transparent to-emerald-400/15 blur-2xl" />

              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.07] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                <div className="rounded-[26px] border border-white/10 bg-[#0b1728]/95 p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                        Community workspace
                      </p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
                        LifeLink Organization
                      </h3>
                    </div>

                    <Image
                      src="/logo.png"
                      alt="LifeLink"
                      width={36}
                      height={36}
                      className="rounded-lg"
                    />
                  </div>

                  <div className="mt-7 grid grid-cols-3 gap-3">
                    {impactStats.map(({ value, label, icon: Icon }) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                      >
                        <Icon className="h-4 w-4 text-emerald-300" />
                        <p className="mt-4 text-lg font-black text-white">
                          {value}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-3xl border border-red-400/15 bg-gradient-to-br from-red-500/10 to-transparent p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                          Active emergency
                        </p>
                        <p className="mt-2 text-lg font-bold text-white">
                          O− blood urgently required
                        </p>
                      </div>

                      <span className="rounded-full border border-red-400/20 bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-300">
                        Critical
                      </span>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-red-500 to-red-400" />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                      <span>Matching eligible donors</span>
                      <span className="font-bold text-white">72%</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                        <ShieldCheck className="h-5 w-5 text-emerald-300" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Privacy protected
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Donor details remain secure
                        </p>
                      </div>
                    </div>

                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 grid gap-4 md:grid-cols-3 lg:mt-28">
            {organizationFeatures.map(
              ({ icon: Icon, title, description }, index) => (
                <article
                  key={title}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-white/[0.08] sm:p-7"
                >
                  <div className="absolute right-5 top-5 text-5xl font-black text-white/[0.035]">
                    0{index + 1}
                  </div>

                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-white/10 bg-white text-slate-950 shadow-[0_14px_35px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-7 text-xl font-bold tracking-tight text-white">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {description}
                  </p>
                </article>
              ),
            )}
          </div>

          <div className="mt-16 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-white/[0.07] to-white/[0.03] p-6 backdrop-blur-xl sm:p-8 lg:mt-20 lg:p-10">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-300">
                  Start your network
                </p>

                <h3 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  A stronger donor community starts with one connection.
                </h3>

                <p className="mt-4 text-base leading-7 text-slate-300">
                  Create your LifeLink organization and give your community a
                  better way to respond when every second matters.
                </p>
              </div>

              <Link
                href="/signup"
                className="group inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-red-500 px-7 text-base font-bold text-white shadow-[0_18px_45px_rgba(239,68,68,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-red-400"
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white shadow-sm">
                <Image
                  src="/logo.png"
                  alt="LifeLink"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
              </span>

              <p className="text-lg font-black tracking-tight text-slate-950">
                Life<span className="text-red-500">Link</span>
              </p>
            </div>

            <p className="mt-2 text-center text-sm text-slate-500 sm:text-left">
              Built for Myanmar. Every drop counts.
            </p>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-sm font-medium text-slate-600">
              Connecting communities when every second matters.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              © 2026 LifeLink. Team Vertex Red.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default HomePage;
