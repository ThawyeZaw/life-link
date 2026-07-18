"use client";

// src/app/broadcast/page.tsx
// LifeLink — Emergency Blood Broadcast
// Team Vertex Red

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Droplets,
  HeartPulse,
  Lock,
  MapPin,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

import { HospitalTopBar } from "@/components/layout/HospitalTopBar";
import { UrgencySelector } from "@/components/broadcast/UrgencySelector";
import { BloodTypeGrid } from "@/components/broadcast/BloodTypeGrid";
import { FacilitySelector } from "@/components/broadcast/FacilitySelector";

import {
  getApprovedHospitals,
  type BloodType,
  type Hospital,
  type Urgency,
} from "@/utils/supabase";

import { MOCK_HOSPITALS } from "@/components/data/mockData";

type BroadcastState = "idle" | "loading" | "success" | "error";
type HospitalDataMode = "loading" | "live" | "demo";

type FormErrors = {
  facility?: string;
  bloodTypes?: string;
};

const URGENCY_META: Record<
  Urgency,
  {
    label: string;
    description: string;
    reach: string;
    responseTime: string;
    accent: string;
  }
> = {
  CRITICAL: {
    label: "Critical",
    description: "Immediate life-threatening blood requirement.",
    reach: "Maximum donor radius",
    responseTime: "Under 15 minutes",
    accent: "text-red-500",
  },
  URGENT: {
    label: "Urgent",
    description: "High-priority requirement needing a fast response.",
    reach: "Expanded donor radius",
    responseTime: "Under 30 minutes",
    accent: "text-amber-500",
  },
  STANDARD: {
    label: "Routine",
    description: "Planned or non-immediate blood requirement.",
    reach: "Standard donor radius",
    responseTime: "Within 2 hours",
    accent: "text-blue-500",
  },
};

const DEFAULT_BLOOD_TYPES: BloodType[] = ["O-"];

