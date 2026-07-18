"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BloodTypePicker } from "@/components/auth/BloodTypePicker";
import { HospitalPicker } from "./HospitalPicker";
import { UrgencyPicker } from "./UrgencyPicker";
import type { Hospital, Urgency } from "@/lib/types";

const input =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base placeholder:text-slate-400 focus:border-red-500 focus:outline-none";

export const NewRequestForm = () => {
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
    // If this account belongs to / owns an organization, attach the request to it
    createClient()
      .from("organizations")
      .select("id")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setOrgId(data?.id ?? null));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodType) return setError("Please select the blood type needed.");
    if (!hospital) return setError("Please select the hospital where donation happens.");
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data, error: err } = await supabase
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

    if (err || !data) {
      setError(err?.message ?? "Could not create request");
      setLoading(false);
      return;
    }
    router.push(`/requests/${data.id}`);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700">Blood type needed</span>
        <BloodTypePicker value={bloodType} onChange={setBloodType} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700">Units needed</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setUnits((u) => Math.max(1, u - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-xl font-bold text-slate-900">{units}</span>
          <button type="button" onClick={() => setUnits((u) => Math.min(10, u + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700">Urgency</span>
        <UrgencyPicker value={urgency} onChange={setUrgency} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700">Donation hospital</span>
        <HospitalPicker selected={hospital} onSelect={setHospital} />
        <p className="text-xs text-slate-500">
          Donors see the hospital location — the patient&apos;s address is never shared.
        </p>
      </div>

      <input className={input} placeholder="Patient name (optional)"
        value={patientName} onChange={(e) => setPatientName(e.target.value)} />
      <textarea className={`${input} min-h-24 py-2.5`} placeholder="Notes for donors (optional)"
        value={notes} onChange={(e) => setNotes(e.target.value)} />

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading}
        className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 text-base font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Create request & find donors
      </button>
    </form>
  );
};
