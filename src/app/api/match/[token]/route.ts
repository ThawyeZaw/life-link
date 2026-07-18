import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Donor-facing, token-authenticated endpoints (opened from the email link —
 * no login required; the secret token itself authorizes the donor).
 *
 * GET  /api/match/[token]         → safe request summary for the donor
 * POST /api/match/[token]         → { action: "accept", phone, note } | { action: "decline" }
 */

const fetchMatch = async (token: string) => {
  const admin = createAdminClient();
  const { data: match } = await admin
    .from("matches")
    .select(
      `id, status, distance_km, responded_at,
       requests(id, blood_type, units_needed, urgency, status, patient_name,
         hospitals(name, name_mya, township, address, phone, lat, lng)),
       profiles:donor_id(full_name)`
    )
    .eq("token", token)
    .single();
  return { admin, match };
};

export const GET = async (
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) => {
  const { token } = await params;
  const { match } = await fetchMatch(token);
  if (!match) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  const request = match.requests as unknown as Record<string, unknown>;
  const donor = match.profiles as unknown as { full_name: string };

  return NextResponse.json({
    match: {
      id: match.id,
      status: match.status,
      distance_km: match.distance_km,
      donor_first_name: donor?.full_name?.split(" ")[0] ?? "Donor",
    },
    request,
  });
};

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) => {
  const { token } = await params;
  const body = await req.json();
  const { admin, match } = await fetchMatch(token);

  if (!match) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }
  if (match.status !== "INVITED") {
    return NextResponse.json({ error: "Already responded" }, { status: 409 });
  }

  if (body.action === "accept") {
    if (!body.phone || String(body.phone).trim().length < 6) {
      return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
    }
    await admin
      .from("matches")
      .update({
        status: "ACCEPTED",
        contact_phone: String(body.phone).trim(),
        contact_note: body.note ? String(body.note).slice(0, 500) : null,
        responded_at: new Date().toISOString(),
      })
      .eq("id", match.id);

    const request = match.requests as unknown as { id: string; status: string };
    if (request.status === "OPEN") {
      await admin.from("requests").update({ status: "MATCHED" }).eq("id", request.id);
    }
    return NextResponse.json({ ok: true, status: "ACCEPTED" });
  }

  if (body.action === "decline") {
    await admin
      .from("matches")
      .update({ status: "DECLINED", responded_at: new Date().toISOString() })
      .eq("id", match.id);
    return NextResponse.json({ ok: true, status: "DECLINED" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
};
