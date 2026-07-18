import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getManagedRequest } from "@/lib/authz";
import { sendDonorInviteEmail } from "@/lib/email";

/**
 * POST /api/invite
 * Body: { requestId: string, donorIds: string[] }
 * Creates match records (with secret tokens) and emails each donor an
 * accept/decline link. Donor contact info is never returned to the client.
 */
export const POST = async (req: Request) => {
  const { requestId, donorIds } = await req.json();
  if (!requestId || !Array.isArray(donorIds) || donorIds.length === 0) {
    return NextResponse.json({ error: "requestId and donorIds required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const request = await getManagedRequest(admin, requestId, user.id);
  if (!request) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  // Distances (for the email) — from the wide-radius candidate list
  const { data: candidates } = await admin.rpc("find_nearby_donors", {
    p_request_id: requestId,
    p_radius_km: 100,
  });
  const distanceOf = new Map<string, number>(
    (candidates ?? []).map((c: { donor_id: string; distance_km: number }) => [
      c.donor_id,
      c.distance_km,
    ])
  );

  // Create matches (skip donors already invited)
  const rows = donorIds.map((id: string) => ({
    request_id: requestId,
    donor_id: id,
    distance_km: distanceOf.get(id) ?? null,
  }));
  const { error: upsertError } = await admin
    .from("matches")
    .upsert(rows, { onConflict: "request_id,donor_id", ignoreDuplicates: true });
  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // Fetch tokens + donor emails for the invited set
  const { data: matches } = await admin
    .from("matches")
    .select("donor_id, token, status, profiles:donor_id(full_name, email)")
    .eq("request_id", requestId)
    .in("donor_id", donorIds)
    .eq("status", "INVITED");

  const hospital = request.hospitals;
  const results = await Promise.allSettled(
    (matches ?? []).map((m) => {
      const donor = m.profiles as unknown as { full_name: string; email: string };
      return sendDonorInviteEmail({
        to: donor.email,
        donorName: donor.full_name,
        bloodType: request.blood_type,
        urgency: request.urgency,
        unitsNeeded: request.units_needed,
        hospitalName: hospital?.name ?? "the hospital",
        hospitalTownship: hospital?.township ?? null,
        distanceKm: distanceOf.get(m.donor_id) ?? null,
        token: m.token,
      });
    })
  );

  const emailed = results.filter(
    (r) => r.status === "fulfilled" && r.value.sent
  ).length;

  return NextResponse.json({
    invited: matches?.length ?? 0,
    emailed,
  });
};
