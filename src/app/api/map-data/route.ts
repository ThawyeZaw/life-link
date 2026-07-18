// ⚠️ CROSS-BOUNDARY: This file is in Thaw Ye Zaw's domain (/api/) but was created
// as part of the interactive map feature (Thinzar Kyaw — Frontend Domain).
// Review with both owners before merging.

// ============================================================================
// LifeLink — GET /api/map-data
// Returns hospitals, active requests, and available donors for the interactive
// map. PUBLIC endpoint — no auth required (only non-sensitive location data).
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const supabase = createClient(await cookies());

    // Fetch hospitals, open requests (with requester info), and available donors in parallel
    const [hospitalsRes, requestsRes, donorsRes] = await Promise.all([
      supabase
        .from("hospitals")
        .select("*")
        .eq("verification_status", "APPROVED")
        .order("name"),
      supabase
        .from("requests")
        .select("id, blood_type, units_needed, urgency, township, lat, lng, created_at, hospital_id, requester_id")
        .in("status", ["OPEN", "IN_PROGRESS"])
        .order("urgency", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, blood_type, township, lat, lng, last_donation_date")
        .eq("is_available", true)
        .not("blood_type", "is", null)
        .not("lat", "is", null)
        .not("lng", "is", null),
    ]);

    // Fetch hospital names for requests
    let hospitalMap: Record<string, string> = {};
    if (requestsRes.data && requestsRes.data.length > 0) {
      const hospitalIds = [...new Set(requestsRes.data.map(r => r.hospital_id).filter(Boolean))];
      if (hospitalIds.length > 0) {
        const { data: hospitals } = await supabase
          .from("hospitals")
          .select("id, name")
          .in("id", hospitalIds);
        if (hospitals) {
          hospitalMap = Object.fromEntries(hospitals.map(h => [h.id, h.name]));
        }
      }
    }

    const requestsWithHospital = (requestsRes.data || []).map(r => ({
      ...r,
      hospital_name: hospitalMap[r.hospital_id] || null,
    }));

    return NextResponse.json({
      hospitals: hospitalsRes.data || [],
      requests: requestsWithHospital,
      donors: donorsRes.data || [],
    });
  } catch (err) {
    console.error("[map-data] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch map data" },
      { status: 500 }
    );
  }
}
