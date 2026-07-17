// Map stub page — placeholder until Mapbox integration
// Thinzar Kyaw — Frontend Domain

import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import { DonorTopBar } from "@/components/layout/DonorTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donation Map — LifeLink",
  description: "Find nearby blood donation centers and active requests across Myanmar.",
};

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
      <DonorTopBar title="Donation Map" subtitle="Find nearby ways to give" />

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100">
          <MapPin className="h-12 w-12 text-vr-teal" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-vr-navy text-center">
          Interactive Map
        </h2>
        <p className="mt-2 text-sm text-gray-500 text-center max-w-xs leading-relaxed">
          The Mapbox-powered donation map is coming soon. It will show donor locations,
          hospital pins, and urgent request zones across Myanmar.
        </p>

        <div className="mt-8 w-full max-w-xs space-y-3">
          <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
              Planned Features
            </p>
            {[
              "Active donor locations near you",
              "Hospital pins with blood needs",
              "Urgent request heat zones",
              "One-tap directions",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-vr-teal shrink-0" />
                <span className="text-sm text-gray-600">{f}</span>
              </div>
            ))}
          </div>

          <Link
            href="/passport"
            className="flex items-center justify-center gap-2 rounded-2xl bg-vr-navy py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Passport
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
