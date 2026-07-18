"use client";

// HeroSection — editorial hero with Apple liquid glass stat overlay
// Thinzar Kyaw — Frontend Domain
// CTA opens the auth modal (no direct dashboard access pre-authentication).

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

const HERO_IMG =
  "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=warm%20hopeful%20photograph%20of%20young%20volunteer%20blood%20donors%20smiling%20at%20a%20modern%20hospital%20donation%20center%20in%20Yangon%20Myanmar%2C%20soft%20natural%20window%20light%2C%20red%20accent%20tones%2C%20professional%20editorial%20photography&image_size=portrait_4_3";

const PILL_TAGS = ["O+", "AB-", "24/7 Dispatch"];

export const HeroSection = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <section className="water-ripple px-5 py-20 md:px-8 lg:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left — typography & CTA */}
        <div className="flex flex-col items-start justify-center">
          <span className="glass-pill inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-red-600">
            Trusted by 1,200+ Donors
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 lg:text-7xl">
            Every Drop Saves a Life in Myanmar
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600 lg:text-lg">
            Real-time emergency blood coordination connecting hospitals like
            Yangon General Hospital with donor heroes across Sanchaung and beyond.
          </p>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="animate-float-cta group mt-8 flex min-h-[44px] items-center gap-2 rounded-full bg-red-600 px-8 py-4 font-semibold text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-95"
          >
            I Need Blood Now
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Right — visual with liquid glass overlay */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMG}
            alt="Blood donors at a Yangon hospital donation center"
            className="h-[500px] w-full rounded-3xl bg-slate-200 object-cover shadow-2xl shadow-slate-900/5"
          />
          {/* Apple Liquid Glass stat card — highest depth overlay */}
          <div className="glass-overlay absolute -bottom-8 left-2 w-72 rounded-2xl p-6 sm:-left-8">
            <p className="text-4xl font-extrabold text-gray-900">97%</p>
            <p className="mt-1 text-sm font-medium text-gray-600">
              of urgent requests matched within the hour
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PILL_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="glass-pill rounded-full px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Subtle light refraction highlight */}
            <div className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          </div>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </section>
  );
};
