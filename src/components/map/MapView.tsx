"use client";

// src/components/map/MapView.tsx
// LifeLink — Self-contained interactive Mapbox view
// Thinzar Kyaw — Frontend Domain
//
// Integrates: Supabase Realtime (requests + profiles), Python matching engine
// (via /api/match-donors proxy), view mode toggle, connection lines.
//
// Integration surface: <MapView mapboxToken={token} />
// Just drop this component into any page — it handles all data & state internally.

import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Map,
  Marker,
  Popup,
  Source,
  Layer,
  useMap,
} from "react-map-gl/mapbox";
import { Loader2, MapPin, AlertTriangle, Droplets, Navigation } from "lucide-react";
import Link from "next/link";

import { MapLegend } from "./MapLegend";
import {
  HospitalInfoContent,
  RequestInfoContent,
  DonorInfoContent,
  MatchedDonorInfoContent,
} from "./InfoWindows";
import {
  URGENCY_STYLES,
  createHospitalMarkerSVG,
  createDonorDotSVG,
  createMatchedDonorSVG,
  CONNECTION_LINE_COLOR,
  CONNECTION_LINE_OPACITY,
  CONNECTION_LINE_WIDTH,
} from "./mapTypes";
import type {
  MapHospital,
  MapRequest,
  MapDonor,
  MapDataResponse,
  ViewMode,
  MatchedDonor,
  MapViewProps,
} from "./mapTypes";
import { subscribeToRequests, subscribeToProfiles } from "@/utils/supabase/queries";
import type { Profile, Request as SupabaseRequest } from "@/utils/supabase";

// ============================================================================
// Default center: Yangon, Myanmar
// ============================================================================

const DEFAULT_CENTER: [number, number] = [96.1735, 16.8409]; // [lng, lat]
const DEFAULT_ZOOM = 12;

// ============================================================================
// Helpers
// ============================================================================

/** Convert a Supabase Profile to a MapDonor for marker rendering */
function profileToMapDonor(p: Profile): MapDonor | null {
  if (!p.lat || !p.lng || !p.blood_type) return null;
  return {
    id: p.id,
    blood_type: p.blood_type,
    township: p.township ?? null,
    lat: p.lat,
    lng: p.lng,
  };
}

/** Convert a Supabase Request to a MapRequest for marker rendering */
function supabaseRequestToMapRequest(
  r: SupabaseRequest,
  hospitalName?: string | null,
): MapRequest | null {
  if (r.lat == null || r.lng == null) return null;
  return {
    id: r.id,
    blood_type: r.blood_type ?? null,
    units_needed: r.units_needed ?? 1,
    urgency: r.urgency ?? "STANDARD",
    township: r.township ?? null,
    lat: r.lat,
    lng: r.lng,
    hospital_name: hospitalName ?? null,
  };
}

// ============================================================================
// MapView — Main map container
// ============================================================================

