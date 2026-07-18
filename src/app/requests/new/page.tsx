import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { NewRequestForm } from "@/components/request/NewRequestForm";

const NewRequestPage = () => {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Compact mobile-friendly header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white">
              <HeartPulse className="h-5 w-5" />
            </span>

            <span className="hidden text-sm font-black sm:inline">
              Life<span className="text-red-500">Link</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Secure
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Mobile heading: short and action-focused */}
        <section className="mb-5 lg:hidden">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Emergency blood request
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950">
            Request blood
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add the essential details. Matching begins immediately after
            submission.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          {/* Form comes first in the DOM and on mobile */}
          <section className="order-1">
            <div className="hidden lg:block">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-bold text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Emergency blood request
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] text-slate-950">
                Request blood
              </h1>

              <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                Enter the request details and LifeLink will begin checking for
                compatible donors near the hospital.
              </p>
            </div>

            <div className="mt-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.07)] sm:p-6 lg:mt-7 lg:p-7">
              <NewRequestForm />
            </div>

            {/* Compact mobile reassurance after form */}
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 lg:hidden">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <p className="text-xs leading-5 text-emerald-800">
                Donor contact details and exact locations remain private until
                consent is provided.
              </p>
            </div>

            {/* Optional information, collapsed on mobile */}
            <details className="mt-4 rounded-2xl border border-slate-200 bg-white lg:hidden">
              <summary className="cursor-pointer px-4 py-4 text-sm font-bold text-slate-800">
                What happens after submission?
              </summary>

              <div className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-600">
                LifeLink creates the request, checks compatible donors, and
                opens the live response flow for tracking.
              </div>
            </details>
          </section>

          {/* Supporting panel only beside the form on desktop */}
          <aside className="order-2 hidden lg:sticky lg:top-8 lg:block">
            <div className="overflow-hidden rounded-3xl bg-[#07111f] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500">
                <HeartPulse className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-tight">
                Fast, focused emergency coordination
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Only essential request information is collected so matching can
                begin quickly.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-4">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

                  <div>
                    <p className="text-sm font-bold">Quick submission</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Designed to complete in under a minute.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />

                  <div>
                    <p className="text-sm font-bold">Nearby matching</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Checks blood compatibility and approximate availability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

                  <div>
                    <p className="text-sm font-bold">Privacy protected</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Exact donor locations are never shown publicly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <p className="text-sm font-bold text-emerald-200">
                    Matching starts after submission
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default NewRequestPage;
