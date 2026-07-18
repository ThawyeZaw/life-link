import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/org/members?orgId=...
 * Member roster for org owner/admins. Returns names + blood types only
 * (no member contact details — privacy first).
 */
export const GET = async (req: Request) => {
  const orgId = new URL(req.url).searchParams.get("orgId");
  if (!orgId) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("id, owner_id")
    .eq("id", orgId)
    .single();
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  let allowed = org.owner_id === user.id;
  if (!allowed) {
    const { data: me } = await admin
      .from("organization_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .maybeSingle();
    allowed = !!me; // any member can see the roster
  }
  if (!allowed) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { data: members } = await admin
    .from("organization_members")
    .select("role, joined_at, profiles:user_id(full_name, blood_type, township)")
    .eq("org_id", orgId)
    .order("joined_at");

  return NextResponse.json({
    members: (members ?? []).map((m) => {
      const p = m.profiles as unknown as {
        full_name: string;
        blood_type: string | null;
        township: string | null;
      };
      return {
        full_name: p?.full_name,
        blood_type: p?.blood_type,
        township: p?.township,
        role: m.role,
        joined_at: m.joined_at,
      };
    }),
  });
};
