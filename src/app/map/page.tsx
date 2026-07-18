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
import { BottomNav } from "@/components/layout/BottomNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donation Map — LifeLink",
  description: "Find nearby blood donation centers, active requests, and donors across Myanmar.",
};

export default function MapPage() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <ApiKeyMissing />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-gray-50">
      <DonorTopBar title="Donation Map" subtitle="Hospitals, requests & donors" />
      <MapView mapboxToken={mapboxToken} />
      <BottomNav />
    </div>
  );
}