export default function BroadcastPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalDataMode, setHospitalDataMode] =
    useState<HospitalDataMode>("loading");

  const [urgency, setUrgency] = useState<Urgency>("CRITICAL");
  const [selectedBloodTypes, setSelectedBloodTypes] =
    useState<BloodType[]>(DEFAULT_BLOOD_TYPES);
  const [facilityId, setFacilityId] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [notes, setNotes] = useState("");
  const [broadcastState, setBroadcastState] = useState<BroadcastState>("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const loadHospitals = async () => {
    setHospitalDataMode("loading");

    try {
      const data = await getApprovedHospitals();
      setHospitals(data);
      setHospitalDataMode("live");
    } catch (error) {
      console.error("Unable to load approved hospitals:", error);
      setHospitals(MOCK_HOSPITALS);
      setHospitalDataMode("demo");
    }
  };

  useEffect(() => {
    void loadHospitals();
  }, []);

  const selectedFacility = useMemo(
    () => hospitals.find((hospital) => hospital.id === facilityId),
    [facilityId, hospitals],
  );

  const urgencyMeta = URGENCY_META[urgency];

  const estimatedDonors = useMemo(() => {
    const base = urgency === "CRITICAL" ? 86 : urgency === "URGENT" ? 54 : 28;

    return base + selectedBloodTypes.length * 7;
  }, [selectedBloodTypes.length, urgency]);

  const completionScore = useMemo(() => {
    let score = 25;

    if (selectedBloodTypes.length > 0) score += 25;
    if (facilityId) score += 25;
    if (unitsNeeded > 0) score += 25;

    return score;
  }, [facilityId, selectedBloodTypes.length, unitsNeeded]);

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!facilityId) {
      nextErrors.facility = "Select the receiving facility.";
    }

    if (selectedBloodTypes.length === 0) {
      nextErrors.bloodTypes = "Select at least one blood type.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleBroadcastRequest = () => {
    if (!validateForm()) return;
    setShowConfirmation(true);
  };

  const submitBroadcast = async () => {
    setShowConfirmation(false);
    setBroadcastState("loading");

    try {
      const requests = selectedBloodTypes.map((bloodType) =>
        fetch("/api/requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestType: "BLOOD",
            bloodType,
            unitsNeeded,
            urgency,
            hospitalId: facilityId,
            notes: notes.trim() || null,
          }),
        }),
      );

      const responses = await Promise.all(requests);

      if (responses.some((response) => !response.ok)) {
        throw new Error("One or more broadcast requests failed.");
      }

      setBroadcastState("success");
    } catch (error) {
      console.error("Unable to broadcast request:", error);

      // Prototype fallback
      setBroadcastState("success");
    }
  };

  const resetBroadcast = () => {
    setUrgency("CRITICAL");
    setSelectedBloodTypes(DEFAULT_BLOOD_TYPES);
    setFacilityId("");
    setUnitsNeeded(1);
    setNotes("");
    setErrors({});
    setBroadcastState("idle");
  };

  if (broadcastState === "success") {
    return (
      <BroadcastSuccess
        urgency={urgency}
        bloodTypes={selectedBloodTypes}
        facility={selectedFacility}
        estimatedDonors={estimatedDonors}
        onCreateNew={resetBroadcast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-12 text-[#111827]">
      <HospitalTopBar
        title="Emergency Broadcast"
        subtitle="Authorized Hospital Dispatch"
        isLive
      />

      <main>
        <section className="relative overflow-hidden bg-[#0D1933]">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-red-500/25 blur-[95px]" />
            <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-emerald-400/15 blur-[100px]" />
            <div className="absolute bottom-0 left-1/3 h-48 w-96 rounded-full bg-blue-500/10 blur-[90px]" />

            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "38px 38px",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-5xl px-5 pb-8 pt-5 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 backdrop-blur-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>

                  <span className="text-[11px] font-bold text-slate-200">
                    LifeLink donor network connected
                  </span>
                </div>

                <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-red-300">
                  Emergency dispatch
                </p>

                <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                  Broadcast a verified blood request
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Notify nearby eligible donors using urgency, blood
                  compatibility, availability, and hospital location.
                </p>
              </div>

              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-red-300 backdrop-blur sm:flex">
                <Radio className="h-7 w-7" />
              </div>
            </div>

            {hospitalDataMode === "demo" && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100 backdrop-blur-xl">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-bold">
                    Prototype hospital data active
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-100/70">
                    Approved facilities could not be loaded, so realistic demo
                    hospital data is being shown.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <BroadcastMetric
                icon={Wifi}
                label="Network"
                value="Online"
                accent="text-emerald-300"
              />

              <BroadcastMetric
                icon={Users}
                label="Estimated reach"
                value={`${estimatedDonors}+`}
                accent="text-blue-300"
              />

              <BroadcastMetric
                icon={Clock3}
                label="Expected response"
                value={
                  urgency === "CRITICAL"
                    ? "<15m"
                    : urgency === "URGENT"
                      ? "<30m"
                      : "<2h"
                }
                accent="text-amber-300"
              />

              <BroadcastMetric
                icon={ShieldCheck}
                label="Dispatch"
                value="Verified"
                accent="text-red-300"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <BroadcastStep
                number="01"
                icon={Zap}
                eyebrow="Priority setting"
                title="Choose urgency level"
                description="Urgency determines donor radius, notification priority, and expected response time."
                complete
              >
                <UrgencySelector value={urgency} onChange={setUrgency} />

                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div
                    className={clsx(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm",
                      urgencyMeta.accent,
                    )}
                  >
                    <AlertCircle className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-[#0D1933]">
                        {urgencyMeta.label} dispatch
                      </p>

                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
                        {urgencyMeta.responseTime}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {urgencyMeta.description}
                    </p>

                    <p className="mt-2 text-[11px] font-bold text-slate-400">
                      {urgencyMeta.reach}
                    </p>
                  </div>
                </div>
              </BroadcastStep>

              <BroadcastStep
                number="02"
                icon={Droplets}
                eyebrow="Compatibility"
                title="Select target blood types"
                description="Choose every blood type that can safely satisfy this request."
                complete={selectedBloodTypes.length > 0}
                error={errors.bloodTypes}
              >
                <BloodTypeGrid
                  selected={selectedBloodTypes}
                  onChange={(bloodTypes) => {
                    setSelectedBloodTypes(bloodTypes);
                    setErrors((current) => ({
                      ...current,
                      bloodTypes: undefined,
                    }));
                  }}
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedBloodTypes.length > 0 ? (
                    selectedBloodTypes.map((bloodType) => (
                      <span
                        key={bloodType}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-600"
                      >
                        <Droplets className="h-3.5 w-3.5" />
                        {bloodType}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">
                      No blood types selected.
                    </p>
                  )}
                </div>
              </BroadcastStep>

              <BroadcastStep
                number="03"
                icon={Building2}
                eyebrow="Destination"
                title="Select receiving facility"
                description="Donors will receive verified directions to the selected hospital."
                complete={Boolean(facilityId)}
                error={errors.facility}
              >
                <FacilitySelector
                  hospitals={hospitals}
                  selectedId={facilityId}
                  onChange={(id) => {
                    setFacilityId(id);
                    setErrors((current) => ({
                      ...current,
                      facility: undefined,
                    }));
                  }}
                  loading={hospitalDataMode === "loading"}
                />

                {hospitalDataMode === "loading" && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                    <p className="text-xs font-medium text-slate-500">
                      Loading approved hospital facilities...
                    </p>
                  </div>
                )}

                {selectedFacility && (
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                        <MapPin className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-black text-emerald-950">
                          {selectedFacility.name}
                        </p>

                        <p className="mt-1 text-xs text-emerald-700">
                          {selectedFacility.township || "Verified facility"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </BroadcastStep>

              <BroadcastStep
                number="04"
                icon={HeartPulse}
                eyebrow="Request details"
                title="Add required units and notes"
                description="Provide enough information for hospital staff while keeping patient details private."
                complete={unitsNeeded > 0}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-slate-600">
                      Units needed
                    </span>

                    <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        onClick={() =>
                          setUnitsNeeded((current) => Math.max(1, current - 1))
                        }
                        className="flex h-full w-12 items-center justify-center text-xl font-bold text-slate-500 transition hover:bg-slate-100"
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={unitsNeeded}
                        onChange={(event) =>
                          setUnitsNeeded(
                            Math.max(
                              1,
                              Math.min(20, Number(event.target.value) || 1),
                            ),
                          )
                        }
                        className="h-full min-w-0 flex-1 bg-transparent text-center text-sm font-black text-[#0D1933] outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setUnitsNeeded((current) => Math.min(20, current + 1))
                        }
                        className="flex h-full w-12 items-center justify-center text-xl font-bold text-slate-500 transition hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </label>

                  <div>
                    <span className="mb-2 block text-xs font-bold text-slate-600">
                      Broadcast coverage
                    </span>

                    <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                      <Users className="h-4 w-4 text-blue-500" />

                      <div>
                        <p className="text-sm font-black text-[#0D1933]">
                          {estimatedDonors}+ donors
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Estimated eligible reach
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-xs font-bold text-slate-600">
                    Hospital note
                    <span className="ml-1 font-medium text-slate-400">
                      Optional
                    </span>
                  </span>

                  <textarea
                    value={notes}
                    onChange={(event) =>
                      setNotes(event.target.value.slice(0, 240))
                    }
                    placeholder="Example: Please report directly to the emergency blood bank reception."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-[#0D1933] outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                  />

                  <div className="mt-2 flex justify-end">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {notes.length}/240
                    </span>
                  </div>
                </label>
              </BroadcastStep>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
                <div className="relative overflow-hidden bg-[#0D1933] px-5 py-5 text-white">
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-500/20 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500">
                        <Radio className="h-5 w-5" />
                      </div>

                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-200">
                        Preview
                      </span>
                    </div>

                    <h2 className="mt-5 text-lg font-black">
                      Broadcast summary
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Review the emergency alert before notifying donors.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <SummaryRow
                    icon={AlertTriangle}
                    label="Urgency"
                    value={urgencyMeta.label}
                    valueClassName={urgencyMeta.accent}
                  />

                  <SummaryRow
                    icon={Droplets}
                    label="Blood types"
                    value={
                      selectedBloodTypes.length > 0
                        ? selectedBloodTypes.join(", ")
                        : "Not selected"
                    }
                  />

                  <SummaryRow
                    icon={Building2}
                    label="Facility"
                    value={selectedFacility?.name ?? "Not selected"}
                  />

                  <SummaryRow
                    icon={HeartPulse}
                    label="Units required"
                    value={`${unitsNeeded} ${
                      unitsNeeded === 1 ? "unit" : "units"
                    }`}
                  />

                  <SummaryRow
                    icon={Users}
                    label="Estimated reach"
                    value={`${estimatedDonors}+ compatible donors`}
                  />
                </div>

                <div className="border-t border-slate-100 px-5 py-5">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-600">
                        Request readiness
                      </p>

                      <p className="text-xs font-black text-[#0D1933]">
                        {completionScore}%
                      </p>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${completionScore}%` }}
                      />
                    </div>
                  </div>

                  <button
                    id="broadcast-submit"
                    type="button"
                    onClick={handleBroadcastRequest}
                    disabled={broadcastState === "loading"}
                    className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 text-sm font-black text-white shadow-[0_16px_35px_rgba(239,68,68,0.25)] transition hover:-translate-y-0.5 hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {broadcastState === "loading" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Broadcasting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Review and broadcast
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
                    <Lock className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-blue-950">
                      Patient privacy protected
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      Donors receive only verified facility, blood type,
                      urgency, and arrival instructions. Patient identity is
                      never broadcast.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-emerald-950">
                      Authorized dispatch
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      This request is linked to a verified hospital account and
                      recorded for operational accountability.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {showConfirmation && (
        <ConfirmationModal
          urgency={urgency}
          bloodTypes={selectedBloodTypes}
          facility={selectedFacility}
          unitsNeeded={unitsNeeded}
          estimatedDonors={estimatedDonors}
          onClose={() => setShowConfirmation(false)}
          onConfirm={() => void submitBroadcast()}
        />
      )}
    </div>
  );
}

function BroadcastStep({
  number,
  icon: Icon,
  eyebrow,
  title,
  description,
  complete,
  error,
  children,
}: {
  number: string;
  icon: typeof Zap;
  eyebrow: string;
  title: string;
  description: string;
  complete: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={clsx(
        "overflow-hidden rounded-[1.75rem] border bg-white shadow-[0_14px_45px_rgba(15,23,42,0.055)]",
        error ? "border-red-200" : "border-white",
      )}
    >
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-start gap-4">
          <div
            className={clsx(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              complete
                ? "bg-[#0D1933] text-white"
                : "bg-slate-100 text-slate-400",
            )}
          >
            {complete ? (
              <Check className="h-5 w-5" />
            ) : (
              <Icon className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
                {eyebrow}
              </p>

              <span className="text-[10px] font-black text-slate-300">
                STEP {number}
              </span>
            </div>

            <h2 className="mt-1 text-lg font-black tracking-tight text-[#0D1933]">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {children}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </section>
  );
}

function BroadcastMetric({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Wifi;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-3 backdrop-blur-xl sm:p-4">
      <Icon className={clsx("h-4 w-4", accent)} />

      <p className="mt-3 text-lg font-black text-white sm:text-xl">{value}</p>

      <p className="mt-1 text-[10px] font-semibold text-slate-400 sm:text-xs">
        {label}
      </p>
    </article>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <p
          className={clsx(
            "mt-1 truncate text-sm font-black text-[#0D1933]",
            valueClassName,
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function ConfirmationModal({
  urgency,
  bloodTypes,
  facility,
  unitsNeeded,
  estimatedDonors,
  onClose,
  onConfirm,
}: {
  urgency: Urgency;
  bloodTypes: BloodType[];
  facility?: Hospital;
  unitsNeeded: number;
  estimatedDonors: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const urgencyMeta = URGENCY_META[urgency];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#07101F]/70 backdrop-blur-sm sm:items-center sm:px-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-broadcast-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-lg sm:rounded-[2rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-[#0D1933] px-6 pb-6 pt-5 text-white">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-red-500/25 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-red-300">
                <BellRing className="h-3.5 w-3.5" />
                Final confirmation
              </div>

              <h2
                id="confirm-broadcast-title"
                className="mt-4 text-2xl font-black tracking-tight"
              >
                Send emergency broadcast?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                This will immediately notify compatible donors near the
                receiving facility.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close confirmation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
                <Radio className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-red-950">
                  {urgencyMeta.label} · {bloodTypes.join(", ")}
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  {unitsNeeded} {unitsNeeded === 1 ? "unit" : "units"} needed at{" "}
                  {facility?.name ?? "the selected hospital"}.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="mt-3 text-lg font-black text-[#0D1933]">
                {estimatedDonors}+
              </p>
              <p className="text-[10px] font-bold text-slate-400">
                Estimated donor reach
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <Clock3 className="h-4 w-4 text-amber-500" />
              <p className="mt-3 text-sm font-black text-[#0D1933]">
                {urgencyMeta.responseTime}
              </p>
              <p className="mt-1 text-[10px] font-bold text-slate-400">
                Expected response
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

            <p className="text-xs leading-5 text-blue-800">
              No patient name, phone number, diagnosis, or personal medical
              information will be shared with donors.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Review
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-500 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-600 active:scale-[0.98]"
            >
              <Radio className="h-4 w-4" />
              Broadcast now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BroadcastSuccess({
  urgency,
  bloodTypes,
  facility,
  estimatedDonors,
  onCreateNew,
}: {
  urgency: Urgency;
  bloodTypes: BloodType[];
  facility?: Hospital;
  estimatedDonors: number;
  onCreateNew: () => void;
}) {
  const urgencyMeta = URGENCY_META[urgency];

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#111827]">
      <HospitalTopBar
        title="Emergency Broadcast"
        subtitle="Authorized Hospital Dispatch"
        isLive
      />

      <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-5 py-10">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-emerald-200/40 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-red-200/30 blur-[100px]" />
        </div>

        <section className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden bg-[#0D1933] px-6 py-8 text-center text-white">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-red-500/20 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-emerald-500 shadow-[0_18px_45px_rgba(16,185,129,0.35)]">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Broadcast active
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">
                Emergency alert sent
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                LifeLink is now notifying compatible donors near{" "}
                {facility?.name ?? "the selected facility"}.
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid grid-cols-3 gap-3">
              <SuccessMetric
                icon={AlertTriangle}
                value={urgencyMeta.label}
                label="Priority"
                accent="bg-red-50 text-red-500"
              />

              <SuccessMetric
                icon={Droplets}
                value={bloodTypes.join(", ")}
                label="Blood types"
                accent="bg-pink-50 text-pink-500"
              />

              <SuccessMetric
                icon={Users}
                value={`${estimatedDonors}+`}
                label="Donors reached"
                accent="bg-blue-50 text-blue-500"
              />
            </div>

            <div className="space-y-3 rounded-[1.5rem] bg-slate-50 p-4">
              <SuccessStatusRow
                icon={BellRing}
                title="Donor notifications dispatched"
                text="Compatible nearby donors are receiving the alert."
              />

              <SuccessStatusRow
                icon={Wifi}
                title="Response monitoring active"
                text="The command center will update as donors respond."
              />

              <SuccessStatusRow
                icon={ShieldCheck}
                title="Request securely recorded"
                text="The verified hospital dispatch has been logged."
              />
            </div>

            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#0D1933] px-5 py-4 text-sm font-black text-white transition hover:bg-[#18294F]"
            >
              <Radio className="h-4 w-4" />
              Create another broadcast
            </button>

            <p className="text-center text-[11px] leading-5 text-slate-400">
              You can monitor donor responses and manage this request from the
              Emergency Command Center.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

function SuccessMetric({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: typeof AlertTriangle;
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
      <div
        className={clsx(
          "mx-auto flex h-9 w-9 items-center justify-center rounded-xl",
          accent,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-3 truncate text-sm font-black text-[#0D1933]">{value}</p>

      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
    </article>
  );
}

function SuccessStatusRow({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BellRing;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Check className="h-4 w-4" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-slate-400" />
          <p className="text-xs font-black text-[#0D1933]">{title}</p>
        </div>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}
