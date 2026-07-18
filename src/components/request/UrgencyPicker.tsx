"use client";

import { URGENCY_META } from "@/lib/blood";
import type { Urgency } from "@/lib/types";
import { Siren, Clock, CalendarDays } from "lucide-react";

const ICONS: Record<Urgency, React.ReactNode> = {
  CRITICAL: <Siren className="h-4 w-4" />,
  URGENT: <Clock className="h-4 w-4" />,
  STANDARD: <CalendarDays className="h-4 w-4" />,
};

export const UrgencyPicker = ({
  value,
  onChange,
}: {
  value: Urgency;
  onChange: (u: Urgency) => void;
}) => (
  <div className="grid grid-cols-3 gap-2">
    {(Object.keys(URGENCY_META) as Urgency[]).map((u) => (
      <button
        key={u}
        type="button"
        onClick={() => onChange(u)}
        className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-colors ${
          value === u
            ? u === "CRITICAL"
              ? "border-red-600 bg-red-600 text-white"
              : u === "URGENT"
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-slate-600 bg-slate-600 text-white"
            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        {ICONS[u]}
        {URGENCY_META[u].label}
      </button>
    ))}
  </div>
);
