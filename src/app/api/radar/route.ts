import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getManagedRequest } from "@/lib/authz";

/**
 * POST /api/radar
 * Body: { requestId: string, radiusKm?: number }
 * Returns privacy-safe donor candidates near the request's hospital.
 * Only the requester (or their organization members) may search.
 */
export const POST = async (req: Request) => {
  const { requestId, radiusKm = 15 } = await req.json();
  if (!requestId) {
    return NextResponse.json({ error: "requestId required" }, { status: 400 });
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

  const { data: donors, error } = await admin.rpc("find_nearby_donors", {
    p_request_id: requestId,
    p_radius_km: Math.min(Number(radiusKm) || 15, 100),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ donors: donors ?? [] });
};
