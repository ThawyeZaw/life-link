"use client";

// src/components/map/MapLegend.tsx
// LifeLink — Map toggle controls, view mode selector, and urgency legend
// Team Vertex Red

import { clsx } from "clsx";
import {
  Building2,
  AlertTriangle,
  Droplets,
  Eye,
  EyeOff,
  Search,
  Heart,
  X,
} from "lucide-react";
import { URGENCY_STYLES } from "./mapTypes";
import type { ViewMode } from "./mapTypes";

interface MapLegendProps {
  showHospitals: boolean;
  showRequests: boolean;
  showDonors: boolean;
  viewMode: ViewMode;
  onToggleHospitals: () => void;
  onToggleRequests: () => void;
  onToggleDonors: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  matchingActive: boolean;
  onClearMatches: () => void;
}

export function MapLegend({
  showHospitals,
  showRequests,
  showDonors,
  viewMode,
  onToggleHospitals,
  onToggleRequests,
  onToggleDonors,
  onViewModeChange,
  matchingActive,
  onClearMatches,
}: MapLegendProps) {
  return (
    <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2 sm:left-auto sm:right-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      {/* ---- View mode toggle ---- */}
      <div className="flex self-start rounded-2xl border border-white/70 bg-white/90 p-1 shadow-lg backdrop-blur sm:self-auto">
        <button
          type="button"
          onClick={() => onViewModeChange("need_blood")}
          className={clsx(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all",
            viewMode === "need_blood"
              ? "bg-[#0D1933] text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">I need blood</span>
          <span className="sm:hidden">Need</span>
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("want_donate")}
          className={clsx(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all",
            viewMode === "want_donate"
              ? "bg-red-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          <Heart className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">I want to donate</span>
          <span className="sm:hidden">Donate</span>
        </button>
      </div>

      {/* ---- Layer toggles ---- */}
      <ToggleButton
        active={showHospitals}
        onClick={onToggleHospitals}
        icon={<Building2 className="h-3.5 w-3.5" />}
        label="Hospitals"
      />
      <ToggleButton
        active={showRequests}
        onClick={onToggleRequests}
        icon={<AlertTriangle className="h-3.5 w-3.5" />}
        label="Requests"
      />
      <ToggleButton
        active={showDonors}
        onClick={onToggleDonors}
        icon={<Droplets className="h-3.5 w-3.5" />}
        label="Donors"
      />

      {/* ---- Urgency legend dots ---- */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 shadow-lg backdrop-blur">
        {(["CRITICAL", "URGENT", "STANDARD"] as const).map((u) => (
          <div key={u} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: URGENCY_STYLES[u].pin }}
            />
            <span className="text-[9px] font-bold text-slate-500">
              {u === "STANDARD" ? "STD" : u.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>

      {/* ---- Clear matches button ---- */}
      {matchingActive && (
        <button
          type="button"
          onClick={onClearMatches}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/95 px-2.5 text-[11px] font-bold text-indigo-600 shadow-lg backdrop-blur transition hover:bg-indigo-100"
        >
          <X className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear matches</span>
        </button>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-[11px] font-bold transition-all shadow-lg backdrop-blur",
        active
          ? "border-white/60 bg-white text-slate-800"
          : "border-white/40 bg-white/60 text-slate-400",
      )}
    >
      {active ? icon : <EyeOff className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
