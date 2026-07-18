// Public marketing landing page — assembles modular marketing sections
// Thinzar Kyaw — Frontend Domain
// Navbar (floating pill) is rendered site-wide via root layout

import { Droplets } from "lucide-react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeatureSection } from "@/components/marketing/FeatureSection";
import { ValuesTabs } from "@/components/marketing/ValuesTabs";
import { CommunityStories } from "@/components/marketing/CommunityStories";

export const metadata: Metadata = {
  title: "LifeLink — Emergency Blood Donor Platform Myanmar",
  description:
    "Real-time emergency platform connecting blood donors, hospitals, and urgent medical needs across Myanmar.",
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-water-gradient">
      <HeroSection />
      <FeatureSection />
      <ValuesTabs />
      <CommunityStories />

      {/* Footer */}
      <footer className="px-6 pb-8 text-center">
        <p className="text-xs text-slate-400">
          Built with <Droplets className="inline h-3 w-3 text-red-500" /> for Myanmar · LifeLink Hackathon 2026
        </p>
      </footer>
    </main>
  );
}
