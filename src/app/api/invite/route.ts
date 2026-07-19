import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getManagedRequest } from "@/lib/authz";
import { sendDonorInviteEmail } from "@/lib/email";
import { sendTelegramInvite } from "@/lib/telegram";

/**
 * POST /api/invite
 * Body: { requestId: string, donorIds: string[] }
 * Creates match records (with secret tokens), then notifies each donor
 * via email AND/OR Telegram (if linked). Donor contact info is never
 * returned to the client.
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

  // Fetch tokens + donor contact info for the invited set
  const { data: matches, error: selectError } = await admin
    .from("matches")
    .select("donor_id, token, status, profiles:donor_id(full_name, email, telegram_chat_id)")
    .eq("request_id", requestId)
    .in("donor_id", donorIds)
    .eq("status", "INVITED");

  if (selectError) {
    console.error("[invite] failed to fetch matches:", selectError.message);
    return NextResponse.json(
      { error: "Failed to fetch match data — did you apply the telegram_chat_id migration?", detail: selectError.message },
      { status: 500 }
    );
  }

  const hospital = request.hospitals;

  type DonorInfo = { full_name: string; email: string; telegram_chat_id: number | null };

  // Send both email and Telegram for each donor (whichever channels are available)
  const results = await Promise.allSettled(
    (matches ?? []).map((m) => {
      const donor = m.profiles as unknown as DonorInfo;
      const payload = {
        donorName: donor.full_name,
        bloodType: request.blood_type,
        urgency: request.urgency,
        unitsNeeded: request.units_needed,
        hospitalName: hospital?.name ?? "the hospital",
        hospitalTownship: hospital?.township ?? null,
        distanceKm: distanceOf.get(m.donor_id) ?? null,
        token: m.token,
      };

      const delivers: Promise<{ channel: string; sent: boolean; reason?: string }>[] = [];

      // Email (always attempted)
      delivers.push(
        sendDonorInviteEmail({ to: donor.email, ...payload }).then((r) => ({
          channel: "email",
          ...r,
        }))
      );

      // Telegram (only if donor linked their account)
      if (donor.telegram_chat_id) {
        delivers.push(
          sendTelegramInvite(donor.telegram_chat_id, { to: donor.email, ...payload }).then(
            (r) => ({
              channel: "telegram",
              ...r,
            })
          )
        );
      }

      return Promise.allSettled(delivers);
    })
  );

  // Flatten nested results: match-level allSettled → individual channel results
  let emailed = 0;
  let telegrammed = 0;

  for (const matchResult of results) {
    if (matchResult.status !== "fulfilled") continue;
    for (const cr of matchResult.value) {
      if (cr.status === "fulfilled") {
        if (cr.value.channel === "email" && cr.value.sent) emailed++;
        if (cr.value.channel === "telegram" && cr.value.sent) telegrammed++;
      }
    }
  }

  // Collect failures
  const failures: { donor: string; channel: string; reason: string }[] = [];
  for (let i = 0; i < results.length; i++) {
    const matchResult = results[i];
    const m = matches![i];
    const donor = m.profiles as unknown as DonorInfo;
    if (matchResult.status === "rejected") {
      failures.push({ donor: donor.email, channel: "both", reason: "Promise rejected" });
    } else {
      for (const cr of matchResult.value) {
        if (cr.status === "rejected") {
          failures.push({ donor: donor.email, channel: "unknown", reason: "Promise rejected" });
        } else if (!cr.value.sent) {
          failures.push({
            donor: donor.email,
            channel: cr.value.channel,
            reason: cr.value.reason ?? "unknown",
          });
        }
      }
    }
  }

  if (failures.length > 0) {
    console.error(
      `[invite] ${failures.length} notification(s) failed:`,
      failures
    );
  }

  return NextResponse.json({
    invited: matches?.length ?? 0,
    emailed,
    telegrammed: telegrammed > 0 ? telegrammed : undefined,
    failures: failures.length > 0 ? failures : undefined,
  });
};
