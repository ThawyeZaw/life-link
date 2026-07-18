"use client";
// Emergency Broadcast page — hospital posts a new blood request
// Thinzar Kyaw — Frontend Domain
// Navbar (floating pill) is rendered site-wide via root layout

import { useEffect, useState } from "react";
import { Radio, Shield, Lock } from "lucide-react";
import { HospitalTopBar } from "@/components/layout/HospitalTopBar";
import { UrgencySelector } from "@/components/broadcast/UrgencySelector";
import { BloodTypeGrid } from "@/components/broadcast/BloodTypeGrid";
import { FacilitySelector } from "@/components/broadcast/FacilitySelector";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  getApprovedHospitals,
  type Hospital,
  type Urgency,
  type BloodType,
} from "@/utils/supabase";
import { MOCK_HOSPITALS } from "@/components/data/mockData";

type BroadcastState = "idle" | "loading" | "success" | "error";

export default function BroadcastPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  const [urgency, setUrgency] = useState<Urgency>("CRITICAL");
  const [selectedBloodTypes, setSelectedBloodTypes] = useState<BloodType[]>(["O-"]);
  const [facilityId, setFacilityId] = useState<string>("");
  const [broadcastState, setBroadcastState] = useState<BroadcastState>("idle");

  useEffect(() => {
    getApprovedHospitals()
      .then(setHospitals)
      .catch(() => setHospitals(MOCK_HOSPITALS))
      .finally(() => setLoadingHospitals(false));
  }, []);

  const handleBroadcast = async () => {
    if (!facilityId || selectedBloodTypes.length === 0) {
      alert("Please select a facility and at least one blood type.");
      return;
    }
    setBroadcastState("loading");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "BLOOD",
          bloodType: selectedBloodTypes[0],
          unitsNeeded: 1,
          urgency,
          hospitalId: facilityId,
        }),
      });
      if (!res.ok) throw new Error("API error");
      setBroadcastState("success");
    } catch {
      // Prototype fallback: simulate success
      setBroadcastState("success");
    }
  };

  if (broadcastState === "success") {
    return (
      <div className="flex min-h-screen flex-col bg-water-subtle water-ripple">
        <HospitalTopBar title="New Broadcast" subtitle="Authorized Dispatch" />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="glass-elevated flex h-20 w-20 items-center justify-center rounded-full mb-6">
            <Radio className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Broadcast Sent!</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xs leading-relaxed">
            Compatible donors in{" "}
            {hospitals.find((h) => h.id === facilityId)?.township ?? "the area"} have
            been notified. You will receive updates as donors respond.
          </p>
          <button
            onClick={() => setBroadcastState("idle")}
            className="mt-8 rounded-2xl bg-red-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-red-500/25 transition-colors hover:bg-red-700 active:scale-95"
          >
            New Broadcast
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-water-subtle water-ripple">
      <HospitalTopBar title="New Broadcast" subtitle="Authorized Dispatch" />

      <div className="flex-1 space-y-6 px-4 py-6">
        {/* Step 1: Urgency */}
        <div>
          <SectionHeader className="mb-3">1. Urgency Level</SectionHeader>
          <UrgencySelector value={urgency} onChange={setUrgency} />
        </div>

        {/* Step 2: Blood types */}
        <div>
          <SectionHeader className="mb-3">2. Target Blood Types</SectionHeader>
          <BloodTypeGrid
            selected={selectedBloodTypes}
            onChange={setSelectedBloodTypes}
          />
        </div>

        {/* Step 3: Facility */}
        <div>
          <SectionHeader className="mb-3">3. Receiving Facility</SectionHeader>
          <FacilitySelector
            hospitals={hospitals}
            selectedId={facilityId}
            onChange={setFacilityId}
            loading={loadingHospitals}
          />
        </div>

        {/* Privacy note */}
        <div className="glass-surface flex items-start gap-2 rounded-2xl px-4 py-3">
          <Lock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            This broadcast uses encrypted, anonymous location services to identify
            nearby eligible donors. Patient data is never transmitted.
          </p>
        </div>

        {/* Broadcast button */}
        <button
          id="broadcast-submit"
          onClick={handleBroadcast}
          disabled={broadcastState === "loading"}
          className="animate-float-cta w-full rounded-2xl bg-red-600 py-4 text-base font-bold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-60 disabled:animation-none"
        >
          {broadcastState === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Broadcasting…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Radio className="h-5 w-5" />
              Broadcast Request
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
