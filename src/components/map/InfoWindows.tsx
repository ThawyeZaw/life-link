"use client";

// src/components/map/InfoWindows.tsx
// LifeLink — Info window content for map markers
// Thinzar Kyaw — Frontend Domain

import {
  MapPin,
  Phone,
  Droplets,
  ExternalLink,
  Loader2,
  Sparkles,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { URGENCY_STYLES, BLOOD_TYPE_COLORS, MATCHED_DONOR_COLOR } from "./mapTypes";
import type { MapHospital, MapRequest, MapDonor, MatchedDonor } from "./mapTypes";

// ============================================================================
// Hospital Info Window
// ============================================================================

export function HospitalInfoContent({ hospital }: { hospital: MapHospital }) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}&destination_place=${encodeURIComponent(hospital.name)}`;

  return (
    <div className="min-w-[220px] max-w-[280px]">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0D1933]">
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#0D1933] leading-tight">
            {hospital.name}
          </p>
          {hospital.name_mya && (
            <p className="text-xs text-slate-400 mt-0.5">{hospital.name_mya}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-1.5">
        {hospital.township && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>{hospital.township}</span>
          </div>
        )}
        {hospital.phone && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Phone className="h-3 w-3 shrink-0" />
            <span>{hospital.phone}</span>
          </div>
        )}
      </div>

      {/* Directions button */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-[#0D1933] py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Get Directions
      </a>
    </div>
  );
}

// ============================================================================
// Request Info Window
// ============================================================================

interface RequestInfoContentProps {
  request: MapRequest;
  matchingLoading: boolean;
  hasMatches: boolean;
  onFindDonors: () => void;
  onClearMatches: () => void;
}

export function RequestInfoContent({
  request,
  matchingLoading,
  hasMatches,
  onFindDonors,
  onClearMatches,
}: RequestInfoContentProps) {
  const styles = request.urgency ? URGENCY_STYLES[request.urgency] : URGENCY_STYLES.STANDARD;

  return (
    <div className="min-w-[200px] max-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider",
            styles.bg,
            styles.text,
          )}
        >
          {request.urgency}
        </span>
        {request.blood_type && (
          <span className="text-sm font-black" style={{ color: BLOOD_TYPE_COLORS[request.blood_type] || "#6B7280" }}>
            {request.blood_type}
          </span>
        )}
      </div>

      {/* Hospital */}
      {request.hospital_name && (
        <p className="mt-2 text-xs font-semibold text-slate-700">
          {request.hospital_name}
        </p>
      )}

      {/* Details */}
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3" />
          <span className="font-bold">{request.units_needed} units</span>
        </div>
        {request.township && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{request.township}</span>
          </div>
        )}
      </div>

      {/* ---- Matching engine button ---- */}
      <div className="mt-3">
        {hasMatches ? (
          <button
            type="button"
            onClick={onClearMatches}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Matched — tap to clear
          </button>
        ) : (
          <button
            type="button"
            onClick={onFindDonors}
            disabled={matchingLoading}
            className={clsx(
              "flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors",
              matchingLoading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700",
            )}
          >
            {matchingLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Finding donors...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Find Matching Donors
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Donor Info Window
// ============================================================================

export function DonorInfoContent({ donor }: { donor: MapDonor }) {
  return (
    <div className="min-w-[140px] max-w-[180px]">
      {/* Blood type chip */}
      <div className="flex items-center gap-2">
        <span
          className="rounded-lg px-2.5 py-1 text-sm font-black text-white"
          style={{ backgroundColor: BLOOD_TYPE_COLORS[donor.blood_type] || "#6B7280" }}
        >
          {donor.blood_type}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Donor
        </span>
      </div>

      {donor.township && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{donor.township}</span>
        </div>
      )}

      <p className="mt-2 text-[10px] text-slate-400">
        Available for donation
      </p>
    </div>
  );
}

// ============================================================================
// Matched Donor Info Window
// ============================================================================

export function MatchedDonorInfoContent({ donor }: { donor: MatchedDonor }) {
  return (
    <div className="min-w-[180px] max-w-[240px]">
      {/* Header row: blood type + compatibility */}
      <div className="flex items-center justify-between">
        <span
          className="rounded-lg px-2.5 py-1 text-sm font-black text-white"
          style={{ backgroundColor: BLOOD_TYPE_COLORS[donor.blood_type] || "#6B7280" }}
        >
          {donor.blood_type}
        </span>
        <div className="flex items-center gap-1 text-xs font-bold" style={{ color: MATCHED_DONOR_COLOR }}>
          <TrendingUp className="h-3 w-3" />
          {Math.round(donor.compatibility_score)}% match
        </div>
      </div>

      {/* Name */}
      <p className="mt-2 text-sm font-bold text-slate-800">
        {donor.full_name}
      </p>

      {/* Details */}
      <div className="mt-2 space-y-1">
        {donor.township && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>{donor.township}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Droplets className="h-3 w-3 shrink-0" />
          <span>{donor.distance_km.toFixed(1)} km away</span>
        </div>
        {donor.match_reason && (
          <p className="text-[10px] italic text-slate-400 mt-1">
            {donor.match_reason}
          </p>
        )}
      </div>
    </div>
  );
}
