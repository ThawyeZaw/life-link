// FeatureSection — staggered overlapping glass feature cards around a water-inspired central motif
// Thinzar Kyaw — Frontend Domain

import { MapPin, ShieldCheck, Droplets } from "lucide-react";

export const FeatureSection = () => {
  return (
    <section className="bg-water-subtle water-ripple px-5 py-16 md:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
            Built for life-or-death speed
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            From a CRITICAL O+ request at Asia Royal Hospital to a matched donor
            in Sanchaung — in minutes, not hours.
          </p>
        </div>

        {/* Staggered visual composition */}
        <div className="relative mt-12 flex min-h-[400px] flex-col items-center justify-center gap-6 lg:gap-0">
          {/* Central water-inspired droplet motif — frosted glass circle */}
          <div className="glass-surface flex h-64 w-64 items-center justify-center rounded-full">
            {/* Inner ripple rings */}
            <div className="glass-elevated flex h-48 w-48 items-center justify-center rounded-full">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-50/70">
                <Droplets className="h-16 w-16 text-blue-400/70" />
              </div>
            </div>
          </div>

          {/* Card 1 — top left on desktop, glass elevated */}
          <div className="glass-elevated z-10 w-full max-w-xs rounded-2xl p-5 transition-all duration-300 hover:float-card lg:absolute lg:left-10 lg:top-10">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-red-100 p-2.5 text-red-600">
                <MapPin className="h-5 w-5" />
              </span>
              <p className="text-base font-bold text-gray-900">Smart Routing</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Urgent requests are routed to the closest compatible donors by
              township — Mingalar Taung Nyunt to Hlaing in one dispatch.
            </p>
          </div>

          {/* Card 2 — bottom right on desktop, glass elevated */}
          <div className="glass-elevated z-10 w-full max-w-xs rounded-2xl p-5 transition-all duration-300 hover:float-card lg:absolute lg:bottom-10 lg:right-10">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-red-100 p-2.5 text-red-600">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <p className="text-base font-bold text-gray-900">Verified Hospitals</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Every request comes from a verified partner — Yangon General
              Hospital, Asia Royal, Parami, and 199 more.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
