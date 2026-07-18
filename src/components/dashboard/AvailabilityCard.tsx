"use client";

import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export const AvailabilityCard = ({ profile }: { profile: Profile }) => {
  const [available, setAvailable] = useState(profile.is_available);

  const toggle = async () => {
    const next = !available;
    setAvailable(next);
    await createClient().from("profiles").update({ is_available: next }).eq("id", profile.id);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
          {profile.blood_type ?? "?"}
        </span>
        <div>
          <p className="flex items-center gap-1.5 text-base font-semibold text-slate-900">
            <HeartPulse className="h-4 w-4 text-red-500" /> Donor mode
          </p>
          <p className="text-sm text-slate-500">
            {available ? "You appear on nearby radar scans" : "You're hidden from all searches"}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        role="switch"
        aria-checked={available}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
          available ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
            available ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
};
