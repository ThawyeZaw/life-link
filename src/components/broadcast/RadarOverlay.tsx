"use client";

// ⚠️ CROSS-BOUNDARY: This file is in Thinzar's domain (/components/)
// but consumes data from Thaw Ye Zaw's matching engine API routes.
// Thinzar Kyaw — Frontend Domain.
//
// Radar overlay with sweep-line reveal: dots light up sequentially as the
// rotating sweep line passes their angular position on the map.

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { clsx } from "clsx";
import { MapPin, Droplets, Building2, Wifi } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface RadarMatch {
  id: string;
  name: string;
  distanceKm: number;
  bloodType: string;
  township: string | null;
  compatibilityScore: number;
  lat: number;
  lng: number;
  matchReason: string | null;
  /** Whether this is a hospital (reverse match) or donor (forward match) */
  type: "donor" | "hospital";
  /** For hospital matches */
  unitsNeeded?: number;
  urgency?: string;
  /** Timestamp when this match was added (for instant reveal of live matches) */
  addedAt?: number;
}

export interface RadarOverlayProps {
  matches: RadarMatch[];
  centerLat: number;
  centerLng: number;
  isScanning: boolean;
  onMatchClick?: (match: RadarMatch) => void;
  directionLabel: string;
}

// ============================================================================
// Constants
// ============================================================================

const SWEEP_DURATION_MS = 4000; // One full rotation
const MAX_DISPLAY_RADIUS_KM = 100;
const RADAR_SIZE_VW = 70; // % of viewport width

const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: "#EF4444",
  URGENT: "#F59E0B",
  STANDARD: "#3B82F6",
};

// ============================================================================
// Component
// ============================================================================

