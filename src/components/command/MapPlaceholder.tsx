"use client";

// src/components/command/MapPlaceholder.tsx
// LifeLink — Emergency request map preview
// Team Vertex Red

import { useState } from "react";
import {
  AlertTriangle,
  Clock3,
  Crosshair,
  Droplets,
  Expand,
  Layers3,
  MapPin,
  Navigation,
  Radio,
  Users,
} from "lucide-react";
import { clsx } from "clsx";

type PinUrgency = "critical" | "urgent" | "routine";

interface MapPinData {
  id: string;
  requestCode: string;
  bloodType: string;
  hospital: string;
  township: string;
  units: number;
  responseTime: string;
  donorsNearby: number;
  urgency: PinUrgency;
  x: number;
  y: number;
}

const PINS: MapPinData[] = [
  {
    id: "p1",
    requestCode: "REQ-001",
    bloodType: "O−",
    hospital: "Yangon General Hospital",
    township: "Lanmadaw",
    units: 3,
    responseTime: "8 min ago",
    donorsNearby: 24,
    urgency: "critical",
    x: 29,
    y: 39,
  },
  {
    id: "p2",
    requestCode: "REQ-002",
    bloodType: "A+",
    hospital: "Thingangyun Sanpya Hospital",
    township: "Thingangyun",
    units: 2,
    responseTime: "14 min ago",
    donorsNearby: 17,
    urgency: "urgent",
    x: 64,
    y: 54,
  },
  {
    id: "p3",
    requestCode: "REQ-003",
    bloodType: "B+",
    hospital: "North Okkalapa General Hospital",
    township: "North Okkalapa",
    units: 1,
    responseTime: "26 min ago",
    donorsNearby: 11,
    urgency: "routine",
    x: 53,
    y: 24,
  },
];

const PIN_STYLES: Record<
  PinUrgency,
  {
    label: string;
    marker: string;
    pulse: string;
    badge: string;
    cardBorder: string;
  }
> = {
  critical: {
    label: "Critical",
    marker: "bg-red-500 text-white",
    pulse: "bg-red-500",
    badge: "bg-red-50 text-red-600",
    cardBorder: "border-red-100",
  },
  urgent: {
    label: "Urgent",
    marker: "bg-amber-500 text-white",
    pulse: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
    cardBorder: "border-amber-100",
  },
  routine: {
    label: "Routine",
    marker: "bg-blue-500 text-white",
    pulse: "bg-blue-500",
    badge: "bg-blue-50 text-blue-600",
    cardBorder: "border-blue-100",
  },
};

