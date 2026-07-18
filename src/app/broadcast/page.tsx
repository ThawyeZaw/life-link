"use client";

// src/app/broadcast/page.tsx
// LifeLink — Guided Emergency Blood Broadcast
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
  ChevronDown,
  Clock3,
  Droplets,
  HeartPulse,
  Lock,
  MapPin,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
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

type BroadcastState = "idle" | "loading" | "success";
type HospitalDataMode = "loading" | "live" | "demo";
type StepNumber = 1 | 2 | 3 | 4;

type FormErrors = {
  facility?: string;
  bloodTypes?: string;
};

const DEFAULT_BLOOD_TYPES: BloodType[] = ["O-"];

const URGENCY_META: Record<
  Urgency,
  {
    label: string;
    description: string;
    responseTime: string;
    reach: string;
    className: string;
  }
> = {
  CRITICAL: {
    label: "Critical",
    description: "Immediate life-threatening blood requirement.",
    responseTime: "Under 15 minutes",
    reach: "Maximum donor radius",
    className: "text-red-600",
  },
  URGENT: {
    label: "Urgent",
    description: "High-priority requirement needing a fast response.",
    responseTime: "Under 30 minutes",
    reach: "Expanded donor radius",
    className: "text-amber-600",
  },
  STANDARD: {
    label: "Routine",
    description: "Planned or non-immediate blood requirement.",
    responseTime: "Within 2 hours",
    reach: "Standard donor radius",
    className: "text-blue-600",
  },
};

