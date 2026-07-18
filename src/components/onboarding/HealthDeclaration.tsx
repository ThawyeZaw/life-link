"use client";

// HealthDeclaration — donor eligibility checklist for onboarding.
// Reports whether ALL declarations are confirmed via onChange.
// Thinzar Kyaw — Frontend Domain

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

const DECLARATIONS = [
  "I am feeling healthy and well today",
  "I have no chronic conditions (heart disease, hepatitis B/C, HIV)",
  "I have not had a tattoo or piercing in the last 6 months",
  "I am not currently taking antibiotics or prescribed medication",
];

interface HealthDeclarationProps {
  onChange: (allConfirmed: boolean) => void;
}

export const HealthDeclaration = ({ onChange }: HealthDeclarationProps) => {
  const [checked, setChecked] = useState<boolean[]>(
    DECLARATIONS.map(() => false)
  );

  const toggle = (index: number) => {
    const next = checked.map((v, i) => (i === index ? !v : v));
    setChecked(next);
    onChange(next.every(Boolean));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-vr-navy">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Health Declaration
      </p>
      <div className="space-y-2">
        {DECLARATIONS.map((text, index) => (
          <label
            key={text}
            className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl p-2 transition hover:bg-white"
          >
            <input
              type="checkbox"
              checked={checked[index]}
              onChange={() => toggle(index)}
              className="mt-1 h-4 w-4 accent-red-600"
            />
            <span className="text-sm text-gray-700">{text}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
