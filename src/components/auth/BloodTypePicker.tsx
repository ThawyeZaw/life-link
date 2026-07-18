"use client";

import { BLOOD_TYPES } from "@/lib/blood";

export const BloodTypePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="grid grid-cols-4 gap-2">
    {BLOOD_TYPES.map((bt) => (
      <button
        key={bt}
        type="button"
        onClick={() => onChange(bt)}
        className={`min-h-11 rounded-xl border text-base font-bold transition-colors ${
          value === bt
            ? "border-red-600 bg-red-600 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50"
        }`}
      >
        {bt}
      </button>
    ))}
  </div>
);
