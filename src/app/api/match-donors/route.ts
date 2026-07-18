// ============================================================================
// LifeLink — POST /api/match-donors
// Proxies to Python FastAPI matching engine (AGENTS.md Rule 7)
//
// Privacy: donor candidates come from the find_available_donors RPC which
// uses township centroids only — no phone numbers, no exact coordinates.
// Contact info is only revealed after a donor accepts a match.
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Resolve engine URL. Fall back to localhost ONLY in development;
// in production a missing MATCHING_ENGINE_URL means the engine is skipped.
const engineUrl =
  process.env.MATCHING_ENGINE_URL ||
  (process.env.NODE_ENV !== "production" ? "http://localhost:8000" : undefined);
const MATCHING_ENGINE_API_KEY = process.env.MATCHING_ENGINE_API_KEY;

type DonorCandidate = {
  id: string;
  full_name: string;
  blood_type: string;
  township: string | null;
  lat: number | null;
  lng: number | null;
  distance_km: number | null;
  last_donation_date: string | null;
};

/** Strip contact info and round distances before returning donors. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeDonors(donors: any[]): any[] {
  return (donors || []).map((donor) => ({
    ...donor,
    phone: null,
    distance_km:
      typeof donor.distance_km === "number"
        ? Math.round(donor.distance_km * 10) / 10
        : donor.distance_km,
  }));
}

/**
 * Request body:
 * {
 *   requestId: string;
 *   bloodType: BloodType;
 *   location: { lat: number; lng: number };
 *   urgency?: Urgency;       // defaults to STANDARD
 *   township?: string;       // for same-city bonus scoring
 * }
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { requestId, bloodType, location, urgency = "STANDARD", township } = body;

    if (!requestId || !bloodType || !location?.lat || !location?.lng) {
      return NextResponse.json(
        { error: "Missing required fields: requestId, bloodType, location.lat, location.lng" },
        { status: 400 }
      );
    }

    const radiusKm =
      urgency === "CRITICAL" ? 100 : urgency === "URGENT" ? 75 : 50;

    // Privacy-safe donor candidates: township centroids, no phone numbers.
    const { data: donors, error: fetchError } = await supabase.rpc(
      "find_available_donors",
      {
        p_blood_type: bloodType,
        p_origin_lat: location.lat,
        p_origin_lng: location.lng,
        p_radius_km: radiusKm,
        p_limit: 100,
      }
    );

    if (fetchError) {
      console.error("[match-donors] Failed to fetch donors:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch donor data" },
        { status: 500 }
      );
    }

    const candidates = (donors || []) as DonorCandidate[];

    // ---- Try Python matching engine ----
    if (!engineUrl) {
      // Production with no MATCHING_ENGINE_URL configured: never attempt localhost.
      console.error(
        "[match-donors] MATCHING_ENGINE_URL is not set in production; skipping engine call and using SQL fallback."
      );
    } else {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (MATCHING_ENGINE_API_KEY) {
          headers["X-API-Key"] = MATCHING_ENGINE_API_KEY;
        }

        const pythonResponse = await fetch(`${engineUrl}/match`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            request_id: requestId,
            blood_type: bloodType,
            location,
            urgency,
            township: township || null,
            donors: candidates.map((d) => ({
              id: d.id,
              full_name: d.full_name,
              phone: null,
              blood_type: d.blood_type,
              township: d.township,
              lat: d.lat,
              lng: d.lng,
              last_donation_date: d.last_donation_date,
              weight_kg: null,
              medical_conditions: [],
            })),
          }),
          signal: AbortSignal.timeout(10_000),
        });

        if (pythonResponse.ok) {
          const result = await pythonResponse.json();
          return NextResponse.json({
            ...result,
            donors: sanitizeDonors(result.donors),
          });
        }

        console.error(
          "[match-donors] Python engine returned non-OK:",
          pythonResponse.status
        );
      } catch (pythonErr) {
        console.error(
          "[match-donors] Python engine unreachable, falling back to SQL:",
          pythonErr
        );
      }
    }

    // ---- Fallback: distance-ordered RPC results (degraded mode) ----
    const fallbackDonors = candidates.map((d) => ({
      id: d.id,
      full_name: d.full_name,
      phone: null,
      blood_type: d.blood_type,
      township: d.township,
      distance_km: d.distance_km ?? 0,
      compatibility_score: d.blood_type === bloodType ? 70 : 50,
      lat: d.lat,
      lng: d.lng,
      last_donation_date: d.last_donation_date,
      match_reason:
        d.blood_type === bloodType
          ? "Exact blood type match (basic ranking)"
          : "Compatible blood type (basic ranking)",
    }));

    return NextResponse.json({
      donors: sanitizeDonors(fallbackDonors),
      total_scored: fallbackDonors.length,
      total_filtered: 0,
      degraded: true,
      message: "Matching engine unavailable — basic distance ranking used",
    });
  } catch (err) {
    console.error("[match-donors] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
