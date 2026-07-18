// /onboarding — donor onboarding (blood type, address & essential personal
// info required for donating blood). Protected route: middleware + layout
// guard require an authenticated session.
// Thinzar Kyaw — Frontend Domain

import { Suspense } from "react";
import type { Metadata } from "next";
import { HeartPulse, Loader2 } from "lucide-react";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export const metadata: Metadata = {
  title: "Donor Onboarding",
  description:
    "Complete your donor profile — blood type, address, and health details.",
};

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100">
            <HeartPulse className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-vr-navy">
              Complete Your Donor Profile
            </h1>
            <p className="mt-1 text-base text-slate-600">
              We need a few essential details to match you with urgent blood
              requests near you.
            </p>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
          }
        >
          <OnboardingForm />
        </Suspense>
      </div>
    </main>
  );
}
