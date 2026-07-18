"use client";

// ⚠️ CROSS-BOUNDARY: This component is in Thinzar's domain (/components/)
// but calls Thaw Ye Zaw's /api/match-donors and /api/match-requests routes.
// Thinzar Kyaw — Frontend Domain.
//
// Full-screen Mapbox map with radar overlay on top. The radar sweep
// reveals matched donors/hospitals sequentially as the sweep line rotates.

import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { Map } from "react-map-gl/mapbox";
import { createClient } from "@/utils/supabase/client";
import { clsx } from "clsx";
import { Loader2, Wifi, WifiOff, X } from "lucide-react";

import { RadarOverlay, type RadarMatch } from "./RadarOverlay";

// ============================================================================
// Types
// ============================================================================

export type RadarMode = "donor" | "hospital";

export interface BroadcastRadarProps {
  /** Center point lat/lng for the radar sweep */
  centerLat: number;
  centerLng: number;
  /** Direction: finding donors or finding hospitals */
  mode: RadarMode;
  /** Blood type to match */
  bloodTypes: string[];
  /** Request ID (for forward matching) or donor ID (for reverse) */
  entityId: string;
  /** Township for locality bonus */
  township?: string | null;
  /** Urgency level (forward matching only) */
  urgency?: string;
  /** Called when radar is dismissed */
  onClose?: () => void;
  /** Called when user clicks a match */
  onMatchClick?: (match: RadarMatch) => void;
}

// ============================================================================
// Map style
// ============================================================================

const DARK_MAP_STYLE = "mapbox://styles/mapbox/dark-v11";

// ============================================================================
// Component
// ============================================================================

