// Services — three core pillars in a soft-shadow feature grid
// Thinzar Kyaw — Frontend Domain
// Navbar (floating pill) is rendered site-wide via root layout

import { Activity, Map, Siren, Droplets } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — LifeLink",
  description:
    "Real-time request board, interactive medical map, and instant donor dispatch for emergency blood coordination in Myanmar.",
};

const SERVICES = [
  {
    icon: Activity,
    title: "Real-time Request Board",
    desc: "A live-updating board where hospitals post urgent blood requests. Color-coded by urgency and blood type — a CRITICAL O+ or rare AB- request updates instantly for every signed-in donor, no refresh needed.",
    tags: ["O+", "AB-", "CRITICAL"],
  },
  {
    icon: Map,
    title: "Interactive Medical Map",
    desc: "A Mapbox-powered map of active requests, hospital pins, and donor zones across Yangon. See the fastest route from Sanchaung to Yangon General Hospital before you even leave home.",
    tags: ["Mapbox", "Live routing"],
  },
  {
    icon: Siren,
    title: "Ping a Hero",
    desc: "One-tap emergency dispatch. Our smart matching engine ranks nearby donors by blood type compatibility, distance, and last donation date — then alerts them instantly.",
    tags: ["Smart matching", "Instant alerts"],
  },
];

export default function ServicesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600">
            What We Do
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Three pillars. One mission.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-500 md:text-lg">
            Everything LifeLink does is built to shrink the time between an
            urgent request and a donor at the hospital door.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, desc, tags }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <Icon className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="mt-5 text-lg font-bold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 pb-8 text-center">
        <p className="text-xs text-gray-400">
          Built with <Droplets className="inline h-3 w-3 text-red-500" /> for Myanmar · LifeLink Hackathon 2026
        </p>
      </footer>
    </main>
  );
}
