"use client";

// src/components/navigation/DonorTopBar.tsx
// LifeLink — Donor-facing top navigation
// Team Vertex Red

import Link from "next/link";
import { Bell, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { clsx } from "clsx";

interface DonorTopBarProps {
  title: string;
  subtitle?: string;
  notificationCount?: number;
  className?: string;
}

export function DonorTopBar({
  title,
  subtitle,
  notificationCount = 0,
  className,
}: DonorTopBarProps) {
  const visibleNotificationCount =
    notificationCount > 99 ? "99+" : notificationCount.toString();

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 border-b border-white/70 bg-white/90 backdrop-blur-2xl",
        className,
      )}
    >
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-4 overflow-hidden px-5 py-4 sm:px-6">
        <div
          aria-hidden="true"
          className="absolute -left-12 -top-16 h-36 w-36 rounded-full bg-emerald-100/70 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -right-10 -top-16 h-36 w-36 rounded-full bg-blue-100/60 blur-3xl"
        />

        <div className="relative flex min-w-0 items-center gap-3">
          <Link
            href="/passport"
            aria-label="Go to donor passport"
            className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0D1933] text-white shadow-[0_10px_28px_rgba(13,25,51,0.18)] transition hover:-translate-y-0.5 hover:bg-[#192A4F]"
          >
            <HeartPulse
              className="h-5 w-5 text-emerald-300 transition-transform group-hover:scale-110"
              strokeWidth={2.5}
            />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-black tracking-tight text-[#0D1933] sm:text-xl">
                {title}
              </h1>

              <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-emerald-700 sm:inline-flex">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            </div>

            {subtitle ? (
              <p className="mt-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm">
                {subtitle}
              </p>
            ) : (
              <div className="mt-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Donor network active
              </div>
            )}
          </div>
        </div>

        <div className="relative flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white/80 px-3 py-2 shadow-sm sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />

            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                LifeLink
              </p>
              <p className="text-[10px] font-bold text-[#0D1933]">
                Save lives today
              </p>
            </div>
          </div>

          <Link
            href="/passport#notifications"
            aria-label={
              notificationCount > 0
                ? `${notificationCount} unread notifications`
                : "Open notifications"
            }
            className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-slate-200 hover:text-[#0D1933] hover:shadow-[0_12px_30px_rgba(15,23,42,0.1)]"
          >
            <Bell
              className="h-5 w-5 transition-transform group-hover:rotate-6"
              strokeWidth={2.2}
            />

            {notificationCount > 0 && (
              <>
                <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
                </span>

                <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] font-black text-white shadow-lg">
                  {visibleNotificationCount}
                </span>
              </>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
