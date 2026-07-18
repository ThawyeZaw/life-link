// src/components/command/LiveFeed.tsx
// LifeLink — Real-time command activity feed
// Team Vertex Red

import {
  Activity,
  BellRing,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Radio,
} from "lucide-react";
import { clsx } from "clsx";

interface FeedItem {
  id: string;
  text: string;
  time: string;
}

interface LiveFeedProps {
  items: FeedItem[];
}

type FeedTone = "success" | "alert" | "message" | "system";

function getFeedTone(text: string): FeedTone {
  const normalizedText = text.toLowerCase();

  if (
    normalizedText.includes("accepted") ||
    normalizedText.includes("confirmed") ||
    normalizedText.includes("completed") ||
    normalizedText.includes("arrived")
  ) {
    return "success";
  }

  if (
    normalizedText.includes("critical") ||
    normalizedText.includes("urgent") ||
    normalizedText.includes("alert") ||
    normalizedText.includes("needed")
  ) {
    return "alert";
  }

  if (
    normalizedText.includes("broadcast") ||
    normalizedText.includes("request") ||
    normalizedText.includes("notification")
  ) {
    return "message";
  }

  return "system";
}

const FEED_STYLES = {
  success: {
    icon: CheckCircle2,
    iconWrapper: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
    label: "Response",
  },
  alert: {
    icon: BellRing,
    iconWrapper: "bg-red-50 text-red-600",
    dot: "bg-red-500",
    label: "Priority",
  },
  message: {
    icon: MessageSquare,
    iconWrapper: "bg-blue-50 text-blue-600",
    dot: "bg-blue-500",
    label: "Dispatch",
  },
  system: {
    icon: Activity,
    iconWrapper: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
    label: "System",
  },
} as const;

export function LiveFeed({ items }: LiveFeedProps) {
  if (items.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Radio className="h-6 w-6" />
        </div>

        <h3 className="mt-4 text-sm font-black text-[#0D1933]">
          No live activity yet
        </h3>

        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
          Donor responses, hospital updates, and dispatch activity will appear
          here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="relative px-4 py-4 sm:px-5">
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-[35px] top-6 w-px bg-gradient-to-b from-emerald-200 via-slate-200 to-transparent sm:left-[39px]"
      />

      <div className="space-y-2">
        {items.map((item, index) => {
          const tone = getFeedTone(item.text);
          const styles = FEED_STYLES[tone];
          const Icon = styles.icon;
          const isLatest = index === 0;

          return (
            <article
              key={item.id}
              className={clsx(
                "group relative flex items-start gap-3 rounded-2xl border p-3 transition-all duration-300 sm:gap-4 sm:p-4",
                isLatest
                  ? "border-emerald-100 bg-emerald-50/50 shadow-[0_10px_30px_rgba(16,185,129,0.06)]"
                  : "border-transparent bg-white hover:border-slate-100 hover:bg-slate-50",
              )}
            >
              <div className="relative z-10 shrink-0">
                <div
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105",
                    styles.iconWrapper,
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.4} />
                </div>

                {isLatest && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                    <span
                      className={clsx(
                        "absolute inline-flex h-full w-full animate-ping rounded-full opacity-50",
                        styles.dot,
                      )}
                    />
                    <span
                      className={clsx(
                        "relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white",
                        styles.dot,
                      )}
                    />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={clsx(
                      "rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]",
                      tone === "success" && "bg-emerald-100 text-emerald-700",
                      tone === "alert" && "bg-red-100 text-red-700",
                      tone === "message" && "bg-blue-100 text-blue-700",
                      tone === "system" && "bg-slate-100 text-slate-500",
                    )}
                  >
                    {styles.label}
                  </span>

                  {isLatest && (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-600">
                      <Radio className="h-3 w-3" />
                      Latest
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm font-semibold leading-6 text-[#0D1933]">
                  {item.text}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <Clock3 className="h-3.5 w-3.5" />
                  {item.time}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>

          <p className="text-xs font-bold text-slate-600">
            Live network monitoring
          </p>
        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500 shadow-sm">
          {items.length} {items.length === 1 ? "event" : "events"}
        </span>
      </div>
    </div>
  );
}
