// src/app/map/page.tsx
// LifeLink — Interactive Mapbox page
// Thinzar Kyaw — Frontend Domain
//
// Thin shell: just passes the Mapbox token to the self-contained <MapView>.
// The MapView handles all data fetching, real-time subscriptions, view modes,
// and matching engine integration internally. If the UI layout around the map
// is renovated by other developers, just drop <MapView mapboxToken={token} />
// into the new layout.

import { MapView } from "@/components/map/MapView";
import { ApiKeyMissing } from "@/components/map/ApiKeyMissing";
import { DonorTopBar } from "@/components/layout/DonorTopBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donation Map — LifeLink",
  description: "Find nearby blood donation centers and active requests across Myanmar.",
};

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
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

  if (!mapboxToken) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <ApiKeyMissing />
      </div>
    );
  }

    </div>
  );
}
