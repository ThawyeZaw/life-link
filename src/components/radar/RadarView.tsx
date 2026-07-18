"use client";

import type { DonorCandidate } from "@/lib/types";

const angleFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
};

export const RadarView = ({
  donors,
  radiusKm,
  scanning,
  selected,
  onToggle,
}: {
  donors: DonorCandidate[];
  radiusKm: number;
  scanning: boolean;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) => (
  <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-full border border-red-200 bg-gradient-to-b from-red-50 to-white">
    {/* rings */}
    {[0.33, 0.66, 1].map((r) => (
      <div
        key={r}
        className="absolute rounded-full border border-red-200/80"
        style={{
          inset: `${(1 - r) * 50}%`,
        }}
      />
    ))}

    {/* sweep */}
    {scanning && (
      <>
        <div
          className="animate-radar-sweep absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(220,38,38,0.35) 0deg, rgba(220,38,38,0.08) 55deg, transparent 90deg)",
          }}
        />
        <div className="animate-radar-ring absolute inset-0 rounded-full border-2 border-red-400" />
      </>
    )}

    {/* hospital at center */}
    <div className="absolute left-1/2 top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-lg text-white shadow-lg">
      +
    </div>

    {/* donor blips */}
    {donors.map((d, i) => {
      const angle = (angleFor(d.donor_id) * Math.PI) / 180;
      const rr = Math.min(d.distance_km / radiusKm, 1) * 42 + 6; // % from center
      const x = 50 + rr * Math.cos(angle);
      const y = 50 + rr * Math.sin(angle);
      const isSelected = selected.has(d.donor_id);
      return (
        <button
          key={d.donor_id}
          onClick={() => !d.already_invited && onToggle(d.donor_id)}
          className={`animate-blip-in absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-bold shadow-md transition-colors ${
            d.already_invited
              ? "bg-slate-300 text-slate-600"
              : isSelected
                ? "bg-red-600 text-white ring-2 ring-red-300"
                : "bg-white text-red-600 ring-1 ring-red-200"
          }`}
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 90}ms` }}
          aria-label={`${d.display_name} ${d.blood_type}`}
        >
          {d.blood_type}
        </button>
      );
    })}

    {/* radius label */}
    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
      {radiusKm} km radius
    </span>
  </div>
);
