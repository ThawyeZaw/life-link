"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Droplets,
  FileText,
  Loader2,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useT } from "@/i18n";
import { createClient } from "@/lib/supabase/client";
import { BloodTypePicker } from "@/components/auth/BloodTypePicker";
import { HospitalPicker } from "./HospitalPicker";
import { UrgencyPicker } from "./UrgencyPicker";
import type { Hospital, Urgency } from "@/lib/types";

const fieldClassName =
  "min-h-12 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export const NewRequestForm = () => {
  const { t } = useT();
  const router = useRouter();

  const [bloodType, setBloodType] = useState("");
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState<Urgency>("URGENT");
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [patientName, setPatientName] = useState("");
  const [notes, setNotes] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createClient()
      .from("organizations")
      .select("id")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setOrgId(data?.id ?? null));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!bloodType) {
      setError(t("request.form.errorBloodType"));
      return;
    }

    if (!hospital) {
      setError(t("request.form.errorHospital"));
      return;
    }

    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    const { data, error: requestError } = await supabase
      .from("requests")
      .insert({
        requester_id: userData.user!.id,
        organization_id: orgId,
        hospital_id: hospital.id,
        blood_type: bloodType,
        units_needed: units,
        urgency,
        patient_name: patientName || null,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (requestError || !data) {
      setError(requestError?.message ?? t("request.form.errorCreate"));
      setLoading(false);
      return;
    }

    router.push(`/requests/${data.id}`);
  };

  const completedSteps = [
    Boolean(bloodType),
    Boolean(hospital),
    Boolean(urgency),
  ].filter(Boolean).length;

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-red-100/80 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-red-600 text-white shadow-[0_12px_28px_rgba(220,38,38,0.24)]">
              <Droplets className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-red-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
                {t("request.form.emergencyRequest")}
              </span>

              <h1 className="mt-2 text-xl font-black tracking-[-0.035em] text-slate-950 sm:text-2xl">
                {t("request.form.createBloodRequest")}
              </h1>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {t("request.form.formDesc")}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-3.5 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-black leading-none text-slate-900">
                {completedSteps}/3
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                {t("request.form.requiredSteps")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <FormSection
        step="01"
        icon={<Droplets className="h-5 w-5" />}
        title={t("request.form.step1Title")}
        description={t("request.form.step1Desc")}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <FieldLabel
              label={t("request.form.bloodTypeNeeded")}
              required
              complete={Boolean(bloodType)}
            />

            <BloodTypePicker
              value={bloodType}
              onChange={(value) => {
                setBloodType(value);
                setError("");
              }}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel label={t("request.form.unitsNeeded")} required complete={units > 0} />

            <div className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-3">
              <button
                type="button"
                onClick={() => setUnits((current) => Math.max(1, current - 1))}
                disabled={units <= 1}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease units"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="min-w-0 flex-1 text-center">
                <p className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                  {units}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  {units === 1 ? t("request.form.bloodUnit") : t("request.form.bloodUnits")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setUnits((current) => Math.min(10, current + 1))}
                disabled={units >= 10}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase units"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <p className="px-1 text-xs leading-5 text-slate-400">
              {t("request.form.unitsRange")}
            </p>
          </div>
        </div>
      </FormSection>

      <FormSection
        step="02"
        icon={<AlertCircle className="h-5 w-5" />}
        title={t("request.form.step2Title")}
        description={t("request.form.step2Desc")}
      >
        <div className="space-y-2">
          <FieldLabel label={t("request.form.urgencyLevel")} required complete />

          <UrgencyPicker value={urgency} onChange={setUrgency} />
        </div>
      </FormSection>

      <FormSection
        step="03"
        icon={<Building2 className="h-5 w-5" />}
        title={t("request.form.step3Title")}
        description={t("request.form.step3Desc")}
      >
        <div className="space-y-3">
          <FieldLabel label={t("request.form.hospital")} required complete={Boolean(hospital)} />

          <HospitalPicker
            selected={hospital}
            onSelect={(selectedHospital) => {
              setHospital(selectedHospital);
              setError("");
            }}
          />

          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-800">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p>
              {t("request.form.hospitalPrivacy")}
            </p>
          </div>
        </div>
      </FormSection>

      <FormSection
        step="04"
        icon={<FileText className="h-5 w-5" />}
        title={t("request.form.step4Title")}
        description={t("request.form.step4Desc")}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <FieldLabel label={t("request.form.patientName")} optional />

            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                className={`${fieldClassName} pl-11`}
                placeholder={t("request.form.patientNamePlaceholder")}
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel label={t("request.form.notesForDonors")} optional />

            <div className="relative">
              <FileText className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />

              <textarea
                className={`${fieldClassName} min-h-28 resize-y py-3 pl-11 leading-6`}
                placeholder={t("request.form.notesPlaceholder")}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end px-1">
              <span className="text-[10px] font-bold text-slate-400">
                {notes.length} {t("request.form.characters")}
              </span>
            </div>
          </div>
        </div>
      </FormSection>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
            <AlertCircle className="h-4 w-4" />
          </span>

          <div>
            <p className="font-black text-red-800">
              {t("request.form.errorCheckDetails")}
            </p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="sticky bottom-3 z-30 rounded-[26px] border border-white/90 bg-white/95 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        <button
          type="submit"
          disabled={loading}
          className="group flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[20px] bg-red-600 px-5 text-base font-black text-white shadow-[0_14px_34px_rgba(220,38,38,0.28)] transition hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5 transition group-hover:translate-x-0.5" />
          )}

          {loading
            ? t("request.form.creating")
            : t("request.form.submitButton")}
        </button>

        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium leading-5 text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          {t("request.form.submitNote")}
        </p>
      </div>
    </form>
  );
};

const FormSection = ({
  step,
  icon,
  title,
  description,
  children,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="overflow-visible rounded-[30px] border border-slate-200 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.06)]">
      <header className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-5">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
          {icon}

          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[8px] font-black text-white">
            {step}
          </span>
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-black tracking-[-0.02em] text-slate-950">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </header>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
};

const FieldLabel = ({
  label,
  required = false,
  optional = false,
  complete = false,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  complete?: boolean;
}) => {
  const { t } = useT();

  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <label className="text-sm font-black text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {complete ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          {t("request.form.ready")}
        </span>
      ) : optional ? (
        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
          {t("request.form.optional")}
        </span>
      ) : null}
    </div>
  );
};
