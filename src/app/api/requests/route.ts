// ============================================================================
// Vertex Red — /api/requests
// Thaw Ye Zaw — Backend / Database Domain
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// ----------------------------------------------------------------------------
// GET — List active blood & medical supply requests
// Query params: ?urgency=CRITICAL|URGENT|STANDARD (optional)
// ----------------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const urgency = searchParams.get("urgency");

    let query = supabase
      .from("requests")
      .select(`
        *,
        requester:requester_id(id, full_name, phone, blood_type),
        hospital:hospital_id(id, name, township, phone)
      `)
      .in("status", ["OPEN", "IN_PROGRESS"])
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (urgency) {
      query = query.eq("urgency", urgency);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ requests: data });
  } catch (err) {
    console.error("[requests] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------------
// POST — Create a new blood or medical supply request
// Body: { requestType, bloodType?, supplyDetails?, unitsNeeded, urgency, township?, lat?, lng?, hospitalId?, expiresAt? }
// ----------------------------------------------------------------------------
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
    const {
      requestType,
      bloodType,
      supplyDetails,
      unitsNeeded = 1,
      urgency = "STANDARD",
      township,
      lat,
      lng,
      hospitalId,
      expiresAt,
    } = body;

    if (!requestType || !["BLOOD", "MEDICAL_SUPPLY"].includes(requestType)) {
      return NextResponse.json(
        { error: "requestType must be 'BLOOD' or 'MEDICAL_SUPPLY'" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("requests")
      .insert({
        requester_id: user.id,
        hospital_id: hospitalId || null,
        request_type: requestType,
        blood_type: requestType === "BLOOD" ? bloodType : null,
        supply_details: requestType === "MEDICAL_SUPPLY" ? supplyDetails : null,
        units_needed: unitsNeeded,
        urgency,
        township,
        lat,
        lng,
        expires_at: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ request: data }, { status: 201 });
  } catch (err) {
    console.error("[requests] POST Error:", err);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
