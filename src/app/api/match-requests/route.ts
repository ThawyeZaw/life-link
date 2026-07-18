// ============================================================================
// LifeLink — POST /api/match-requests
// Reverse matching: Donor finds hospitals with active blood requests
// Proxies to Python FastAPI matching engine (AGENTS.md Rule 7)
// Thaw Ye Zaw — Backend / Database Domain
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

/**
 * Request body:
 * {
 *   bloodType: BloodType;
 *   location: { lat: number; lng: number };
 *   township?: string;
 * }
 *
 * Response (200):
 * {
 *   hospitals: Array<{
 *     request_id: string;
 *     hospital_id: string;
 *     hospital_name: string;
 *     hospital_township: string | null;
 *     blood_type: BloodType;
 *     units_needed: number;
 *     urgency: Urgency;
 *     distance_km: number;
 *     compatibility_score: number;
 *     lat: number;
 *     lng: number;
 *     match_reason: string | null;
 *   }>;
 *   total_scored: number;
 *   total_filtered: number;
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
    const { bloodType, location, township } = body;

    if (!bloodType || !location?.lat || !location?.lng) {
      return NextResponse.json(
        { error: "Missing required fields: bloodType, location.lat, location.lng" },
        { status: 400 }
      );
    }

    // Fetch active blood requests with hospital + organisation info
    const { data: requests, error: fetchError } = await supabase
      .from("requests")
      .select(
        "id, blood_type, units_needed, urgency, township, lat, lng, hospital_id, organization_id, created_at, " +
        "hospitals(name, township, lat, lng), organizations(name, township, is_verified)"
      )
      .eq("request_type", "BLOOD")
      .eq("status", "OPEN")
      .not("lat", "is", null)
      .not("lng", "is", null);

    if (fetchError) {
      console.error("[match-requests] Failed to fetch requests:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch request data" },
        { status: 500 }
      );
    }

    // Transform to HospitalRequest shape for Python engine
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hospitalRequests = (requests || []).map((r: any) => {
      const hospital = (r.hospitals as Record<string, unknown> | null) || {};
      const org = (r.organizations as Record<string, unknown> | null) || {};
      return {
        request_id: r.id,
        hospital_id: r.hospital_id || r.organization_id || r.id,
        hospital_name:
          (hospital.name as string) || (org.name as string) || "Unknown Facility",
        hospital_township:
          (hospital.township as string) || (org.township as string) || r.township || null,
        org_name: (org.name as string) || null,
        org_verified: Boolean(org.is_verified),
        blood_type: r.blood_type,
        units_needed: r.units_needed,
        urgency: r.urgency,
        lat: r.lat,
        lng: r.lng,
        created_at: r.created_at,
      };
    });

    if (hospitalRequests.length === 0) {
      return NextResponse.json({
        hospitals: [],
        total_scored: 0,
        total_filtered: 0,
      });
    }

    // ---- Try Python matching engine ----
    if (!engineUrl) {
      // Production with no MATCHING_ENGINE_URL configured: never attempt localhost.
      console.error(
        "[match-requests] MATCHING_ENGINE_URL is not set in production; skipping engine call and using SQL fallback."
      );
    } else {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (MATCHING_ENGINE_API_KEY) {
          headers["X-API-Key"] = MATCHING_ENGINE_API_KEY;
        }

        const pythonResponse = await fetch(`${engineUrl}/match-requests`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            donor_id: user.id,
            donor_blood_type: bloodType,
            location,
            township: township || null,
            hospitals: hospitalRequests,
          }),
          signal: AbortSignal.timeout(10_000),
        });

        if (pythonResponse.ok) {
          const result = await pythonResponse.json();
          return NextResponse.json(result);
        }

        console.error(
          "[match-requests] Python engine returned non-OK:",
          pythonResponse.status
        );
      } catch (pythonErr) {
        console.error(
          "[match-requests] Python engine unreachable, falling back to SQL:",
          pythonErr
        );
      }
    }

    // ---- Fallback: basic distance + blood-type RPC ----
    // Engine was unreachable or not configured, so responses below are degraded.
    const { data: fallbackRequests, error: rpcError } = await supabase.rpc(
      "find_nearby_matching_requests",
      {
        p_lat: location.lat,
        p_lng: location.lng,
        p_blood_type: bloodType,
        p_radius_km: 100,
      }
    );

    if (rpcError) {
      return NextResponse.json(
        { hospitals: [], message: "Matching engine unavailable", degraded: true },
        { status: 200 }
      );
    }

    // Map the org-aware RPC rows to the HospitalMatchResult shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fallbackHospitals = ((fallbackRequests || []) as any[]).map((r) => ({
      request_id: r.request_id,
      hospital_id: r.hospital_id || r.organization_id || r.request_id,
      hospital_name: r.hospital_name,
      hospital_township: r.hospital_township,
      org_name: r.org_name ?? null,
      org_verified: Boolean(r.org_verified),
      blood_type: r.blood_type,
      units_needed: r.units_needed,
      urgency: r.urgency,
      distance_km: r.distance_km,
      compatibility_score: r.compatibility_score,
      lat: r.lat,
      lng: r.lng,
      match_reason: r.org_verified
        ? "Verified organisation (basic ranking)"
        : "Compatible request nearby (basic ranking)",
    }));

    return NextResponse.json({
      hospitals: fallbackHospitals,
      total_scored: fallbackHospitals.length,
      total_filtered: 0,
      degraded: true,
    });
  } catch (err) {
    console.error("[match-requests] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
