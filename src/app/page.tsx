// Landing page — role selector (Donor vs Hospital)
// Thinzar Kyaw — Frontend Domain

import Link from "next/link";
import { Droplets, Building2, ArrowRight, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LifeLink — Emergency Blood Donor Platform Myanmar",
  description:
    "Real-time emergency platform connecting blood donors, hospitals, and urgent medical needs across Myanmar.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Hero header */}
      <div className="bg-vr-navy px-6 pt-14 pb-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-vr-red shadow-lg">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Vertex<span className="text-red-400">Red</span>
          </span>
        </div>
        <h1 className="text-3xl font-black text-white leading-tight">
          Save lives.<br />
          <span className="text-emerald-400">Right now.</span>
        </h1>
        <p className="mt-3 text-base text-gray-400 leading-relaxed max-w-xs">
          Real-time emergency blood coordination across Myanmar — like Grab, for saving lives.
        </p>

        {/* Live stats */}
        <div className="mt-6 flex gap-4">
          {[
            { value: "202", label: "Hospitals" },
            { value: "1,400+", label: "Donors" },
            { value: "24/7", label: "Live" },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 rounded-2xl bg-white/10 p-3 text-center">
              <p className="text-lg font-black text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role selector */}
      <div className="flex-1 px-5 py-8 space-y-4">
        <p className="text-sm font-semibold text-gray-500 text-center mb-6">
          How are you using LifeLink?
        </p>

        {/* Donor card */}
        <Link
          href="/passport"
          id="role-donor"
          className="group flex items-center justify-between rounded-3xl bg-white border-2 border-gray-100 p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
              <Heart className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-base font-bold text-vr-navy">I&apos;m a Donor</p>
              <p className="text-sm text-gray-500 mt-0.5">
                View passport, respond to dispatches
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
        </Link>

        {/* Hospital card */}
        <Link
          href="/command"
          id="role-hospital"
          className="group flex items-center justify-between rounded-3xl bg-white border-2 border-gray-100 p-5 shadow-sm hover:border-red-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 group-hover:bg-red-200 transition-colors">
              <Building2 className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <p className="text-base font-bold text-vr-navy">I&apos;m a Hospital</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Command center, broadcasts, inventory
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-red-500 transition-colors" />
        </Link>

        {/* Hospital sub-links */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/broadcast"
            id="quick-broadcast"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-red-50 border border-red-100 py-4 px-3 text-center hover:bg-red-100 transition-colors"
          >
            <Droplets className="h-5 w-5 text-red-500" />
            <span className="text-xs font-semibold text-red-700">New Broadcast</span>
          </Link>
          <Link
            href="/inventory"
            id="quick-inventory"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 py-4 px-3 text-center hover:bg-emerald-100 transition-colors"
          >
            <Building2 className="h-5 w-5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Blood Inventory</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-gray-400">
          Built with ❤️ for Myanmar · LifeLink Hackathon 2026
        </p>
      </div>
    </main>
  );
}
