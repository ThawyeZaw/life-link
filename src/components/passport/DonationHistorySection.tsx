"use client";

// src/components/donor/DonationHistorySection.tsx
// LifeLink — Donation impact, history, and recognitions
// Team Vertex Red

import {
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  HeartHandshake,
  Medal,
  Sparkles,
  Trophy,
} from "lucide-react";
import { clsx } from "clsx";

interface HistoryItem {
  id: string;
  date: string;
  type: string;
  hospital: string;
  status: "PROCESSED" | "PENDING";
}

interface DonationHistorySectionProps {
  livesSaved?: number;
  volumeLiters?: number;
  history?: HistoryItem[];
  onViewAll?: () => void;
  className?: string;
}

const DEFAULT_HISTORY: HistoryItem[] = [
  {
    id: "h1",
    date: "12 Mar 2024",
    type: "Whole Blood",
    hospital: "Yangon General Hospital (YGH)",
    status: "PROCESSED",
  },
  {
    id: "h2",
    date: "04 Jan 2024",
    type: "Urgent Response",
    hospital: "Asia Royal Hospital",
    status: "PROCESSED",
  },
  {
    id: "h3",
    date: "22 Sep 2023",
    type: "Power Red",
    hospital: "Thukha Yeik Mon Specialist Hospital",
    status: "PROCESSED",
  },
];

const RECOGNITIONS = [
  {
    icon: Trophy,
    eyebrow: "Response badge",
    title: "First Responder",
    description: "Answered 3 emergency dispatches",
    iconClassName: "bg-amber-100 text-amber-600",
    glowClassName: "bg-amber-200/70",
  },
  {
    icon: Droplets,
    eyebrow: "Volume badge",
    title: "1 Litre Club",
    description: "Reached a major donation milestone",
    iconClassName: "bg-red-100 text-red-600",
    glowClassName: "bg-red-200/60",
  },
] as const;

export function DonationHistorySection({
  livesSaved = 12,
  volumeLiters = 3.5,
  history = DEFAULT_HISTORY,
  onViewAll,
  className,
}: DonationHistorySectionProps) {
  const safeLivesSaved = Math.max(0, livesSaved);
  const safeVolumeLiters = Math.max(0, volumeLiters);

  return (
    <section
      className={clsx("space-y-5 pb-4", className)}
      aria-label="Donation history and recognitions"
    >
      <div className="mx-4 grid grid-cols-2 gap-3">
        <ImpactCard
          label="Lives saved"
          value={String(safeLivesSaved)}
          description="Estimated impact"
          icon={HeartHandshake}
          iconClassName="bg-emerald-100 text-emerald-600"
          glowClassName="bg-emerald-200/70"
        />

        <ImpactCard
          label="Volume donated"
          value={`${safeVolumeLiters.toFixed(1)}L`}
          description="Lifetime total"
          icon={Droplets}
          iconClassName="bg-red-100 text-red-600"
          glowClassName="bg-red-200/70"
        />
      </div>

      <div className="relative mx-4 overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
        <div
          aria-hidden="true"
          className="absolute -right-14 -top-16 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl"
        />

        <div className="relative flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0D1933] text-emerald-300 shadow-[0_10px_24px_rgba(13,25,51,0.16)]">
              <Droplets className="h-4.5 w-4.5" strokeWidth={2.4} />
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-600">
                Donation activity
              </p>

              <h2 className="mt-0.5 text-base font-black tracking-tight text-[#0D1933]">
                Recent History
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewAll}
            disabled={!onViewAll}
            className={clsx(
              "group inline-flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.08em] transition",
              onViewAll
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "cursor-default bg-slate-50 text-slate-400",
            )}
          >
            View all
            <ChevronRight
              className={clsx(
                "h-3.5 w-3.5 transition-transform",
                onViewAll && "group-hover:translate-x-0.5",
              )}
            />
          </button>
        </div>

        {history.length > 0 ? (
          <div className="relative divide-y divide-slate-100 px-5">
            {history.map((item, index) => (
              <HistoryRow key={item.id} item={item} isLatest={index === 0} />
            ))}
          </div>
        ) : (
          <EmptyHistory />
        )}

        <div className="relative flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Verified through LifeLink
            </p>
          </div>

          <span className="text-[9px] font-black text-slate-400">
            {history.length} record{history.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mx-4">
        <div className="mb-3 flex items-end justify-between gap-4 px-1">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />

              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-600">
                Donor achievements
              </p>
            </div>

            <h2 className="mt-1 text-base font-black tracking-tight text-[#0D1933]">
              Recognitions
            </h2>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-amber-700">
            <Sparkles className="h-3 w-3" />
            {RECOGNITIONS.length} earned
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RECOGNITIONS.map((recognition) => {
            const Icon = recognition.icon;

            return (
              <article
                key={recognition.title}
                className="group relative overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]"
              >
                <div
                  aria-hidden="true"
                  className={clsx(
                    "absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-70 blur-3xl",
                    recognition.glowClassName,
                  )}
                />

                <div className="relative flex items-center gap-3">
                  <span
                    className={clsx(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
                      recognition.iconClassName,
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.4} />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-400">
                      {recognition.eyebrow}
                    </p>

                    <h3 className="mt-1 text-sm font-black text-[#0D1933]">
                      {recognition.title}
                    </h3>

                    <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500">
                      {recognition.description}
                    </p>
                  </div>
                </div>

                <div className="relative mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Unlocked
                  </span>

                  <Medal className="h-4 w-4 text-slate-300" />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface ImpactCardProps {
  label: string;
  value: string;
  description: string;
  icon: typeof Droplets;
  iconClassName: string;
  glowClassName: string;
}

function ImpactCard({
  label,
  value,
  description,
  icon: Icon,
  iconClassName,
  glowClassName,
}: ImpactCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-[0_15px_40px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]">
      <div
        aria-hidden="true"
        className={clsx(
          "absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-70 blur-3xl",
          glowClassName,
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={clsx(
            "flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
            iconClassName,
          )}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2.5} />
        </span>

        <span className="rounded-full bg-slate-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
          Lifetime
        </span>
      </div>

      <div className="relative mt-5">
        <p className="text-2xl font-black tracking-tight text-[#0D1933] sm:text-3xl">
          {value}
        </p>

        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.11em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-[9px] font-medium text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}

interface HistoryRowProps {
  item: HistoryItem;
  isLatest: boolean;
}

function HistoryRow({ item, isLatest }: HistoryRowProps) {
  const isProcessed = item.status === "PROCESSED";

  return (
    <article className="group flex items-start gap-3 py-4">
      <div className="relative shrink-0">
        <span
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
            isProcessed
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600",
          )}
        >
          {isProcessed ? (
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.4} />
          ) : (
            <Clock3 className="h-5 w-5" strokeWidth={2.4} />
          )}
        </span>

        {isLatest && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-[#0D1933]">
              {item.type}
            </h3>

            <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-4 text-slate-500">
              {item.hospital}
            </p>
          </div>

          <span
            className={clsx(
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.09em]",
              isProcessed
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-amber-100 bg-amber-50 text-amber-700",
            )}
          >
            {isProcessed ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock3 className="h-3 w-3" />
            )}
            {item.status}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          {item.date}
        </div>
      </div>
    </article>
  );
}

function EmptyHistory() {
  return (
    <div className="relative flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Droplets className="h-6 w-6" />
      </span>

      <h3 className="mt-4 text-sm font-black text-[#0D1933]">
        No donations recorded yet
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
        Your completed donations and emergency responses will appear here.
      </p>
    </div>
  );
}
