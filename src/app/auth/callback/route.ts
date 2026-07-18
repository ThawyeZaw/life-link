// ============================================================================
// LifeLink — OAuth / Email confirmation callback
// Exchanges the auth code for a session, finalises pending organisation
// creation, and routes new users to profile completion when needed.
// ============================================================================

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Code exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/login`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Finalise a pending organisation (signup happened before email confirm)
  const meta = user.user_metadata || {};
  if (meta.account_type === "organisation" && meta.pending_org_name) {
    const { data: memberships } = await supabase
      .from("organization_members")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (!memberships || memberships.length === 0) {
      const { error: orgError } = await supabase.rpc("create_organization", {
        p_name: meta.pending_org_name,
        p_org_type: meta.pending_org_type || "ngo",
        p_township: meta.township || null,
        p_phone: meta.phone || null,
      });
      if (orgError) {
        console.error("[auth/callback] create_organization failed:", orgError.message);
      }
    }
  }

  // First-time OAuth users have no blood type / township yet
  const { data: profile } = await supabase
    .from("profiles")
    .select("blood_type, township, account_type")
    .eq("id", user.id)
    .single();

  const incomplete =
    !profile ||
    (profile.account_type === "user" && (!profile.blood_type || !profile.township));

  if (incomplete) {
    return NextResponse.redirect(
      `${origin}/auth/complete-profile?next=${encodeURIComponent(next)}`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
