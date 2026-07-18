"use client";

// PasswordPolicy — password strength checklist for the Sign Up form
// Thinzar Kyaw — Frontend Domain
// NOTE: This is UI-only validation. Backend MUST enforce these policies
// server-side in the Supabase Auth trigger (Thaw Ye Zaw's domain).

import { Check, X } from "lucide-react";
import { clsx } from "clsx";

// Common passwords blocked client-side for immediate feedback.
// A full breach-database check requires backend integration (Supabase Auth hook).
const COMMON_PASSWORDS = new Set([
  "password123", "Password123", "password", "12345678", "qwerty123",
  "admin1234", "letmein12", "welcome123", "changeme12", "myanmar123",
]);

interface PasswordPolicyProps {
  password: string;
}

interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const RULES: Rule[] = [
  { label: "At least 12 characters", test: (pw) => pw.length >= 12 },
  { label: "One uppercase letter (A–Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter (a–z)", test: (pw) => /[a-z]/.test(pw) },
  { label: "One digit (0–9)", test: (pw) => /[0-9]/.test(pw) },
  { label: "One special character (!@#$%^&*)", test: (pw) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw) },
  { label: "Not a commonly used password", test: (pw) => !COMMON_PASSWORDS.has(pw) },
];

export const PasswordPolicy = ({ password }: PasswordPolicyProps) => {
  if (!password) return null;

  return (
    <ul className="space-y-1.5 rounded-xl bg-gray-50 p-3 text-xs">
      {RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.label}
            className={clsx(
              "flex items-center gap-2 font-medium",
              passed ? "text-emerald-600" : "text-gray-400"
            )}
          >
            {passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
};
