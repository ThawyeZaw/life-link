import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/org/join
 * Body: { inviteCode: string }
 * Joins the logged-in user to the organization with that invite code.
 */
export const POST = async (req: Request) => {
  const { inviteCode } = await req.json();
  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code required" }, { status: 400 });
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
    .select("id, name")
    .eq("invite_code", String(inviteCode).trim().toUpperCase())
    .maybeSingle();

  if (!org) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  const { error } = await admin
    .from("organization_members")
    .upsert(
      { org_id: org.id, user_id: user.id },
      { onConflict: "org_id,user_id", ignoreDuplicates: true }
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orgName: org.name });
};
