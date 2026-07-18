"use client";

// OnboardingForm — collects blood type, address and essential personal info
// from first-time donors. Saves data to localStorage (demo) then navigates to
// the dashboard or a ?next= return path.
// Thinzar Kyaw — Frontend Domain
// ⚠️ CROSS-BOUNDARY: Reads ONBOARDING_COMPLETE_KEY / ONBOARDING_DATA_KEY
// from @/utils/session (backend domain, Thaw Ye Zaw).

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Phone, MapPin, Calendar, Droplets } from "lucide-react";
import {
  ONBOARDING_COMPLETE_KEY,
  ONBOARDING_DATA_KEY,
} from "@/utils/session";
import { BloodTypePicker } from "@/components/onboarding/BloodTypePicker";
import { HealthDeclaration } from "@/components/onboarding/HealthDeclaration";

const YANGON_TOWNSHIPS = [
  "Sanchaung",
  "Bahan",
  "Tamwe",
  "Hlaing",
  "Kamayut",
  "Insein",
  "Mayangone",
  "Mingalar Taung Nyunt",
  "Hlaing Tharyar",
  "North Okkalapa",
  "Dagon",
  "Kyauktada",
];

const inputClasses =
  "w-full min-h-[44px] rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500";

const Field = ({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: typeof User }) => (
  <div className="relative">
    <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
    <input className={inputClasses} {...props} />
  </div>
);

export const OnboardingForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const dest = next && next.startsWith("/") ? next : "/dashboard";

  const [bloodType, setBloodType] = useState("");
  const [healthOk, setHealthOk] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bloodType) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      fullName: (formData.get("fullName") as string) || "",
      phone: (formData.get("phone") as string) || "",
      dob: (formData.get("dob") as string) || "",
      gender: (formData.get("gender") as string) || "",
      bloodType,
      weight: (formData.get("weight") as string) || "",
      township: (formData.get("township") as string) || "",
      address: (formData.get("address") as string) || "",
      lastDonation: (formData.get("lastDonation") as string) || "",
      healthOk,
    };

    window.localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
    window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "1");
    router.push(dest);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-vr-navy">Personal Details</h2>

        <Field
          icon={User}
          name="fullName"
          type="text"
          placeholder="Full name (e.g., Ko Aung)"
          required
        />
        <Field
          icon={Phone}
          name="phone"
          type="tel"
          placeholder="Phone (e.g., 09 7XX XXX XXX)"
          required
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field icon={Calendar} name="dob" type="date" placeholder="Date of birth" required />
          <select
            name="gender"
            required
            className="min-h-[44px] rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-vr-navy">Medical Information</h2>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Droplets className="h-4 w-4 text-red-600" />
            Blood Type <span className="text-red-500">*</span>
          </p>
          <BloodTypePicker value={bloodType} onChange={setBloodType} />
          {!bloodType && (
            <p className="mt-1 text-xs text-red-500">Required — select your blood type</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            icon={Droplets}
            name="weight"
            type="number"
            min={45}
            step={0.1}
            placeholder="Weight (kg, min 45)"
            required
          />
          <select
            name="township"
            required
            className="min-h-[44px] rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500"
          >
            <option value="">Township (Yangon)</option>
            {YANGON_TOWNSHIPS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <Field
          icon={MapPin}
          name="address"
          type="text"
          placeholder="Street / ward address"
        />
        <Field
          icon={Calendar}
          name="lastDonation"
          type="date"
          placeholder="Last donation date (optional)"
        />
      </div>

      <HealthDeclaration onChange={setHealthOk} />

      <button
        type="submit"
        disabled={!bloodType || !healthOk}
        className="w-full min-h-[52px] rounded-2xl bg-red-600 text-lg font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
      >
        Save & Continue to Dashboard
      </button>
    </form>
  );
};
