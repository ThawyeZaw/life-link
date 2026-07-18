// About — mission page, single-column editorial reading experience
// Thinzar Kyaw — Frontend Domain
// Navbar (floating pill) is rendered site-wide via root layout

import { Droplets, Zap, Users, Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — LifeLink",
  description:
    "LifeLink is a real-time emergency platform connecting blood donors, hospitals, and critical medical needs across Myanmar.",
};

const PRINCIPLES = [
  {
    icon: Zap,
    title: "Speed is survival",
    desc: "A CRITICAL request should reach compatible donors in seconds, not phone-tree hours.",
  },
  {
    icon: Users,
    title: "Community first",
    desc: "1,200+ registered donors — ordinary people like Ko Aung and Ma Thida who answer the call.",
  },
  {
    icon: Building2,
    title: "Hospitals verified",
    desc: "202 partner facilities, from Yangon General Hospital to Pun Hlaing Siloam.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <article className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600">
          Our Mission
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl">
          Saving Lives in Real-Time.
        </h1>

        <div className="mt-8 space-y-6 text-base leading-relaxed text-gray-600 md:text-lg">
          <p>
            Every day across Myanmar, families race against the clock to find blood
            for loved ones in emergency rooms. The traditional way — phone calls,
            Facebook posts, word of mouth — loses precious hours when minutes decide
            outcomes.
          </p>
          <p>
            <strong className="text-gray-900">LifeLink</strong> is a real-time
            emergency platform that connects blood donors, hospitals, and critical
            medical needs — <em>like Grab, but for saving lives</em>. When a
            hospital in Mingalar Taung Nyunt posts an urgent O+ request, compatible
            donors in Sanchaung are alerted instantly, matched by blood type,
            proximity, and eligibility.
          </p>
          <p>
            Born at a hackathon, built for Myanmar: our platform pairs a live
            request board with smart donor dispatch, so that no request goes
            unheard and no willing donor goes unfound.
          </p>
        </div>

        {/* Principles */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                <Icon className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="mt-4 text-base font-bold text-gray-900">{title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </article>

      <footer className="px-6 pb-8 text-center">
        <p className="text-xs text-gray-400">
          Built with <Droplets className="inline h-3 w-3 text-red-500" /> for Myanmar · LifeLink Hackathon 2026
        </p>
      </footer>
    </main>
  );
}
