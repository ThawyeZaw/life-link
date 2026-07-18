// Our Team — hackathon team profile grid
// Thinzar Kyaw — Frontend Domain
// Navbar (floating pill) is rendered site-wide via root layout

import { Droplets, Code2, Palette, Server } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team — LifeLink",
  description: "Meet the LifeLink hackathon team building emergency blood coordination for Myanmar.",
};

const TEAM = [
  {
    name: "Thaw Ye Zaw",
    role: "Full Stack Engineer",
    focus: "Backend · Python Matching Engine · Supabase",
    initials: "TYZ",
    icon: Server,
    accent: "bg-red-100 text-red-600",
  },
  {
    name: "Thinzar Kyaw",
    role: "Full Stack Engineer",
    focus: "Frontend · UI/UX · Mapbox",
    initials: "TK",
    icon: Code2,
    accent: "bg-emerald-100 text-emerald-600",
  },
  {
    name: "Zay Lynn Htet",
    role: "UI/UX Designer",
    focus: "Figma · Design System",
    initials: "ZLH",
    icon: Palette,
    accent: "bg-amber-100 text-amber-600",
  },
];

export default function TeamPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600">
            The Builders
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Meet the team
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-500 md:text-lg">
            Three builders, one hackathon, and a mission to make emergency blood
            coordination instant across Myanmar.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {TEAM.map(({ name, role, focus, initials, icon: Icon, accent }) => (
            <div
              key={name}
              className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-md"
            >
              {/* Circular avatar placeholder */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-xl font-extrabold text-gray-600">
                {initials}
              </div>
              <h2 className="mt-5 text-lg font-bold text-gray-900">{name}</h2>

              {/* Role badge */}
              <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${accent}`}>
                <Icon className="h-3.5 w-3.5" />
                {role}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">{focus}</p>
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
