// ============================================================================
// LifeLink — /api/profile
// Thaw Ye Zaw — Backend / Database Domain
// ============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// ----------------------------------------------------------------------------
// GET — Get the current user's profile
// ----------------------------------------------------------------------------
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
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("[profile] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------------
// PUT — Update the current user's profile
// Body: Partial<Profile> (any subset of profile fields)
// ----------------------------------------------------------------------------
export async function PUT(request: Request) {
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

    // Prevent users from changing their own id
    delete body.id;

    const { data, error } = await supabase
      .from("profiles")
      .update(body)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile: data });
  } catch (err) {
    console.error("[profile] PUT Error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
