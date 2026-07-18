import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/auth/signup
 * Body: { email, password, full_name, account_type: "individual"|"organization",
 *         phone?, blood_type?, township?, lat?, lng?,
 *         org_name?, org_type? }
 * Creates a pre-confirmed user (no email verification — hackathon friendly).
 * For organization accounts, also creates the organization + admin membership.
 */
export const POST = async (req: Request) => {
  const body = await req.json();
  const { email, password, full_name, account_type } = body;

  if (!email || !password || !full_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      account_type: account_type === "organization" ? "organization" : "individual",
      phone: body.phone ?? "",
      blood_type: body.blood_type ?? "",
      township: body.township ?? "",
      lat: body.lat != null ? String(body.lat) : "",
      lng: body.lng != null ? String(body.lng) : "",
    },
  });

  if (error) {
    const msg = error.message.includes("already been registered")
      ? "An account with this email already exists"
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (account_type === "organization") {
    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({
        name: body.org_name || full_name,
        org_type: body.org_type || "community",
        township: body.township || null,
        phone: body.phone || null,
        owner_id: created.user.id,
      })
      .select("id, invite_code")
      .single();

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    await admin.from("organization_members").insert({
      org_id: org.id,
      user_id: created.user.id,
      role: "admin",
    });
  }

  return NextResponse.json({ ok: true });
};
