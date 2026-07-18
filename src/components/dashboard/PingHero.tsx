"use client";

// PingHero — emergency donor dispatch widget (dashboard only)
// Thinzar Kyaw — Frontend Domain
// NOTE: Dispatch is mocked — real matching goes through /api/match-donors
// (backend domain, Thaw Ye Zaw). Never call the Python engine directly.

import { useState } from "react";
import { Zap, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

const BLOOD_TYPES = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

export const PingHero = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [pinged, setPinged] = useState(false);

  const handlePing = () => {
    if (!selected) return;
    // TODO (Backend — Thaw Ye Zaw): POST to /api/match-donors
    setPinged(true);
    setTimeout(() => setPinged(false), 3000);
  };

  return (
    <section className="rounded-3xl bg-vr-navy p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-black text-white">
        <Zap className="h-5 w-5 text-amber-400" />
        Ping a Hero
      </h2>
      <p className="mt-1 text-sm text-gray-400">
        Instantly alert matching donors near your facility.
      </p>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {BLOOD_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelected(type)}
            className={clsx(
              "min-h-[44px] rounded-xl text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-red-500",
              selected === type
                ? "bg-red-600 text-white shadow-md"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handlePing}
        disabled={!selected || pinged}
        className="mt-4 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-red-600 text-base font-bold text-white shadow-lg transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
      >
        {pinged ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            3 donors near Sanchaung pinged!
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            {selected ? `Ping ${selected} Donors` : "Select a blood type"}
          </>
        )}
      </button>
    </section>
  );
};