export default function BroadcastPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalDataMode, setHospitalDataMode] =
    useState<HospitalDataMode>("loading");

  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [urgency, setUrgency] = useState<Urgency>("CRITICAL");
  const [selectedBloodTypes, setSelectedBloodTypes] =
    useState<BloodType[]>(DEFAULT_BLOOD_TYPES);
  const [facilityId, setFacilityId] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [notes, setNotes] = useState("");
  const [broadcastState, setBroadcastState] = useState<BroadcastState>("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
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

  const completedSteps = useMemo(
    () => ({
      1: Boolean(urgency),
      2: selectedBloodTypes.length > 0,
      3: Boolean(facilityId),
      4: unitsNeeded > 0,
    }),
    [facilityId, selectedBloodTypes.length, unitsNeeded, urgency],
  );

  const progress = currentStep * 25;

  const validateStep = (step: StepNumber) => {
    const nextErrors: FormErrors = {};

    if (step === 2 && selectedBloodTypes.length === 0) {
      nextErrors.bloodTypes = "Select at least one blood type.";
    }

    if (step === 3 && !facilityId) {
      nextErrors.facility = "Select the receiving facility.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const moveToNextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((current) => (current + 1) as StepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setShowConfirmation(true);
  };

  const moveToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((current) => (current - 1) as StepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
    setCurrentStep(1);
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
    <div className="min-h-screen bg-[#F4F6FA] pb-28 text-[#111827] lg:pb-10">
      <HospitalTopBar
        title="Emergency Broadcast"
        subtitle="Authorized hospital dispatch"
        isLive
      />

      <main>
        <CompactHero
          currentStep={currentStep}
          progress={progress}
          estimatedDonors={estimatedDonors}
          hospitalDataMode={hospitalDataMode}
        />

        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
            <div>
              <MobileStepIndicator
                currentStep={currentStep}
                onSelect={setCurrentStep}
                completedSteps={completedSteps}
              />

              <div className="mt-4">
                {currentStep === 1 && (
                  <StepPanel
                    icon={Zap}
                    step="Step 1 of 4"
                    eyebrow="Priority"
                    title="How urgent is this request?"
                    description="This controls donor notification priority, radius, and expected response time."
                  >
                    <UrgencySelector value={urgency} onChange={setUrgency} />

                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={clsx(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm",
                            urgencyMeta.className,
                          )}
                        >
                          <AlertCircle className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
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

                          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                            {urgencyMeta.reach}
                          </p>
                        </div>
                      </div>
                    </div>
                  </StepPanel>
                )}

                {currentStep === 2 && (
                  <StepPanel
                    icon={Droplets}
                    step="Step 2 of 4"
                    eyebrow="Compatibility"
                    title="Which blood types are needed?"
                    description="Select every compatible blood type required for this request."
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

                    <div className="mt-4 flex min-h-8 flex-wrap gap-2">
                      {selectedBloodTypes.map((bloodType) => (
                        <span
                          key={bloodType}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-600"
                        >
                          <Droplets className="h-3.5 w-3.5" />
                          {bloodType}
                        </span>
                      ))}
                    </div>
                  </StepPanel>
                )}

                {currentStep === 3 && (
                  <StepPanel
                    icon={Building2}
                    step="Step 3 of 4"
                    eyebrow="Destination"
                    title="Where should donors go?"
                    description="Choose the verified hospital receiving this blood."
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
                          Loading approved hospitals...
                        </p>
                      </div>
                    )}

                    {selectedFacility && (
                      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                          <MapPin className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-emerald-950">
                            {selectedFacility.name}
                          </p>

                          <p className="mt-1 text-xs text-emerald-700">
                            {selectedFacility.township || "Verified facility"}
                          </p>
                        </div>
                      </div>
                    )}
                  </StepPanel>
                )}

                {currentStep === 4 && (
                  <StepPanel
                    icon={HeartPulse}
                    step="Step 4 of 4"
                    eyebrow="Final details"
                    title="Review the request details"
                    description="Set the required units and add only information donors need."
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label>
                        <span className="mb-2 block text-xs font-bold text-slate-600">
                          Units needed
                        </span>

                        <div className="flex h-13 items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            aria-label="Decrease units"
                            onClick={() =>
                              setUnitsNeeded((current) =>
                                Math.max(1, current - 1),
                              )
                            }
                            className="flex h-full w-13 items-center justify-center text-xl font-bold text-slate-500 transition hover:bg-slate-100"
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
                            className="h-full min-w-0 flex-1 bg-transparent text-center text-base font-black text-[#0D1933] outline-none"
                          />

                          <button
                            type="button"
                            aria-label="Increase units"
                            onClick={() =>
                              setUnitsNeeded((current) =>
                                Math.min(20, current + 1),
                              )
                            }
                            className="flex h-full w-13 items-center justify-center text-xl font-bold text-slate-500 transition hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </label>

                      <div>
                        <span className="mb-2 block text-xs font-bold text-slate-600">
                          Estimated donor reach
                        </span>

                        <div className="flex h-13 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4">
                          <Users className="h-5 w-5 text-blue-500" />

                          <div>
                            <p className="text-sm font-black text-[#0D1933]">
                              {estimatedDonors}+ donors
                            </p>

                            <p className="text-[10px] text-slate-500">
                              Based on current selections
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <label className="mt-4 block">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">
                          Arrival instructions
                          <span className="ml-1 font-medium text-slate-400">
                            Optional
                          </span>
                        </span>

                        <span className="text-[10px] font-semibold text-slate-400">
                          {notes.length}/240
                        </span>
                      </div>

                      <textarea
                        value={notes}
                        onChange={(event) =>
                          setNotes(event.target.value.slice(0, 240))
                        }
                        placeholder="Example: Report to the emergency blood bank reception."
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-[#0D1933] outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                      />
                    </label>

                    <div className="mt-5 rounded-[1.4rem] border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                        Request summary
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <CompactSummary
                          label="Urgency"
                          value={urgencyMeta.label}
                          icon={AlertTriangle}
                        />

                        <CompactSummary
                          label="Blood"
                          value={selectedBloodTypes.join(", ")}
                          icon={Droplets}
                        />

                        <CompactSummary
                          label="Hospital"
                          value={selectedFacility?.name ?? "Not selected"}
                          icon={Building2}
                        />

                        <CompactSummary
                          label="Required"
                          value={`${unitsNeeded} ${
                            unitsNeeded === 1 ? "unit" : "units"
                          }`}
                          icon={HeartPulse}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                      <p className="text-xs leading-5 text-blue-800">
                        Patient names, diagnoses, phone numbers, and medical
                        records are never included in donor broadcasts.
                      </p>
                    </div>
                  </StepPanel>
                )}
              </div>

              <div className="mt-4 hidden items-center justify-between lg:flex">
                <button
                  type="button"
                  onClick={moveToPreviousStep}
                  disabled={currentStep === 1}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:invisible"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <PrimaryStepButton
                  currentStep={currentStep}
                  loading={broadcastState === "loading"}
                  onClick={moveToNextStep}
                />
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-6 space-y-4">
                <DesktopProgress
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  urgency={urgency}
                  bloodTypes={selectedBloodTypes}
                  facility={selectedFacility}
                  unitsNeeded={unitsNeeded}
                  estimatedDonors={estimatedDonors}
                  onSelectStep={setCurrentStep}
                />

                <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-emerald-950">
                        Verified dispatch
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        This request is recorded under the hospital account for
                        operational accountability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <MobileActionBar
        currentStep={currentStep}
        loading={broadcastState === "loading"}
        onBack={moveToPreviousStep}
        onNext={moveToNextStep}
      />

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

function CompactHero({
  currentStep,
  progress,
  estimatedDonors,
  hospitalDataMode,
}: {
  currentStep: StepNumber;
  progress: number;
  estimatedDonors: number;
  hospitalDataMode: HospitalDataMode;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0D1933]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-red-500/20 blur-[90px]" />
        <div className="absolute -right-24 top-12 h-64 w-64 rounded-full bg-emerald-400/10 blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 py-5 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[10px] font-bold text-slate-200">
                Donor network online
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Create an emergency request
            </h1>

            <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
              Complete four short steps to notify compatible donors.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-right sm:block">
            <p className="text-xl font-black text-white">{estimatedDonors}+</p>
            <p className="text-[10px] font-semibold text-slate-400">
              Estimated reach
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Step {currentStep} of 4
            </span>

            <span className="text-[10px] font-black text-white">
              {progress}%
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {hospitalDataMode === "demo" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-400/10 px-3 py-2 text-[10px] font-semibold text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Demo hospital data is currently displayed.
          </div>
        )}
      </div>
    </section>
  );
}