export function MapView({ mapboxToken }: MapViewProps) {
  // ---- Data state ----
  const [mapData, setMapData] = useState<MapDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- View mode ----
  const [viewMode, setViewMode] = useState<ViewMode>("need_blood");

  // ---- Layer visibility toggles ----
  const [showHospitals, setShowHospitals] = useState(true);
  const [showRequests, setShowRequests] = useState(true);
  const [showDonors, setShowDonors] = useState(true);

  // ---- Selected marker (popup) ----
  const [selectedMarker, setSelectedMarker] = useState<{
    type: "hospital" | "request" | "donor" | "matched_donor";
    id: string;
    lat: number;
    lng: number;
  } | null>(null);

  // ---- Matching engine state ----
  const [matchedDonors, setMatchedDonors] = useState<MatchedDonor[]>([]);
  const [matchedRequestId, setMatchedRequestId] = useState<string | null>(null);
  const [matchingLoading, setMatchingLoading] = useState(false);

  // ---- Refs for cleanup ----
  const mapDataRef = useRef(mapData);
  mapDataRef.current = mapData;

  // ==========================================================================
  // Initial data fetch
  // ==========================================================================

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/map-data");
        if (!res.ok) throw new Error("API failed");

        const data: MapDataResponse = await res.json();
        if (!cancelled) {
          setMapData(data);
          setLoading(false);
        }
      } catch {
        // Fall back to mock data
        try {
          const { MOCK_HOSPITALS, MOCK_REQUESTS } = await import(
            "@/components/data/mockData"
          );
          const mockDonors: MapDonor[] = [
            { id: "d1", blood_type: "O-", township: "Sanchaung", lat: 16.8147, lng: 96.1345 },
            { id: "d2", blood_type: "A+", township: "Bahan", lat: 16.8059, lng: 96.1472 },
            { id: "d3", blood_type: "B+", township: "Kamayut", lat: 16.8234, lng: 96.1288 },
            { id: "d4", blood_type: "O+", township: "Tamwe", lat: 16.8141, lng: 96.1777 },
            { id: "d5", blood_type: "AB+", township: "Mayangone", lat: 16.8762, lng: 96.1214 },
            { id: "d6", blood_type: "A-", township: "Hlaing", lat: 16.8543, lng: 96.1125 },
            { id: "d7", blood_type: "O+", township: "Mingalar Taung Nyunt", lat: 16.7789, lng: 96.1617 },
            { id: "d8", blood_type: "B+", township: "Insein", lat: 16.8902, lng: 96.1089 },
            { id: "d9", blood_type: "O-", township: "North Okkalapa", lat: 16.9012, lng: 96.1877 },
            { id: "d10", blood_type: "A+", township: "Sanchaung", lat: 16.8195, lng: 96.1367 },
          ];

          const requests: MapRequest[] = MOCK_REQUESTS.filter(
            (r) => r.status === "OPEN" || r.status === "IN_PROGRESS",
          ).map((r) => ({
            id: r.id,
            blood_type: r.blood_type,
            units_needed: r.units_needed,
            urgency: r.urgency,
            township: r.township,
            lat: r.lat,
            lng: r.lng,
            hospital_name: r.hospital?.name || null,
          }));

          if (!cancelled) {
            setMapData({ hospitals: MOCK_HOSPITALS, requests, donors: mockDonors });
            setLoading(false);
          }
        } catch (mockErr) {
          console.error("[MapView] Mock data fallback failed:", mockErr);
          if (!cancelled) {
            setError("Failed to load map data");
            setLoading(false);
          }
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================================
  // Real-time subscriptions (requests + profiles)
  // ==========================================================================

  useEffect(() => {
    // ---- Requests subscription ----
    const reqChannel = subscribeToRequests(
      // INSERT: new request
      (req: SupabaseRequest) => {
        setMapData((prev) => {
          if (!prev) return prev;
          const mr = supabaseRequestToMapRequest(req);
          if (!mr) return prev;
          // Don't add duplicates
          if (prev.requests.some((r) => r.id === mr.id)) return prev;
          return { ...prev, requests: [mr, ...prev.requests] };
        });
      },
      // UPDATE: request changed (e.g. status changed, units updated)
      (req: SupabaseRequest) => {
        setMapData((prev) => {
          if (!prev) return prev;
          // If request is no longer active, remove it from the map
          if (req.status !== "OPEN" && req.status !== "IN_PROGRESS") {
            // Also clear matched donors if this was the active match
            if (matchedRequestId === req.id) {
              setMatchedDonors([]);
              setMatchedRequestId(null);
            }
            return {
              ...prev,
              requests: prev.requests.filter((r) => r.id !== req.id),
            };
          }
          const mr = supabaseRequestToMapRequest(req);
          if (!mr) return prev;
          return {
            ...prev,
            requests: prev.requests.map((r) => (r.id === mr.id ? mr : r)),
          };
        });
      },
    );

    // ---- Profiles subscription ----
    const profChannel = subscribeToProfiles(
      // INSERT: new donor
      (profile: Profile) => {
        if (!profile.is_available) return;
        setMapData((prev) => {
          if (!prev) return prev;
          const md = profileToMapDonor(profile);
          if (!md) return prev;
          if (prev.donors.some((d) => d.id === md.id)) return prev;
          return { ...prev, donors: [...prev.donors, md] };
        });
      },
      // UPDATE: donor changed availability, location, blood type
      (profile: Profile) => {
        setMapData((prev) => {
          if (!prev) return prev;
          if (!profile.is_available) {
            // Donor went unavailable — remove from map
            return {
              ...prev,
              donors: prev.donors.filter((d) => d.id !== profile.id),
            };
          }
          const md = profileToMapDonor(profile);
          if (!md) {
            return {
              ...prev,
              donors: prev.donors.filter((d) => d.id !== profile.id),
            };
          }
          const exists = prev.donors.some((d) => d.id === md.id);
          if (exists) {
            return {
              ...prev,
              donors: prev.donors.map((d) => (d.id === md.id ? md : d)),
            };
          }
          return { ...prev, donors: [...prev.donors, md] };
        });
      },
    );

    return () => {
      reqChannel.unsubscribe();
      profChannel.unsubscribe();
    };
  }, [matchedRequestId]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleMarkerClick = useCallback(
    (
      type: "hospital" | "request" | "donor" | "matched_donor",
      id: string,
      lat: number,
      lng: number,
    ) => {
      setSelectedMarker({ type, id, lat, lng });
    },
    [],
  );

  const handlePopupClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // ---- Matching engine: find donors for a request ----
  const handleFindMatchingDonors = useCallback(
    async (request: MapRequest) => {
      setMatchingLoading(true);
      setMatchedRequestId(request.id);

      try {
        const res = await fetch("/api/match-donors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: request.id,
            bloodType: request.blood_type ?? "O+",
            location: { lat: request.lat, lng: request.lng },
            urgency: request.urgency,
            township: request.township,
          }),
        });

        if (!res.ok) {
          console.warn("[MapView] Match donors failed:", res.status);
          setMatchedDonors([]);
          return;
        }

        const data = await res.json();
        // Filter to donors with lat/lng
        const withCoords = (data.donors || []).filter(
          (d: MatchedDonor) => d.lat != null && d.lng != null,
        );
        setMatchedDonors(withCoords);
      } catch (err) {
        console.error("[MapView] Match donors error:", err);
        setMatchedDonors([]);
      } finally {
        setMatchingLoading(false);
      }
    },
    [],
  );

  const handleClearMatches = useCallback(() => {
    setMatchedDonors([]);
    setMatchedRequestId(null);
  }, []);

  // ---- Find selected data for popup ----
  const selectedData = useMemo(() => {
    if (!selectedMarker || !mapData) return null;
    const { type, id } = selectedMarker;
    if (type === "hospital") return mapData.hospitals.find((h) => h.id === id) || null;
    if (type === "request") return mapData.requests.find((r) => r.id === id) || null;
    if (type === "donor") return mapData.donors.find((d) => d.id === id) || null;
    if (type === "matched_donor") return matchedDonors.find((d) => d.id === id) || null;
    return null;
  }, [selectedMarker, mapData, matchedDonors]);

  // ---- Connection line GeoJSON ----
  const connectionLines = useMemo(() => {
    if (matchedDonors.length === 0 || !matchedRequestId || !mapData) return null;

    const request = mapData.requests.find((r) => r.id === matchedRequestId);
    if (!request || request.lat == null || request.lng == null) return null;

    const features = matchedDonors
      .filter((d) => d.lat != null && d.lng != null)
      .map((d) => ({
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [request.lng!, request.lat!],
            [d.lng!, d.lat!],
          ],
        },
        properties: { id: d.id },
      }));

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [matchedDonors, matchedRequestId, mapData]);

  // ==========================================================================
  // Loading state
  // ==========================================================================

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D1933]" />
        <p className="text-sm font-semibold text-slate-500">Loading map data...</p>
      </div>
    );
  }

  // ==========================================================================
  // Error state
  // ==========================================================================

  if (error || !mapData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-100 px-6 text-center">
        <MapPin className="h-10 w-10 text-slate-300" />
        <p className="text-sm font-semibold text-slate-600">
          {error || "No map data available"}
        </p>
        <p className="text-xs text-slate-400">
          Using mock data — connect Supabase for live data.
        </p>
      </div>
    );
  }

  // ---- Determine visibility based on view mode ----
  const donorsVisible = showDonors && viewMode === "need_blood";
  const requestsVisible = showRequests;

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className="relative flex-1">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: DEFAULT_CENTER[0],
          latitude: DEFAULT_CENTER[1],
          zoom: DEFAULT_ZOOM,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
      >
        {/* ---- Hospital Markers ---- */}
        {showHospitals &&
          mapData.hospitals.map((h) => (
            <Marker
              key={`hosp-${h.id}`}
              latitude={h.lat}
              longitude={h.lng}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick("hospital", h.id, h.lat, h.lng);
              }}
            >
              <img
                src={`data:image/svg+xml,${encodeURIComponent(createHospitalMarkerSVG())}`}
                alt={h.name}
                width={36}
                height={36}
                className="cursor-pointer drop-shadow-lg transition-transform hover:scale-110"
              />
            </Marker>
          ))}

        {/* ---- Request Markers ---- */}
        {requestsVisible &&
          mapData.requests
            .filter((r) => r.lat != null && r.lng != null)
            .map((r) => {
              const styles = URGENCY_STYLES[r.urgency] || URGENCY_STYLES.STANDARD;
              const isCritical = r.urgency === "CRITICAL";
              const isMatched = r.id === matchedRequestId;
              return (
                <Marker
                  key={`req-${r.id}`}
                  latitude={r.lat!}
                  longitude={r.lng!}
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    handleMarkerClick("request", r.id, r.lat!, r.lng!);
                  }}
                >
                  <div className="relative">
                    {/* Pulse for critical */}
                    {isCritical && (
                      <div
                        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full opacity-25"
                        style={{ backgroundColor: styles.pin }}
                      />
                    )}
                    {/* Matched ring */}
                    {isMatched && (
                      <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-400 opacity-70" />
                    )}
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: styles.pin }}
                    >
                      {isCritical ? (
                        <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2.5} />
                      ) : (
                        <Droplets className="h-5 w-5 text-white" strokeWidth={2.5} />
                      )}
                    </div>
                  </div>
                </Marker>
              );
            })}

        {/* ---- Donor Markers (only in "need_blood" mode) ---- */}
        {donorsVisible &&
          mapData.donors
            .filter((d) => d.lat != null && d.lng != null)
            .map((d) => (
              <Marker
                key={`donor-${d.id}`}
                latitude={d.lat}
                longitude={d.lng}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick("donor", d.id, d.lat, d.lng);
                }}
              >
                <img
                  src={`data:image/svg+xml,${encodeURIComponent(createDonorDotSVG(d.blood_type))}`}
                  alt={`${d.blood_type} donor`}
                  width={24}
                  height={24}
                  className="cursor-pointer drop-shadow-md transition-transform hover:scale-125"
                />
              </Marker>
            ))}

        {/* ---- Matched Donor Markers (from matching engine) ---- */}
        {matchedDonors
          .filter((d) => d.lat != null && d.lng != null)
          .map((d) => (
            <Marker
              key={`matched-${d.id}`}
              latitude={d.lat!}
              longitude={d.lng!}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick("matched_donor", d.id, d.lat!, d.lng!);
              }}
            >
              <img
                src={`data:image/svg+xml,${encodeURIComponent(
                  createMatchedDonorSVG(d.blood_type, d.compatibility_score),
                )}`}
                alt={`Matched donor ${d.blood_type}`}
                width={28}
                height={28}
                className="cursor-pointer drop-shadow-lg transition-transform hover:scale-125"
              />
            </Marker>
          ))}

        {/* ---- Connection lines (request → matched donors) ---- */}
        {connectionLines && connectionLines.features.length > 0 && (
          <Source
            id="match-lines"
            type="geojson"
            data={connectionLines}
          >
            <Layer
              id="match-lines-layer"
              type="line"
              paint={{
                "line-color": CONNECTION_LINE_COLOR,
                "line-width": CONNECTION_LINE_WIDTH,
                "line-opacity": CONNECTION_LINE_OPACITY,
                "line-dasharray": [3, 2],
              }}
            />
          </Source>
        )}

        {/* ---- Popup ---- */}
        {selectedMarker && selectedData && (
          <Popup
            latitude={selectedMarker.lat}
            longitude={selectedMarker.lng}
            onClose={handlePopupClose}
            closeButton={true}
            closeOnClick={false}
            anchor="bottom"
            offset={30}
            maxWidth="320px"
          >
            <div className="min-w-[200px] max-w-[300px]">
              {selectedMarker.type === "hospital" && (
                <HospitalInfoContent hospital={selectedData as MapHospital} />
              )}
              {selectedMarker.type === "request" && (
                <RequestInfoContent
                  request={selectedData as MapRequest}
                  matchingLoading={matchingLoading && selectedMarker.id === matchedRequestId}
                  hasMatches={matchedRequestId === selectedMarker.id && matchedDonors.length > 0}
                  onFindDonors={() =>
                    handleFindMatchingDonors(selectedData as MapRequest)
                  }
                  onClearMatches={handleClearMatches}
                />
              )}
              {selectedMarker.type === "donor" && (
                <DonorInfoContent donor={selectedData as MapDonor} />
              )}
              {selectedMarker.type === "matched_donor" && (
                <MatchedDonorInfoContent donor={selectedData as MatchedDonor} />
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* ---- Layer toggle + view mode + legend overlay ---- */}
      <div className="absolute top-3 left-3 right-3 z-10 flex gap-2">
        {/* Back button */}
        <Link
          href="/passport"
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center self-start rounded-2xl border border-white/70 bg-white/90 shadow-lg backdrop-blur transition hover:bg-white"
          aria-label="Back to passport"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-600"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex flex-1 flex-wrap items-start gap-2">
          <MapLegend
        showHospitals={showHospitals}
        showRequests={showRequests}
        showDonors={showDonors}
        viewMode={viewMode}
        onToggleHospitals={() => setShowHospitals((v) => !v)}
        onToggleRequests={() => setShowRequests((v) => !v)}
        onToggleDonors={() => setShowDonors((v) => !v)}
        onViewModeChange={setViewMode}
        matchingActive={matchedDonors.length > 0}
        onClearMatches={handleClearMatches}
      />
        </div>
      </div>

      {/* ---- My Location Button ---- */}
      <MyLocationButton />

      {/* ---- Data freshness stamp ---- */}
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-xl border border-white/60 bg-white/85 px-3 py-1.5 text-[10px] font-semibold text-slate-400 shadow-md backdrop-blur">
        {mapData.hospitals.length} hospitals &middot; {mapData.requests.length}{" "}
        requests &middot; {mapData.donors.length} donors
        {matchedDonors.length > 0 && (
          <> &middot; {matchedDonors.length} matched</>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// My Location Button
// ============================================================================

function MyLocationButton() {
  const { current: map } = useMap();

  const handleLocate = useCallback(() => {
    if (!map) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 14,
          });
        },
        () => {
          // Geolocation denied — do nothing
        },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }
  }, [map]);

  return (
    <button
      type="button"
      onClick={handleLocate}
      className="absolute bottom-3 left-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/90 shadow-lg backdrop-blur transition hover:bg-white"
      aria-label="Find my location"
    >
      <Navigation className="h-[18px] w-[18px] text-[#0D1933]" strokeWidth={2} />
    </button>
  );
}
