import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RequestFlow } from "@/components/radar/RequestFlow";
import type { BloodRequest } from "@/lib/types";

const RequestPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("requests")
    .select("*, hospitals(id, name, name_mya, township, address, phone, lat, lng)")
    .eq("id", id)
    .single();

  if (!request) notFound();

  const { data: matches } = await supabase.rpc("get_request_matches", {
    p_request_id: id,
  });

  return (
    <div className="mx-auto max-w-md px-4 py-6 md:max-w-lg">
      <RequestFlow
        request={request as BloodRequest}
        initialHasMatches={(matches?.length ?? 0) > 0}
      />
    </div>
  );
};

export default RequestPage;