export const RadarOverlay = ({
  matches,
  centerLat,
  centerLng,
  isScanning,
  onMatchClick,
  directionLabel,
}: RadarOverlayProps) => {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [newMatchIds, setNewMatchIds] = useState<Set<string>>(new Set());
  const sweepStartRef = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMatchCount = useRef(matches.length);

  // ---- Track sweep angle via requestAnimationFrame ----
  useEffect(() => {
    if (!isScanning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - sweepStartRef.current;
      const angle = ((elapsed % SWEEP_DURATION_MS) / SWEEP_DURATION_MS) * 360;
      setSweepAngle(angle);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isScanning]);

  // ---- Compute match angles and sort clockwise ----
  const matchAngles = useMemo(() => {
    return matches.map((match) => {
      const dlat = match.lat - centerLat;
      const dlng = match.lng - centerLng;
      // atan2 returns angle from positive x-axis; convert to clockwise from top (12 o'clock = 0)
      let angleDeg = (Math.atan2(dlng, dlat) * 180) / Math.PI;
      // Normalize to 0-360 clockwise from top
      angleDeg = (90 - angleDeg + 360) % 360;
      return { id: match.id, angle: angleDeg, match };
    });
  }, [matches, centerLat, centerLng]);

  // ---- Reveal dots as sweep passes their angular position ----
  useEffect(() => {
    if (!isScanning) return;

    const newRevealed = new Set(revealedIds);

    for (const { id, angle } of matchAngles) {
      if (newRevealed.has(id)) continue;

      // A dot is revealed when the sweep has passed its angle
      // (sweep started at 0 and has now rotated past the dot's angle, or wrapped around)
      const sweepNorm = sweepAngle % 360;
      const wrapped = sweepAngle >= 360 && sweepNorm < angle; // sweep wrapped past this angle in a previous rotation
      const passed = sweepNorm >= angle;

      if (wrapped || passed) {
        newRevealed.add(id);
      }
    }

    if (newRevealed.size !== revealedIds.size) {
      setRevealedIds(newRevealed);
    }
  }, [sweepAngle, matchAngles, isScanning, revealedIds]);

  // ---- Detect new live matches (appear instantly) ----
  useEffect(() => {
    if (matches.length > prevMatchCount.current) {
      const newIds = new Set<string>();
      const existingIds = new Set(matchAngles.map((m) => m.id));

      // Find newly added matches by comparing with previous count
      const newMatches = matches.slice(prevMatchCount.current);
      for (const m of newMatches) {
        newIds.add(m.id);
      }

      setNewMatchIds(newIds);
      // Clear "new" highlight after animation
      const timer = setTimeout(() => setNewMatchIds(new Set()), 1500);
      prevMatchCount.current = matches.length;
      return () => clearTimeout(timer);
    }
    prevMatchCount.current = matches.length;
  }, [matches, matchAngles]);

  // ---- Pixel position from lat/lng ----
  const matchToPixel = useCallback(
    (match: RadarMatch) => {
      const dlat = match.lat - centerLat;
      const dlng = match.lng - centerLng;
      const angleRad = Math.atan2(dlng, dlat);
      const distRatio = Math.min(match.distanceKm / MAX_DISPLAY_RADIUS_KM, 0.94);

      // Use percentage-based sizing relative to container
      const centerPct = 50;
      const radiusPct = 35; // percentage

      const x = centerPct + Math.sin(angleRad) * radiusPct * distRatio;
      const y = centerPct - Math.cos(angleRad) * radiusPct * distRatio;

      return { x: `${x}%`, y: `${y}%` };
    },
    [centerLat, centerLng],
  );

  // ---- Determine dot state for rendering ----
  const getDotState = (id: string): "hidden" | "revealing" | "visible" | "new" => {
    if (newMatchIds.has(id)) return "new";
    if (!revealedIds.has(id)) return "hidden";
    // Check if recently revealed (within last 2 sweep cycles)
    const matchAng = matchAngles.find((m) => m.id === id);
    if (!matchAng) return "visible";

    const angleDiff = ((sweepAngle % 360) - matchAng.angle + 360) % 360;
    if (angleDiff < 30) return "revealing";
    return "visible";
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
    >
      {/* Tinted overlay */}
      <div className="absolute inset-0 bg-[#07101F]/25" />

      {/* Radar circle container — sized relative to viewport */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: `min(${RADAR_SIZE_VW}vw, ${RADAR_SIZE_VW}vh, 500px)`,
          height: `min(${RADAR_SIZE_VW}vw, ${RADAR_SIZE_VW}vh, 500px)`,
        }}
      >
        {/* ---- Concentric range rings ---- */}
        {[100, 75, 50, 25].map((pct) => (
          <div
            key={pct}
            className="absolute rounded-full border border-emerald-400/10"
            style={{
              width: `${pct}%`,
              height: `${pct}%`,
              top: `${(100 - pct) / 2}%`,
              left: `${(100 - pct) / 2}%`,
            }}
          />
        ))}

        {/* ---- Crosshair lines ---- */}
        <div className="absolute left-1/2 top-0 h-full w-px bg-emerald-400/6" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-emerald-400/6" />

        {/* ---- Expanding pulse rings ---- */}
        {isScanning && (
          <>
            <div
              className="absolute inset-0 rounded-full border-2 border-emerald-400/25"
              style={{ animation: "radar-pulse 3s ease-out infinite" }}
            />
            <div
              className="absolute inset-0 rounded-full border border-emerald-400/15"
              style={{ animation: "radar-pulse 3s ease-out 1s infinite" }}
            />
            <div
              className="absolute inset-0 rounded-full border border-emerald-400/8"
              style={{ animation: "radar-pulse 3s ease-out 2s infinite" }}
            />
          </>
        )}

        {/* ---- Outer glow ---- */}
        <div className="absolute inset-0 rounded-full shadow-[0_0_80px_15px_rgba(16,185,129,0.12)]" />

        {/* ---- Sweep line with gradient ---- */}
        {isScanning && (
          <div
            className="absolute left-1/2 top-0 h-1/2 w-[3px] origin-bottom"
            style={{
              transform: `rotate(${sweepAngle}deg)`,
              background:
                "linear-gradient(to top, rgba(16,185,129,0.9), rgba(16,185,129,0.4) 40%, rgba(16,185,129,0.05) 80%, transparent)",
              boxShadow: "0 0 12px 2px rgba(16,185,129,0.5)",
              marginLeft: -1.5,
            }}
          />
        )}

        {/* ---- Sweep trail glow (green wedge behind sweep) ---- */}
        {isScanning && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from ${sweepAngle - 30}deg, transparent 0deg, rgba(16,185,129,0.06) 20deg, rgba(16,185,129,0.02) 30deg, transparent 30deg)`,
            }}
          />
        )}

        {/* ---- Center pulse ---- */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-full bg-emerald-400/10"
              style={{
                width: "12%",
                height: "12%",
                animation: "radar-pulse 1.5s ease-out infinite",
              }}
            />
          </div>
        )}

        {/* ---- Center point ---- */}
        <div className="pointer-events-auto absolute z-30 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.7),0_0_80px_rgba(16,185,129,0.3)]">
          <MapPin className="h-6 w-6 text-white drop-shadow-lg" />
        </div>

        {/* ---- Match dots ---- */}
        {matches.map((match) => {
          const pos = matchToPixel(match);
          const state = getDotState(match.id);
          const isHidden = state === "hidden";
          const isRevealing = state === "revealing";
          const isNew = state === "new";
          const isHospital = match.type === "hospital";
          const color = isHospital
            ? URGENCY_COLORS[match.urgency || "STANDARD"] || "#3B82F6"
            : BLOOD_COLORS[match.bloodType] || "#10B981";

          return (
            <button
              key={match.id}
              type="button"
              className={clsx(
                "pointer-events-auto absolute z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 transition-all duration-700",
                isHidden && "scale-0 opacity-0",
                isRevealing && "scale-110 opacity-100",
                !isHidden && !isRevealing && "scale-100 opacity-100",
              )}
              style={{ left: pos.x, top: pos.y }}
              onClick={() => onMatchClick?.(match)}
            >
              {/* Glow ring for revealing/new matches */}
              {(isRevealing || isNew) && (
                <div
                  className="absolute inset-0 -m-3 animate-ping rounded-full opacity-40"
                  style={{ backgroundColor: color, animationDuration: "1.5s" }}
                />
              )}

              {/* Particle burst for new matches */}
              {isNew && (
                <>
                  <ParticleBurst color={color} />
                </>
              )}

              <div
                className={clsx(
                  "relative flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-all duration-300",
                  isNew && "animate-bounce-in",
                )}
                style={{
                  backgroundColor: color,
                  boxShadow: isNew
                    ? `0 0 20px ${color}, 0 0 40px ${color}80`
                    : `0 0 8px ${color}60`,
                }}
              >
                {isHospital ? (
                  <Building2 className="h-4 w-4 text-white" />
                ) : (
                  <Droplets className="h-4 w-4 text-white" />
                )}

                {/* Score badge */}
                <span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[7px] font-black text-slate-800 shadow"
                >
                  {match.compatibilityScore}
                </span>
              </div>

              <span className="rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-black text-white backdrop-blur-sm">
                {match.distanceKm}km
              </span>
            </button>
          );
        })}

        {/* ---- Bottom legend ---- */}
        <div className="pointer-events-auto absolute -bottom-1 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 backdrop-blur-md">
          <div className="flex items-center gap-3 text-[10px] font-bold text-white">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {directionLabel}
            </span>
            <span className="text-emerald-400/60">
              {revealedIds.size}/{matches.length} visible
            </span>
            {isScanning && (
              <Wifi className="h-3 w-3 animate-pulse text-emerald-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Blood type color map (for donor dots)
// ============================================================================

const BLOOD_COLORS: Record<string, string> = {
  "O+": "#16A34A",
  "O-": "#15803D",
  "A+": "#2563EB",
  "A-": "#1D4ED8",
  "B+": "#7C3AED",
  "B-": "#6D28D9",
  "AB+": "#DC2626",
  "AB-": "#B91C1C",
};

// ============================================================================
// Particle burst effect for new live matches
// ============================================================================

const PARTICLE_COUNT = 6;

const ParticleBurst = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * 360;
        const rad = (angle * Math.PI) / 180;
        const dist = 14 + Math.random() * 8;
        const x = Math.cos(rad) * dist;
        const y = Math.sin(rad) * dist;
        const delay = i * 0.05;

        return (
          <div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: color,
              transform: `translate(${x}px, ${y}px)`,
              opacity: 0,
              animation: `particle-fly 0.8s ease-out ${delay}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
};
