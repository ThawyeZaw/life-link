// ============================================================================
// LifeLink — POST /api/match-donors
// Proxies to Python FastAPI matching engine (AGENTS.md Rule 7)
// Thaw Ye Zaw — Backend / Database Domain
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const PYTHON_ENGINE_URL = process.env.MATCHING_ENGINE_URL || "http://localhost:8000";
const MATCHING_ENGINE_API_KEY = process.env.MATCHING_ENGINE_API_KEY;

/**
 * Request body:
 * {
 *   requestId: string;
 *   bloodType: BloodType;
 *   location: { lat: number; lng: number };
 *   urgency?: Urgency;       // defaults to STANDARD
 *   township?: string;       // for same-city bonus scoring
 * }
 *
 * Response (200):
 * {
 *   donors: Array<{
 *     id: string;
 *     full_name: string;
 *     phone: string | null;
 *     blood_type: BloodType;
 *     township: string | null;
 *     distance_km: number;
 *     compatibility_score: number;
 *     lat: number | null;
 *     lng: number | null;
 *     last_donation_date: string | null;
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
    const { requestId, bloodType, location, urgency = "STANDARD", township } = body;

    if (!requestId || !bloodType || !location?.lat || !location?.lng) {
      return NextResponse.json(
        { error: "Missing required fields: requestId, bloodType, location.lat, location.lng" },
        { status: 400 }
      );
    }

    // Fetch all available donors with full medical data (server-side,
    // not through public_profiles view, so we can access medical info
    // needed by the scoring engine).
    const { data: donors, error: fetchError } = await supabase
      .from("profiles")
      .select(
        "id, full_name, phone, blood_type, township, lat, lng, last_donation_date, weight_kg, medical_conditions"
      )
      .eq("is_available", true)
      .not("blood_type", "is", null);

    if (fetchError) {
      console.error("[match-donors] Failed to fetch donors:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch donor data" },
        { status: 500 }
      );
    }

    // ---- Try Python matching engine ----
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (MATCHING_ENGINE_API_KEY) {
        headers["X-API-Key"] = MATCHING_ENGINE_API_KEY;
      }

      const pythonResponse = await fetch(`${PYTHON_ENGINE_URL}/match`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          request_id: requestId,
          blood_type: bloodType,
          location,
          urgency,
          township: township || null,
          donors: donors || [],
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (pythonResponse.ok) {
        const result = await pythonResponse.json();
        return NextResponse.json(result);
      }

      console.warn(
        "[match-donors] Python engine returned non-OK:",
        pythonResponse.status
      );
    } catch (pythonErr) {
      console.warn(
        "[match-donors] Python engine unreachable, falling back to SQL:",
        pythonErr
      );
    }

    // ---- Fallback: basic distance + blood-type RPC ----
    const { data: fallbackDonors, error: rpcError } = await supabase.rpc(
      "find_nearby_donors",
      {
        p_lat: location.lat,
        p_lng: location.lng,
        p_blood_type: bloodType,
        p_radius_km: urgency === "CRITICAL" ? 100 : urgency === "URGENT" ? 75 : 50,
      }
    );

    if (rpcError) {
      return NextResponse.json(
        { donors: [], message: "Matching engine unavailable" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      donors: fallbackDonors || [],
      total_scored: (fallbackDonors || []).length,
      total_filtered: 0,
    });
  } catch (err) {
    console.error("[match-donors] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
