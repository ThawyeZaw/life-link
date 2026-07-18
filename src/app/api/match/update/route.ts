import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getManagedRequest } from "@/lib/authz";

/**
 * POST /api/match/update
 * Body: { matchId: string, action: "confirm" | "donated" | "cancel" }
 * Requester (or org member) drives the match lifecycle after a donor accepts:
 *   confirm  → match CONFIRMED + request CONFIRMED
 *   donated  → match DONATED   + request COMPLETED (+ donor cooldown)
 *   cancel   → match CANCELLED
 */
export const POST = async (req: Request) => {
  const { matchId, action } = await req.json();
  if (!matchId || !["confirm", "donated", "cancel"].includes(action)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: match } = await admin
    .from("matches")
    .select("id, request_id, donor_id, status")
    .eq("id", matchId)
    .single();
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const request = await getManagedRequest(admin, match.request_id, user.id);
  if (!request) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  if (action === "confirm") {
    if (match.status !== "ACCEPTED") {
      return NextResponse.json({ error: "Donor has not accepted yet" }, { status: 409 });
    }
    await admin.from("matches").update({ status: "CONFIRMED" }).eq("id", matchId);
    await admin.from("requests").update({ status: "CONFIRMED" }).eq("id", match.request_id);
  } else if (action === "donated") {
    if (!["CONFIRMED", "ACCEPTED"].includes(match.status)) {
      return NextResponse.json({ error: "Match is not confirmed" }, { status: 409 });
    }
    await admin.from("matches").update({ status: "DONATED" }).eq("id", matchId);
    await admin.from("requests").update({ status: "COMPLETED" }).eq("id", match.request_id);
    // 90-day donation cooldown for the donor
    await admin
      .from("profiles")
      .update({ last_donation_date: new Date().toISOString().slice(0, 10) })
      .eq("id", match.donor_id);
  } else {
    await admin.from("matches").update({ status: "CANCELLED" }).eq("id", matchId);
  }

  return NextResponse.json({ ok: true });
};
