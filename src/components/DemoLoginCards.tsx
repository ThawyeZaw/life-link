"use client";

// DemoLoginCards — Developer Demo Login cards (Hospital Admin / Donor Hero)
// Shared by AuthModal and the dedicated /login page.
// Thinzar Kyaw — Frontend Domain

import { Building2, Heart, Loader2, Zap } from "lucide-react";
import type { DemoRole } from "@/utils/session";

export interface DemoProfile {
  key: DemoRole;
  role: string;
  email: string;
  password: string;
  context: string;
  icon: typeof Building2;
}

export const DEMO_PROFILES: DemoProfile[] = [
  {
    key: "hospital",
    role: "Hospital Admin",
    email: "hospital.demo@ygh.gov.mm",
    password: "hospital123",
    context: "Yangon General Hospital",
    icon: Building2,
  },
  {
    key: "donor",
    role: "Donor Hero (O+)",
    email: "koaung.demo@gmail.com",
    password: "donor123",
    context: "Sanchaung Township, Yangon",
    icon: Heart,
  },
];

interface DemoLoginCardsProps {
  loadingKey: string | null;
  disabled: boolean;
  onLogin: (profile: DemoProfile) => void;
}

export const DemoLoginCards = ({
  loadingKey,
  disabled,
  onLogin,
}: DemoLoginCardsProps) => (
  <div className="mt-6 border-t border-gray-100 pt-5">
    <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-gray-500">
      <Zap className="h-4 w-4 text-amber-500" />
      Developer Demo Login
    </p>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {DEMO_PROFILES.map((profile) => {
        const Icon = profile.icon;
        const isLoading = loadingKey === profile.key;
        return (
          <button
            key={profile.key}
            type="button"
            onClick={() => onLogin(profile)}
            disabled={disabled}
            className="flex min-h-[44px] flex-col items-start gap-1 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-vr-navy">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
              ) : (
                <Icon className="h-4 w-4 text-red-600" />
              )}
              {isLoading ? "Signing in…" : `Login as ${profile.role}`}
            </span>
            <span className="text-xs text-gray-500">{profile.context}</span>
            <span className="font-mono text-xs text-gray-400">
              {profile.email}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);
