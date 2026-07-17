// ============================================================================
// LifeLink — GET /api/hospitals
// Thaw Ye Zaw — Backend / Database Domain
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

/**
 * GET — List all approved hospitals
 * Response: { hospitals: Hospital[] }
 */
export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("verification_status", "APPROVED")
      .order("name");

    if (error) throw error;

    return NextResponse.json({ hospitals: data });
  } catch (err) {
    console.error("[hospitals] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch hospitals" },
      { status: 500 }
    );
  }
}
