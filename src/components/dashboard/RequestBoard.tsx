"use client";

// RequestBoard — live request feed with urgency filter (dashboard widget)
// Thinzar Kyaw — Frontend Domain

import { useState } from "react";
import { MapPin, Clock, Droplets } from "lucide-react";
import { clsx } from "clsx";

const FILTERS = ["ALL", "CRITICAL", "URGENT", "STANDARD"] as const;
type Filter = (typeof FILTERS)[number];

const MOCK_FEED = [
  {
    id: "req-101",
    hospital: "Yangon General Hospital",
    township: "Mingalar Taung Nyunt",
    bloodType: "O+",
    urgency: "CRITICAL",
    unitsNeeded: 3,
    postedAgo: "4 min ago",
  },
  {
    id: "req-102",
    hospital: "Asia Royal Hospital",
    township: "Bahan",
    bloodType: "AB-",
    urgency: "URGENT",
    unitsNeeded: 2,
    postedAgo: "18 min ago",
  },
  {
    id: "req-103",
    hospital: "Pun Hlaing Siloam Hospital",
    township: "Hlaing Tharyar",
    bloodType: "B+",
    urgency: "URGENT",
    unitsNeeded: 4,
    postedAgo: "32 min ago",
  },
  {
    id: "req-104",
    hospital: "Parami Hospital",
    township: "Mayangone",
    bloodType: "A+",
    urgency: "STANDARD",
    unitsNeeded: 1,
    postedAgo: "1 hr ago",
  },
];

const URGENCY_CLASSES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border border-red-200",
  URGENT: "bg-amber-100 text-amber-700 border border-amber-200",
  STANDARD: "bg-green-100 text-green-700 border border-green-200",
};

export const RequestBoard = () => {
  const [filter, setFilter] = useState<Filter>("ALL");
  const visible = filter === "ALL" ? MOCK_FEED : MOCK_FEED.filter((r) => r.urgency === filter);

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-black text-vr-navy md:text-lg">Live Request Board</h2>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          LIVE
        </span>
      </div>

      {/* Urgency filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={clsx(
              "min-h-[44px] rounded-xl px-4 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-red-500",
              filter === f
                ? "bg-red-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {visible.map((req) => (
          <article key={req.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-base font-black text-red-600">
                {req.bloodType}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${URGENCY_CLASSES[req.urgency]}`}>
                {req.urgency}
              </span>
            </div>
            <h3 className="mt-3 text-base font-bold text-vr-navy">{req.hospital}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" /> {req.township}
            </p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Droplets className="h-4 w-4 text-red-400" /> {req.unitsNeeded} units
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {req.postedAgo}
              </span>
            </div>
            <button
              type="button"
              className="mt-4 w-full min-h-[44px] rounded-xl bg-red-600 text-base font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Respond Now
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
