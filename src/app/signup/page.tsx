import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { SignupForm } from "@/components/auth/SignupForm";

const SignupPage = () => {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f8_0%,#ffffff_55%,#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-red-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="hidden items-center gap-2 text-sm font-semibold text-slate-500 sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Privacy-first signup
          </div>
        </div>

        <section className="grid min-h-[calc(100vh-110px)] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.10)] lg:grid-cols-[0.92fr_1.08fr]">
          {/* LEFT SIDE */}
          <div className="relative hidden overflow-hidden bg-[#07111f] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-28 top-0 h-80 w-80 rounded-full bg-red-500/20 blur-[110px]" />
              <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-[130px]" />

              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="LifeLink"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />

                <div>
                  <p className="text-xl font-black tracking-tight">
                    Life<span className="text-red-400">Link</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Emergency blood network
                  </p>
                </div>
              </div>

              <div className="mt-20">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                  <Sparkles className="h-4 w-4 text-red-400" />
                  Join a life-saving network
                </div>

                <h1 className="mt-7 max-w-xl text-5xl font-black leading-[1.03] tracking-[-0.05em]">
                  Your response could become someone&apos;s next heartbeat.
                </h1>

                <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
                  Create one secure profile and receive alerts when someone
                  nearby needs your blood type. Your location and contact
                  information remain private until you choose to respond.
                </p>
              </div>
            </div>

            <div className="relative grid gap-3">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                  <LockKeyhole className="h-5 w-5 text-emerald-300" />
                </div>

                <div>
                  <p className="text-sm font-bold">Your details stay private</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    No public phone number, home address, or exact map pin.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                  <BadgeCheck className="h-5 w-5 text-red-300" />
                </div>

                <div>
                  <p className="text-sm font-bold">Trusted emergency alerts</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Get notified through a focused donor-response workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM SIDE */}
          <div className="flex items-center justify-center px-5 py-8 sm:px-8 sm:py-12 lg:px-14 xl:px-20">
            <div className="w-full max-w-xl">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-red-200 blur-xl" />

                  <div className="relative rounded-3xl border border-red-100 bg-white p-2 shadow-lg">
                    <Image
                      src="/logo.png"
                      alt="LifeLink"
                      width={64}
                      height={64}
                      priority
                      className="rounded-2xl object-contain"
                    />
                  </div>
                </div>

                <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-red-500">
                  Create your account
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                  Join LifeLink
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                  Set up your donor or organization profile and become part of a
                  faster, safer emergency blood network.
                </p>
              </div>

              <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-7">
                <SignupForm />
              </div>

              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-red-600 transition hover:text-red-700 hover:underline"
                  >
                    Log in
                  </Link>
                </p>

                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Your information is protected and never shared without
                  consent.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SignupPage;
