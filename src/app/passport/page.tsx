"use client";
// Donor Passport page — full profile + dispatch + history
// Thinzar Kyaw — Frontend Domain

import { useEffect, useState } from "react";
import { DonorTopBar } from "@/components/layout/DonorTopBar";
import { DonorPassportCard } from "@/components/passport/DonorPassportCard";
import { EligibilitySection } from "@/components/passport/EligibilitySection";
import { ActiveDispatchCard } from "@/components/passport/ActiveDispatchCard";
import { DonationHistorySection } from "@/components/passport/DonationHistorySection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getMyProfile,
  getMyMatches,
  type Profile,
  type RequestWithDetails,
} from "@/utils/supabase";
import {
  MOCK_PROFILE,
  MOCK_ACTIVE_DISPATCH,
  MOCK_DONATION_HISTORY,
} from "@/components/data/mockData";

export default function PassportPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dispatch, setDispatch] = useState<RequestWithDetails | null>(null);
  const [donationCount, setDonationCount] = useState(14);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prof, matches] = await Promise.all([
          getMyProfile(),
          getMyMatches(),
        ]);
        setProfile(prof);
        setDonationCount(matches.filter((m) => m.status === "COMPLETED").length);
        // Find any active CRITICAL/URGENT match as the dispatch
        const criticalMatch = matches.find(
          (m) => m.request.urgency === "CRITICAL" && m.status === "PENDING"
        );
        if (criticalMatch) {
          // Build a minimal RequestWithDetails from the match for display
          setDispatch({
            id: criticalMatch.request.id,
            requester_id: "",
            hospital_id: null,
            request_type: "BLOOD",
            blood_type: criticalMatch.request.blood_type ?? null,
            supply_details: null,
            units_needed: criticalMatch.request.units_needed,
            urgency: criticalMatch.request.urgency,
            status: criticalMatch.request.status,
            township: criticalMatch.request.township ?? null,
            lat: null,
            lng: null,
            expires_at: "",
            created_at: criticalMatch.created_at,
            updated_at: criticalMatch.updated_at,
            requester: { id: "", full_name: "", phone: null, blood_type: null },
            hospital: null,
          });
        } else {
          setDispatch(MOCK_ACTIVE_DISPATCH);
        }
      } catch {
        // Unauthenticated / no Supabase — fall back to mock data
        setProfile(MOCK_PROFILE);
        setDispatch(MOCK_ACTIVE_DISPATCH);
        setDonationCount(14);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayProfile = profile ?? MOCK_PROFILE;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DonorTopBar title="Passport" />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-vr-teal border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4 pt-4 pb-4">
          {/* Hero card */}
          <DonorPassportCard
            profile={displayProfile}
            donationCount={donationCount}
          />

          {/* Eligibility */}
          <EligibilitySection />

          {/* Active dispatch */}
          {dispatch && (
            <div className="px-0">
              <SectionHeader className="px-5 mb-2">Active Dispatch</SectionHeader>
              <ActiveDispatchCard
                request={dispatch}
                distanceKm={1.8}
                onRespond={() => alert("Dispatch acknowledged! (prototype mode)")}
              />
            </div>
          )}

          {/* History, stats, badges */}
          <DonationHistorySection
            livesSaved={12}
            volumeLiters={3.5}
            history={MOCK_DONATION_HISTORY}
          />
        </div>
      )}

    </div>
  );
}