export function MapPlaceholder() {
  const [selectedPinId, setSelectedPinId] = useState(PINS[0]?.id ?? "");
  const [showCoverage, setShowCoverage] = useState(true);

  const selectedPin = PINS.find((pin) => pin.id === selectedPinId) ?? PINS[0];

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]">
      <header className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0D1933] text-white shadow-lg shadow-slate-200">
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-[#0D1933]">
                Live emergency map
              </h2>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Active requests and estimated compatible donor coverage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCoverage((current) => !current)}
            className={clsx(
              "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition",
              showCoverage
                ? "border-blue-100 bg-blue-50 text-blue-600"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
            )}
          >
            <Layers3 className="h-4 w-4" />
            Coverage
          </button>

          <button
            type="button"
            aria-label="Center map"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Crosshair className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Expand map"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Expand className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="relative h-[360px] overflow-hidden bg-[#EEF3F7] sm:h-[430px]">
        <MapBackground />

        <div
          aria-hidden="true"
          className="absolute left-[17%] top-[31%] h-[3px] w-[70%] rotate-[11deg] rounded-full bg-white/80 shadow-sm"
        />
        <div
          aria-hidden="true"
          className="absolute left-[22%] top-[66%] h-[3px] w-[58%] -rotate-[17deg] rounded-full bg-white/80 shadow-sm"
        />
        <div
          aria-hidden="true"
          className="absolute left-[48%] top-[7%] h-[82%] w-[3px] rotate-[8deg] rounded-full bg-white/80 shadow-sm"
        />

        <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 shadow-lg backdrop-blur-xl">
          <Navigation className="h-4 w-4 text-blue-500" />

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Coverage area
            </p>
            <p className="text-xs font-black text-[#0D1933]">
              Yangon emergency network
            </p>
          </div>
        </div>

        <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
          <MapControl label="+" />
          <MapControl label="−" />
        </div>

        {showCoverage &&
          PINS.map((pin) => {
            const styles = PIN_STYLES[pin.urgency];

            return (
              <div
                key={`coverage-${pin.id}`}
                aria-hidden="true"
                className={clsx(
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-20",
                  pin.urgency === "critical" &&
                    "h-40 w-40 border-red-400 bg-red-300",
                  pin.urgency === "urgent" &&
                    "h-32 w-32 border-amber-400 bg-amber-300",
                  pin.urgency === "routine" &&
                    "h-24 w-24 border-blue-400 bg-blue-300",
                )}
                style={{
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                }}
              >
                <span className={clsx("sr-only", styles.pulse)} />
              </div>
            );
          })}

        {PINS.map((pin) => {
          const isSelected = selectedPinId === pin.id;
          const styles = PIN_STYLES[pin.urgency];

          return (
            <button
              key={pin.id}
              type="button"
              aria-label={`${pin.requestCode}, ${pin.bloodType}, ${styles.label}`}
              onClick={() => setSelectedPinId(pin.id)}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2 outline-none"
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
              }}
            >
              <span
                className={clsx(
                  "absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25",
                  styles.pulse,
                  pin.urgency === "critical" && "animate-ping",
                )}
              />

              <span
                className={clsx(
                  "relative flex h-11 w-11 items-center justify-center rounded-2xl border-[3px] border-white shadow-[0_10px_25px_rgba(15,23,42,0.25)] transition-all duration-300",
                  styles.marker,
                  isSelected
                    ? "-translate-y-1 scale-110"
                    : "hover:-translate-y-1 hover:scale-105",
                )}
              >
                {pin.urgency === "critical" ? (
                  <AlertTriangle className="h-5 w-5" strokeWidth={2.7} />
                ) : (
                  <Droplets className="h-5 w-5" strokeWidth={2.7} />
                )}
              </span>

              <span
                className={clsx(
                  "absolute left-1/2 top-[calc(100%+7px)] -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/60 bg-[#0D1933]/95 px-2.5 py-1.5 text-[10px] font-black text-white shadow-lg backdrop-blur transition",
                  isSelected
                    ? "translate-y-0 opacity-100"
                    : "translate-y-1 opacity-0 group-hover:opacity-100",
                )}
              >
                {pin.requestCode} · {pin.bloodType}
              </span>
            </button>
          );
        })}

        {selectedPin && (
          <article
            className={clsx(
              "absolute bottom-4 left-4 right-4 z-40 rounded-[1.4rem] border bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:left-auto sm:w-[340px]",
              PIN_STYLES[selectedPin.urgency].cardBorder,
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  PIN_STYLES[selectedPin.urgency].marker,
                )}
              >
                <Droplets className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-[#0D1933]">
                        {selectedPin.requestCode}
                      </p>

                      <span
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em]",
                          PIN_STYLES[selectedPin.urgency].badge,
                        )}
                      >
                        {PIN_STYLES[selectedPin.urgency].label}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs font-bold text-slate-600">
                      {selectedPin.hospital}
                    </p>
                  </div>

                  <span className="rounded-xl bg-red-50 px-2.5 py-1 text-sm font-black text-red-600">
                    {selectedPin.bloodType}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <MapStat
                    icon={MapPin}
                    value={selectedPin.township}
                    label="Township"
                  />

                  <MapStat
                    icon={Droplets}
                    value={`${selectedPin.units}`}
                    label="Units"
                  />

                  <MapStat
                    icon={Users}
                    value={`${selectedPin.donorsNearby}`}
                    label="Nearby"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    Updated {selectedPin.responseTime}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600">
                    <Radio className="h-3.5 w-3.5" />
                    Tracking live
                  </span>
                </div>
              </div>
            </div>
          </article>
        )}

        <div className="absolute bottom-4 right-4 hidden rounded-full border border-white/70 bg-white/85 px-3 py-2 text-[10px] font-bold text-slate-500 shadow-md backdrop-blur sm:block">
          Mapbox integration ready
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <LegendDot color="bg-red-500" label="Critical" />
          <LegendDot color="bg-amber-500" label="Urgent" />
          <LegendDot color="bg-blue-500" label="Routine" />
        </div>

        <p className="text-[10px] font-semibold text-slate-400">
          Prototype visualization · No patient location displayed
        </p>
      </footer>
    </section>
  );
}

function MapBackground() {
  return (
    <>
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="lifelink-map-grid"
            width="34"
            height="34"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 34 0 L 0 0 0 34"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="0.8"
              opacity="0.55"
            />
          </pattern>

          <radialGradient id="lifelink-map-glow">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#E8EEF3" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#lifelink-map-grid)" />
        <circle cx="50%" cy="45%" r="42%" fill="url(#lifelink-map-glow)" />
      </svg>

      <div
        aria-hidden="true"
        className="absolute left-[7%] top-[13%] h-28 w-40 rotate-12 rounded-[42%] border border-slate-300/60 bg-white/30"
      />
      <div
        aria-hidden="true"
        className="absolute right-[8%] top-[16%] h-32 w-44 -rotate-6 rounded-[45%] border border-slate-300/60 bg-white/30"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[8%] left-[31%] h-28 w-52 rotate-3 rounded-[48%] border border-slate-300/60 bg-white/30"
      />
    </>
  );
}

function MapControl({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/90 text-lg font-bold text-slate-600 shadow-lg backdrop-blur transition hover:bg-white"
    >
      {label}
    </button>
  );
}

function MapStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof MapPin;
  value: string;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-2.5 py-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <p className="truncate text-[10px] font-black text-[#0D1933]">
          {value}
        </p>
      </div>

      <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={clsx("h-2.5 w-2.5 rounded-full", color)} />
      <span className="text-[10px] font-bold text-slate-500">{label}</span>
    </div>
  );
}