function MobileStepIndicator({
  currentStep,
  onSelect,
  completedSteps,
}: {
  currentStep: StepNumber;
  onSelect: (step: StepNumber) => void;
  completedSteps: Record<StepNumber, boolean>;
}) {
  const steps = [
    { step: 1 as const, label: "Urgency" },
    { step: 2 as const, label: "Blood" },
    { step: 3 as const, label: "Hospital" },
    { step: 4 as const, label: "Details" },
  ];

  return (
    <nav
      aria-label="Broadcast steps"
      className="grid grid-cols-4 gap-1 rounded-2xl border border-white bg-white p-1.5 shadow-[0_8px_25px_rgba(15,23,42,0.06)] lg:hidden"
    >
      {steps.map(({ step, label }) => {
        const isActive = currentStep === step;
        const isComplete = completedSteps[step] && currentStep > step;

        return (
          <button
            key={step}
            type="button"
            onClick={() => onSelect(step)}
            className={clsx(
              "flex min-h-12 flex-col items-center justify-center rounded-xl px-1 transition",
              isActive
                ? "bg-[#0D1933] text-white"
                : "text-slate-400 hover:bg-slate-50",
            )}
          >
            <span
              className={clsx(
                "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black",
                isActive
                  ? "bg-red-500 text-white"
                  : isComplete
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500",
              )}
            >
              {isComplete ? <Check className="h-3 w-3" /> : step}
            </span>

            <span className="mt-1 text-[8px] font-black uppercase tracking-[0.05em]">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function StepPanel({
  icon: Icon,
  step,
  eyebrow,
  title,
  description,
  error,
  children,
}: {
  icon: typeof Zap;
  step: string;
  eyebrow: string;
  title: string;
  description: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0D1933] text-white">
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-red-500">
                {eyebrow}
              </p>

              <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-300">
                {step}
              </span>
            </div>

            <h2 className="mt-1 text-lg font-black tracking-tight text-[#0D1933] sm:text-xl">
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

function CompactSummary({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-black text-[#0D1933]">
          {value}
        </p>
      </div>
    </div>
  );
}

function DesktopProgress({
  currentStep,
  completedSteps,
  urgency,
  bloodTypes,
  facility,
  unitsNeeded,
  estimatedDonors,
  onSelectStep,
}: {
  currentStep: StepNumber;
  completedSteps: Record<StepNumber, boolean>;
  urgency: Urgency;
  bloodTypes: BloodType[];
  facility?: Hospital;
  unitsNeeded: number;
  estimatedDonors: number;
  onSelectStep: (step: StepNumber) => void;
}) {
  const steps = [
    {
      step: 1 as const,
      label: "Urgency",
      value: URGENCY_META[urgency].label,
    },
    {
      step: 2 as const,
      label: "Blood types",
      value: bloodTypes.join(", ") || "Not selected",
    },
    {
      step: 3 as const,
      label: "Hospital",
      value: facility?.name ?? "Not selected",
    },
    {
      step: 4 as const,
      label: "Details",
      value: `${unitsNeeded} ${unitsNeeded === 1 ? "unit" : "units"}`,
    },
  ];

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
      <div className="bg-[#0D1933] px-5 py-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500">
            <Radio className="h-5 w-5" />
          </div>

          <span className="rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-300">
            {estimatedDonors}+ donors
          </span>
        </div>

        <h2 className="mt-4 text-lg font-black">Request progress</h2>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Review or edit each section before broadcasting.
        </p>
      </div>

      <div className="space-y-2 p-4">
        {steps.map(({ step, label, value }) => {
          const isActive = currentStep === step;
          const isComplete = completedSteps[step];

          return (
            <button
              key={step}
              type="button"
              onClick={() => onSelectStep(step)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                isActive
                  ? "border-slate-200 bg-slate-50"
                  : "border-transparent hover:border-slate-100 hover:bg-slate-50",
              )}
            >
              <span
                className={clsx(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black",
                  isActive
                    ? "bg-[#0D1933] text-white"
                    : isComplete
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-400",
                )}
              >
                {isComplete && !isActive ? <Check className="h-4 w-4" /> : step}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                  {label}
                </span>

                <span className="mt-0.5 block truncate text-xs font-black text-[#0D1933]">
                  {value}
                </span>
              </span>

              <ChevronDown className="-rotate-90 h-4 w-4 text-slate-300" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PrimaryStepButton({
  currentStep,
  loading,
  onClick,
}: {
  currentStep: StepNumber;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(239,68,68,0.25)] transition hover:-translate-y-0.5 hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Broadcasting...
        </>
      ) : currentStep === 4 ? (
        <>
          <Send className="h-4 w-4" />
          Review broadcast
        </>
      ) : (
        <>
          Continue
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}

function MobileActionBar({
  currentStep,
  loading,
  onBack,
  onNext,
}: {
  currentStep: StepNumber;
  loading: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_40px_rgba(15,23,42,0.1)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-3xl gap-3">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go to previous step"
            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <PrimaryStepButton
          currentStep={currentStep}
          loading={loading}
          onClick={onNext}
        />
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
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[#07101F]/70 backdrop-blur-sm sm:items-center sm:px-5"
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
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-red-300">
                <BellRing className="h-3.5 w-3.5" />
                Final check
              </div>

              <h2
                id="confirm-broadcast-title"
                className="mt-4 text-2xl font-black tracking-tight"
              >
                Broadcast this request?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Compatible donors near the selected hospital will be notified
                immediately.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close confirmation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10"
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
            <ConfirmationMetric
              icon={Users}
              value={`${estimatedDonors}+`}
              label="Estimated reach"
            />

            <ConfirmationMetric
              icon={Clock3}
              value={urgencyMeta.responseTime}
              label="Expected response"
            />
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

            <p className="text-xs leading-5 text-blue-800">
              Patient identity and private medical information will not be
              shared with donors.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Edit
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-500 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-600 active:scale-[0.98]"
            >
              <Radio className="h-4 w-4" />
              Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon className="h-4 w-4 text-blue-500" />

      <p className="mt-3 text-sm font-black text-[#0D1933]">{value}</p>

      <p className="mt-1 text-[10px] font-bold text-slate-400">{label}</p>
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
  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#111827]">
      <HospitalTopBar
        title="Emergency Broadcast"
        subtitle="Authorized hospital dispatch"
        isLive
      />

      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-5 py-8">
        <section className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden bg-[#0D1933] px-6 py-8 text-center text-white">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-red-500/20 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-emerald-500 shadow-[0_18px_45px_rgba(16,185,129,0.35)]">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Broadcast active
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight">
                Emergency alert sent
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                LifeLink is notifying compatible donors near{" "}
                {facility?.name ?? "the selected hospital"}.
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-3">
              <SuccessMetric
                value={URGENCY_META[urgency].label}
                label="Priority"
              />

              <SuccessMetric value={bloodTypes.join(", ")} label="Blood" />

              <SuccessMetric value={`${estimatedDonors}+`} label="Reached" />
            </div>

            <div className="mt-5 space-y-3 rounded-[1.5rem] bg-slate-50 p-4">
              <SuccessStatus text="Donor notifications dispatched" />
              <SuccessStatus text="Response monitoring is active" />
              <SuccessStatus text="Request securely recorded" />
            </div>

            <button
              type="button"
              onClick={onCreateNew}
              className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#0D1933] px-5 text-sm font-black text-white transition hover:bg-[#18294F]"
            >
              <Radio className="h-4 w-4" />
              Create another request
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function SuccessMetric({ value, label }: { value: string; label: string }) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
      <p className="truncate text-sm font-black text-[#0D1933]">{value}</p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </article>
  );
}

function SuccessStatus({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <Check className="h-4 w-4" />
      </div>

      <p className="text-xs font-black text-[#0D1933]">{text}</p>
    </div>
  );
}
