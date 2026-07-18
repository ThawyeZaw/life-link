import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER ONLY. Returns the request row if `userId` may manage it
 * (is the requester, or a member of the request's organization), else null.
 */
export const getManagedRequest = async (
  admin: SupabaseClient,
  requestId: string,
  userId: string
) => {
  const { data: request } = await admin
    .from("requests")
    .select("*, hospitals(id, name, name_mya, township, address, phone, lat, lng)")
    .eq("id", requestId)
    .single();

  if (!request) return null;
  if (request.requester_id === userId) return request;

  if (request.organization_id) {
    const { data: membership } = await admin
      .from("organization_members")
      .select("id")
      .eq("org_id", request.organization_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (membership) return request;
  }
  return null;
};
