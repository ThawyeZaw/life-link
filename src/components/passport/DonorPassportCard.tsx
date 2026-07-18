"use client";

// src/components/donor/DonorPassportCard.tsx
// LifeLink — Premium donor passport identity card
// Team Vertex Red

import {
  Award,
  CheckCircle2,
  Droplets,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

import type { Profile } from "@/utils/supabase";

interface DonorPassportCardProps {
  profile: Profile;
  donationCount?: number;
  className?: string;
}

type HeroLevel = "BRONZE" | "SILVER" | "GOLD";

const HERO_LEVEL_CONFIG: Record<
  HeroLevel,
  {
    label: string;
    badge: string;
    icon: string;
  }
> = {
  BRONZE: {
    label: "Bronze Hero",
    badge: "border-amber-200/30 bg-amber-300/15 text-amber-100",
    icon: "text-amber-200",
  },
  SILVER: {
    label: "Silver Hero",
    badge: "border-slate-200/30 bg-slate-200/15 text-slate-100",
    icon: "text-slate-200",
  },
  GOLD: {
    label: "Gold Hero",
    badge: "border-yellow-200/30 bg-yellow-300/15 text-yellow-100",
    icon: "text-yellow-200",
  },
};

const getHeroLevel = (donations: number): HeroLevel => {
  if (donations >= 20) return "GOLD";
  if (donations >= 10) return "SILVER";
  return "BRONZE";
};

const getMemberYear = (createdAt: string) => {
  const date = new Date(createdAt);

  return Number.isNaN(date.getTime()) ? "—" : date.getFullYear();
};

const getDonorLabel = (bloodType?: string | null) => {
  if (bloodType === "O-") return "Universal red cell donor";
  if (bloodType === "AB+") return "Universal plasma recipient";
  if (bloodType) return "Verified blood donor";
  return "Blood type pending";
};

export function DonorPassportCard({
  profile,
  donationCount = 0,
  className,
}: DonorPassportCardProps) {
  const safeDonationCount = Math.max(0, donationCount);
  const heroLevel = getHeroLevel(safeDonationCount);
  const heroConfig = HERO_LEVEL_CONFIG[heroLevel];
  const memberYear = getMemberYear(profile.created_at);
  const bloodType = profile.blood_type ?? "—";
  const donorId = profile.id
    ? profile.id.replace(/-/g, "").slice(0, 12).toUpperCase()
    : "PENDING";

  return (
    <article
      className={clsx(
        "relative mx-4 overflow-hidden rounded-[2rem] border border-white/20",
        "bg-gradient-to-br from-[#0F8F72] via-[#087968] to-[#0D4F52]",
        "p-5 text-white shadow-[0_28px_80px_rgba(8,121,104,0.3)] sm:p-6",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.08)_42%,transparent_58%)]"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-100 backdrop-blur">
                <Droplets className="h-3.5 w-3.5" />
                Donor passport
              </span>

              <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.07] px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white/70 sm:inline-flex">
                <Sparkles className="h-3 w-3" />
                LifeLink
              </span>
            </div>

            <h2 className="mt-3 truncate text-2xl font-black tracking-tight sm:text-3xl">
              {profile.full_name}
            </h2>

            <p className="mt-1 text-xs font-semibold text-emerald-100/80">
              Member since {memberYear}
            </p>
          </div>

          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/20 bg-white/15 text-white shadow-[0_12px_35px_rgba(0,0,0,0.15)] backdrop-blur">
              <Droplets className="h-7 w-7 fill-current" />
            </div>

            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-[#0B695F] bg-white text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.8} />
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-100/65">
              Hero level
            </p>

            <div
              className={clsx(
                "mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
                heroConfig.badge,
              )}
            >
              <Award
                className={clsx("h-4 w-4", heroConfig.icon)}
                strokeWidth={2.4}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                {heroConfig.label}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-100/65">
              Blood type
            </p>

            <p className="mt-1 text-4xl font-black leading-none tracking-tight text-white sm:text-5xl">
              {bloodType}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <PassportMetric
            icon={ShieldCheck}
            eyebrow="Identity"
            title="Verified donor"
            description={`ID ${donorId}`}
          />

          <PassportMetric
            icon={Heart}
            eyebrow="Impact"
            title={`${safeDonationCount} ${
              safeDonationCount === 1 ? "donation" : "donations"
            }`}
            description={getDonorLabel(profile.blood_type)}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/15 pt-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-200 opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-200" />
            </span>

            <p className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-emerald-100/75">
              Eligible donor profile active
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.08] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-white/70">
            Secure ID
          </span>
        </div>
      </div>
    </article>
  );
}

interface PassportMetricProps {
  icon: typeof ShieldCheck;
  eyebrow: string;
  title: string;
  description: string;
}

function PassportMetric({
  icon: Icon,
  eyebrow,
  title,
  description,
}: PassportMetricProps) {
  return (
    <div className="group rounded-[1.35rem] border border-white/15 bg-white/10 p-3.5 backdrop-blur transition hover:bg-white/[0.14]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-emerald-100 transition-transform group-hover:scale-105">
          <Icon className="h-4.5 w-4.5" strokeWidth={2.4} />
        </span>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.13em] text-emerald-100/60">
            {eyebrow}
          </p>

          <p className="mt-1 truncate text-xs font-black text-white">{title}</p>

          <p className="mt-1 truncate text-[9px] font-medium text-emerald-100/70">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
