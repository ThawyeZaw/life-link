// ⚠️ CROSS-BOUNDARY: This file is in Thinzar's domain (/components/) but was created
// as companion to the /app/map/ page for the interactive map feature.
// Thinzar Kyaw — Frontend Domain.

"use client";

import type { BloodType, Urgency } from "@/utils/supabase/types";

// ============================================================================
// Types
// ============================================================================

export interface MapHospital {
  id: string;
  name: string;
  name_mya: string | null;
  township: string | null;
  address: string | null;
  phone: string | null;
  lat: number;
  lng: number;
}

export interface MapRequest {
  id: string;
  blood_type: BloodType | null;
  units_needed: number;
  urgency: Urgency;
  township: string | null;
  lat: number | null;
  lng: number | null;
  hospital_name: string | null;
}

export interface MapDonor {
  id: string;
  blood_type: BloodType;
  township: string | null;
  lat: number;
  lng: number;
}

export interface MapDataResponse {
  hospitals: MapHospital[];
  requests: MapRequest[];
  donors: MapDonor[];
}

/** View mode toggle for the map */
export type ViewMode = "need_blood" | "want_donate";

/** Matched donor result from /api/match-donors */
export interface MatchedDonor {
  id: string;
  full_name: string;
  phone: string | null;
  blood_type: string;
  township: string | null;
  distance_km: number;
  compatibility_score: number;
  lat: number | null;
  lng: number | null;
  last_donation_date: string | null;
  match_reason: string | null;
}

/** Props for the self-contained MapView (thin integration surface) */
export interface MapViewProps {
  mapboxToken: string;
}

// ============================================================================
// Constants
// ============================================================================

export const URGENCY_STYLES: Record<
  Urgency,
  { bg: string; text: string; pin: string }
> = {
  CRITICAL: {
    bg: "bg-red-50",
    text: "text-red-600",
    pin: "#DC2626",
  },
  URGENT: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    pin: "#D97706",
  },
  STANDARD: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    pin: "#2563EB",
  },
};

export const BLOOD_TYPE_COLORS: Record<string, string> = {
  "O+": "#16A34A",
  "O-": "#15803D",
  "A+": "#2563EB",
  "A-": "#1D4ED8",
  "B+": "#7C3AED",
  "B-": "#6D28D9",
  "AB+": "#DC2626",
  "AB-": "#B91C1C",
};

export const HOSPITAL_PIN_COLOR = "#0D1933";

// ============================================================================
// Marker HTML Helpers
// ============================================================================

export function createHospitalMarkerSVG(size: number = 36): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="${HOSPITAL_PIN_COLOR}" stroke="white" stroke-width="2.5"/>
      <path d="M9 22V12H15V22" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 9L12 2L21 9V22H3V9Z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 12H15" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="12" cy="8" r="1.2" fill="white"/>
    </svg>`;
}

export function createDonorDotSVG(bloodType: string, size: number = 24): string {
  const color = BLOOD_TYPE_COLORS[bloodType] || "#6B7280";
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2.5" opacity="0.9"/>
      <text x="12" y="16" text-anchor="middle" fill="white" font-size="9" font-weight="bold" font-family="system-ui, sans-serif">${bloodType}</text>
    </svg>`;
}

// ============================================================================
// Matched donor + connection line helpers
// ============================================================================

export const MATCHED_DONOR_COLOR = "#10B981"; // emerald for matched donors
export const CONNECTION_LINE_COLOR = "#6366F1"; // indigo for match lines
export const CONNECTION_LINE_OPACITY = 0.6;
export const CONNECTION_LINE_WIDTH = 2;

/** Create an SVG marker for a matched donor (with compatibility badge) */
export function createMatchedDonorSVG(
  bloodType: string,
  score: number,
  size: number = 28,
): string {
  const color = BLOOD_TYPE_COLORS[bloodType] || "#6B7280";
  const ringColor = MATCHED_DONOR_COLOR;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="13" fill="${ringColor}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="9" fill="${color}" stroke="white" stroke-width="1.5"/>
      <text x="14" y="17.5" text-anchor="middle" fill="white" font-size="8" font-weight="bold" font-family="system-ui, sans-serif">${bloodType}</text>
      <text x="14" y="28" text-anchor="middle" fill="${ringColor}" font-size="7" font-weight="bold" font-family="system-ui, sans-serif">${Math.round(score)}%</text>
    </svg>`;
}
