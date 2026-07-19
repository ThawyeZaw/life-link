import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";
import type { Organization, Profile } from "@/lib/types";

const DashboardPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .limit(1)
    .maybeSingle<Organization>();

  if (!profile) return null;

  return <DashboardClient profile={profile} org={org} />;
};

export default DashboardPage;
