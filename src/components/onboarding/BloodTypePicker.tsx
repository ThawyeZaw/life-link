"use client";

// BloodTypePicker — 8-type blood group selector grid for donor onboarding
// Thinzar Kyaw — Frontend Domain

import { clsx } from "clsx";

const BLOOD_TYPES = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

interface BloodTypePickerProps {
  value: string;
  onChange: (bloodType: string) => void;
}

export const BloodTypePicker = ({ value, onChange }: BloodTypePickerProps) => (
  <div className="grid grid-cols-4 gap-2">
    {BLOOD_TYPES.map((type) => (
      <button
        key={type}
        type="button"
        aria-pressed={value === type}
        onClick={() => onChange(type)}
        className={clsx(
          "min-h-[44px] rounded-xl border text-base font-bold transition focus:outline-none focus:ring-2 focus:ring-red-500",
          value === type
            ? "border-red-600 bg-red-600 text-white shadow-sm"
            : "border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50"
        )}
      >
        {type}
      </button>
    ))}
  </div>
);