export const BroadcastRadar = ({
  centerLat,
  centerLng,
  mode,
  bloodTypes,
  entityId,
  township,
  urgency,
  onClose,
  onMatchClick,
}: BroadcastRadarProps) => {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  const [matches, setMatches] = useState<RadarMatch[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const setMatchesStable = useCallback((updater: React.SetStateAction<RadarMatch[]>) => {
    if (mountedRef.current) setMatches(updater);
  }, []);

  // ---- Fetch initial matches ----
  const fetchMatches = useCallback(async () => {
    if (!mountedRef.current) return;

    setIsScanning(true);
    setError(null);

    try {
      if (mode === "donor") {
        const allMatches: RadarMatch[] = [];
        for (const bloodType of bloodTypes) {
          const res = await fetch("/api/match-donors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requestId: entityId,
              bloodType,
              location: { lat: centerLat, lng: centerLng },
              urgency: urgency || "STANDARD",
              township: township || null,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            for (const d of data.donors || []) {
              allMatches.push({
                id: d.id,
                name: d.full_name,
                distanceKm: d.distance_km,
                bloodType: d.blood_type,
                township: d.township,
                compatibilityScore: d.compatibility_score,
                lat: d.lat || centerLat,
                lng: d.lng || centerLng,
                matchReason: d.match_reason,
                type: "donor",
                addedAt: Date.now(),
              });
            }
          }
        }
        const seen = new Set<string>();
        setMatchesStable(allMatches.filter((m) => seen.has(m.id) ? false : seen.add(m.id)));
      } else {
        const res = await fetch("/api/match-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bloodType: bloodTypes[0],
            location: { lat: centerLat, lng: centerLng },
            township: township || null,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setMatchesStable(
            (data.hospitals || []).map((h: Record<string, unknown>) => ({
              id: h.request_id as string,
              name: h.hospital_name as string,
              distanceKm: h.distance_km as number,
              bloodType: h.blood_type as string,
              township: h.hospital_township as string | null,
              compatibilityScore: h.compatibility_score as number,
              lat: h.lat as number,
              lng: h.lng as number,
              matchReason: h.match_reason as string | null,
              type: "hospital" as const,
              unitsNeeded: h.units_needed as number,
              urgency: h.urgency as string,
              addedAt: Date.now(),
            })),
          );
        }
      }
    } catch (err) {
      console.error("[BroadcastRadar] Fetch error:", err);
      if (mountedRef.current) setError("Unable to load matches");
    } finally {
      if (mountedRef.current) setIsScanning(false);
    }
  }, [mode, bloodTypes, entityId, centerLat, centerLng, township, urgency, setMatchesStable]);

  // ---- Supabase Realtime subscriptions ----
  useEffect(() => {
    mountedRef.current = true;
    const supabase = createClient();

    if (mode === "donor" && entityId) {
      const channel = supabase
        .channel("radar-matches")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "matches", filter: `request_id=eq.${entityId}` },
          async (payload) => {
            if (!mountedRef.current || !isLive) return;
            const newMatch = payload.new as Record<string, unknown>;
            const donorId = newMatch.donor_id as string;
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, full_name, blood_type, township, lat, lng")
              .eq("id", donorId)
              .single();
            if (profile && mountedRef.current) {
              setMatchesStable((prev) => {
                if (prev.some((m) => m.id === profile.id)) return prev;
                return [...prev, {
                  id: profile.id as string,
                  name: profile.full_name as string,
                  distanceKm: (newMatch.distance_km as number) || 0,
                  bloodType: profile.blood_type as string,
                  township: profile.township as string | null,
                  compatibilityScore: (newMatch.compatibility_score as number) || 0,
                  lat: (profile.lat as number) || centerLat,
                  lng: (profile.lng as number) || centerLng,
                  matchReason: null,
                  type: "donor",
                  addedAt: Date.now(),
                }];
              });
            }
          },
        )
        .subscribe();

      return () => { mountedRef.current = false; channel.unsubscribe(); };
    }

    if (mode === "hospital") {
      const channel = supabase
        .channel("radar-requests")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "requests", filter: "request_type=eq.BLOOD" },
          async (payload) => {
            if (!mountedRef.current || !isLive) return;
            const newReq = payload.new as Record<string, unknown>;
            if (newReq.blood_type !== bloodTypes[0]) return;
            const { data: hospital } = await supabase
              .from("hospitals")
              .select("name, township")
              .eq("id", newReq.hospital_id as string)
              .single();
            if (mountedRef.current) {
              setMatchesStable((prev) => {
                const reqId = newReq.id as string;
                if (prev.some((m) => m.id === reqId)) return prev;
                return [...prev, {
                  id: reqId,
                  name: (hospital?.name as string) || "Hospital",
                  distanceKm: 0,
                  bloodType: newReq.blood_type as string,
                  township: (hospital?.township as string) || null,
                  compatibilityScore: 0,
                  lat: (newReq.lat as number) || centerLat,
                  lng: (newReq.lng as number) || centerLng,
                  matchReason: "New request",
                  type: "hospital",
                  unitsNeeded: (newReq.units_needed as number) || 1,
                  urgency: (newReq.urgency as string) || "STANDARD",
                  addedAt: Date.now(),
                }];
              });
            }
          },
        )
        .subscribe();

      return () => { mountedRef.current = false; channel.unsubscribe(); };
    }

    return () => { mountedRef.current = false; };
  }, [mode, entityId, bloodTypes, centerLat, centerLng, isLive, setMatchesStable]);

  // ---- Initial fetch ----
  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // ---- Render ----
  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* ---- Mapbox map as background ---- */}
      <div className="absolute inset-0">
        <Map
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: centerLng,
            latitude: centerLat,
            zoom: 13,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={DARK_MAP_STYLE}
          attributionControl={false}
          logoPosition="bottom-left"
        />
      </div>

      {/* ---- Radar overlay on top of map ---- */}
      <RadarOverlay
        matches={matches}
        centerLat={centerLat}
        centerLng={centerLng}
        isScanning={isScanning}
        onMatchClick={onMatchClick}
        directionLabel={mode === "donor" ? "Donors" : "Hospitals"}
      />

      {/* ---- Top bar controls ---- */}
      <div className="pointer-events-auto relative z-40 flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition hover:bg-black/50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLive((prev) => !prev)}
            className={clsx(
              "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[10px] font-bold backdrop-blur-md transition",
              isLive
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                : "border-white/15 bg-black/40 text-slate-300",
            )}
          >
            {isLive ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {isLive ? "LIVE" : "PAUSED"}
          </button>

          <button
            type="button"
            onClick={fetchMatches}
            disabled={!isLive}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-black/40 px-3 text-[10px] font-bold text-white/70 backdrop-blur-md transition hover:bg-black/50 disabled:opacity-40"
          >
            <Loader2 className={clsx("h-3.5 w-3.5", isScanning && "animate-spin")} />
            Rescan
          </button>
        </div>
      </div>

      {/* ---- Bottom info bar ---- */}
      <div className="pointer-events-auto relative z-40 mt-auto border-t border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white">
              {mode === "donor" ? "Finding Donors" : "Finding Hospitals"}
            </h2>
            <p className="text-[10px] font-medium text-slate-400">
              {bloodTypes.join(", ")} · {matches.length} match{matches.length !== 1 ? "es" : ""}
              {error && <span className="ml-2 text-red-400">{error}</span>}
            </p>
          </div>

          {matches.length > 0 && (
            <div className="hidden gap-2 overflow-x-auto sm:flex">
              {matches
                .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                .slice(0, 5)
                .map((match) => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => onMatchClick?.(match)}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
                  >
                    <div
                      className={clsx(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-black text-white",
                        match.type === "donor" ? "bg-emerald-500" : "bg-red-500",
                      )}
                    >
                      {match.bloodType}
                    </div>
                    <div className="text-left">
                      <p className="max-w-28 truncate text-[10px] font-bold text-white">
                        {match.name}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {match.distanceKm}km · {match.compatibilityScore}%
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
