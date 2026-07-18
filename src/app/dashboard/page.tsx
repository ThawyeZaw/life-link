// Dashboard — authenticated operational hub
// Request Board + Location Feed + Ping a Hero dispatch
// Thinzar Kyaw — Frontend Domain

import type { Metadata } from "next";
import { RequestBoard } from "@/components/dashboard/RequestBoard";
import { MapPreview } from "@/components/dashboard/MapPreview";
import { PingHero } from "@/components/dashboard/PingHero";

export const metadata: Metadata = {
  title: "Operations Dashboard — LifeLink",
  description: "Live emergency blood requests, location feed, and donor dispatch.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-black text-vr-navy md:text-2xl">Operations Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Live emergency blood coordination for Yangon Region
        </p>
      </div>

      {/* Widgets — single column on mobile, board + side rail on lg */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RequestBoard />
        </div>
        <div className="space-y-5">
          <PingHero />
          <MapPreview />
        </div>
      </div>
    </div>
  );
}
