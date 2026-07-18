"use client";

// ============================================================================
// LifeLink — Profile Settings Card
// Edit blood type, township (dropdown from townships), phone & availability.
// Township-only location: exact coordinates are never stored.
// ============================================================================

import { useEffect, useState } from "react";
import { Check, Loader2, MapPin, Settings2, ShieldCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateMyProfile } from "@/utils/supabase/queries";
import type { BloodType, Profile, Township } from "@/utils/supabase/types";

const BLOOD_TYPES: BloodType[] = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

export function ProfileSettingsCard({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: (profile: Profile) => void;
}) {
  const [townships, setTownships] = useState<Township[]>([]);
  const [bloodType, setBloodType] = useState<BloodType | "">(profile.blood_type ?? "");
  const [township, setTownship] = useState(profile.township ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [isAvailable, setIsAvailable] = useState(profile.is_available);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("townships")
      .select("id, name, region, lat, lng")
      .order("region")
      .order("name")
      .then(({ data }) => setTownships((data as Township[]) || []));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateMyProfile({
        blood_type: (bloodType || null) as BloodType | null,
        township: township || null,
        phone: phone || null,
        is_available: isAvailable,
      });
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <Settings2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-black text-[#0D1933]">Donor settings</h3>
          <p className="text-xs text-slate-500">
            Used to match you with nearby requests.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-600">Blood type</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => setBloodType(bt)}
                className={`rounded-xl border-2 py-2 text-sm font-black transition ${
                  bloodType === bt
                    ? "border-red-400 bg-red-500 text-white"
                    : "border-slate-200 text-[#0D1933] hover:border-red-200"
                }`}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="settings-township" className="text-xs font-bold text-slate-600">
              Township
            </label>
            <select
              id="settings-township"
              value={township}
              onChange={(e) => setTownship(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0D1933] outline-none transition focus:border-red-400"
            >
              <option value="">Select township</option>
              {townships.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.region})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="settings-phone" className="text-xs font-bold text-slate-600">
              Phone
            </label>
            <input
              id="settings-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-[#0D1933] outline-none transition focus:border-red-400"
              placeholder="09..."
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAvailable((v) => !v)}
          className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 transition ${
            isAvailable
              ? "border-emerald-300 bg-emerald-50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="text-left">
            <p className="text-sm font-black text-[#0D1933]">
              {isAvailable ? "Available to donate" : "Not available"}
            </p>
            <p className="text-xs text-slate-500">
              {isAvailable
                ? "You can appear in nearby matching results."
                : "You will not appear in matching results."}
            </p>
          </div>
          <div
            className={`relative h-7 w-12 rounded-full transition ${
              isAvailable ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                isAvailable ? "left-6" : "left-1"
              }`}
            />
          </div>
        </button>

        <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <p className="text-[11px] leading-4 text-slate-500">
            Only your township is shared for matching. Your phone number stays
            hidden until <strong>you</strong> accept a request.
          </p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0D1933] text-sm font-bold text-white transition hover:bg-[#18294f] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {saved ? "Saved" : "Save settings"}
        </button>
      </div>
    </article>
  );
}
