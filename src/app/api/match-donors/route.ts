// ============================================================================
// Vertex Red — POST /api/match-donors
// Proxy to Python FastAPI matching engine (AGENTS.md Rule 7)
// Thaw Ye Zaw — Backend / Database Domain
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * Request body:
 * {
 *   requestId: string;
 *   bloodType: BloodType;
 *   location: { lat: number; lng: number };
 * }
 *
 * Response (200):
 * {
 *   donors: Array<{
 *     id: string;
 *     name: string;
 *     phone: string;
 *     bloodType: BloodType;
 *     distanceKm: number;
 *     township: string;
 *     lat: number;
 *     lng: number;
 *   }>;
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
    const { requestId, bloodType, location } = body;

    if (!requestId || !bloodType || !location?.lat || !location?.lng) {
      return NextResponse.json(
        { error: "Missing required fields: requestId, bloodType, location.lat, location.lng" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Python FastAPI call when matching engine is built
    // const pythonResponse = await fetch("http://localhost:8000/match", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ requestId, bloodType, location }),
    // });
    // const donors = await pythonResponse.json();

    // --- STUB: Fallback to basic distance-based query until Python engine is ready ---
    const { data: donors, error } = await supabase.rpc("find_nearby_donors", {
      p_lat: location.lat,
      p_lng: location.lng,
      p_blood_type: bloodType,
      p_radius_km: 50,
    });

    if (error) {
      return NextResponse.json(
        { donors: [], message: "Matching engine unavailable. Python service not yet deployed." },
        { status: 200 }
      );
    }

    return NextResponse.json({ donors });
  } catch (err) {
    console.error("[match-donors] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
