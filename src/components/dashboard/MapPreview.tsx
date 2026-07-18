// MapPreview — compact location feed preview linking to the full live map
// Thinzar Kyaw — Frontend Domain
// NOTE: Full interactive Mapbox instance lives at /map. This is a lightweight
// preview to keep the dashboard fast.

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

const NEARBY = [
  { name: "Yangon General Hospital", township: "Mingalar Taung Nyunt", distance: "1.2 km" },
  { name: "Asia Royal Hospital", township: "Bahan", distance: "3.5 km" },
  { name: "Parami Hospital", township: "Mayangone", distance: "6.8 km" },
];

export const MapPreview = () => {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-vr-navy">Location Feed</h2>
        <Link
          href="/map"
          className="flex min-h-[44px] items-center gap-1 text-sm font-semibold text-red-600 hover:underline"
        >
          Open Live Map <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stylized map placeholder */}
      <div className="relative mt-3 h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-gray-100 to-red-50">
        <MapPin className="absolute left-[20%] top-[30%] h-5 w-5 text-red-500" />
        <MapPin className="absolute left-[55%] top-[55%] h-5 w-5 text-red-400" />
        <MapPin className="absolute left-[75%] top-[25%] h-5 w-5 text-emerald-500" />
        <span className="absolute bottom-2 right-3 text-xs font-semibold text-gray-400">
          Yangon Region
        </span>
      </div>

      <ul className="mt-3 space-y-2">
        {NEARBY.map((place) => (
          <li key={place.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
            <div>
              <p className="text-sm font-bold text-vr-navy">{place.name}</p>
              <p className="text-xs text-gray-500">{place.township}</p>
            </div>
            <span className="text-xs font-semibold text-gray-400">{place.distance}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
