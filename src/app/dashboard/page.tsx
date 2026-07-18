import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AvailabilityCard } from "@/components/dashboard/AvailabilityCard";
import { InvitationsList } from "@/components/dashboard/InvitationsList";
import { MyRequests } from "@/components/dashboard/MyRequests";
import { OrgSection } from "@/components/dashboard/OrgSection";
import { OrgCard } from "@/components/dashboard/OrgCard";
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
  const isOrg = profile.account_type === "organization";
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6 md:max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isOrg ? org?.name ?? profile.full_name : `Hi, ${firstName}`}
          </h1>
          <p className="text-base text-slate-500">
            {isOrg ? "Coordinate donors and requests." : "Thanks for being a lifesaver."}
          </p>
        </div>
      </div>

      <Link
        href="/requests/new"
        className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-red-600 text-base font-semibold text-white shadow-md transition-colors hover:bg-red-700"
      >
        <Plus className="h-5 w-5" /> Request blood
      </Link>

      {isOrg && org ? (
        <>
          <OrgCard org={org} />
          <MyRequests orgId={org.id} title="Organization requests" />
        </>
      ) : (
        <>
          <AvailabilityCard profile={profile} />
          <InvitationsList />
          <MyRequests />
          <OrgSection />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
