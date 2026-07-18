"use client";
// Blood Inventory page — per-hospital blood stock view
// Thinzar Kyaw — Frontend Domain
// Navbar (floating pill) is rendered site-wide via root layout

import { useState } from "react";
import { Building2, Plus, AlertTriangle, Clock } from "lucide-react";
import { HospitalTopBar } from "@/components/layout/HospitalTopBar";
import { BloodStockRow } from "@/components/inventory/BloodStockRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  MOCK_BLOOD_INVENTORY,
  MOCK_RECENT_INTAKE,
  type StockLevel,
} from "@/components/data/mockData";
import { clsx } from "clsx";

type StockFilter = "All" | StockLevel;

const FILTERS: StockFilter[] = ["All", "CRITICAL", "LOW", "ADEQUATE"];

const FILTER_LABELS: Record<StockFilter, string> = {
  All: "All",
  CRITICAL: "Critical",
  LOW: "Low",
  ADEQUATE: "Adequate",
};

// Selected hospital for this prototype
const HOSPITAL_NAME = "Yangon General Hospital (YGH)";

export default function InventoryPage() {
  const [filter, setFilter] = useState<StockFilter>("All");
  const [showLogModal, setShowLogModal] = useState(false);

  const criticalCount = MOCK_BLOOD_INVENTORY.filter((s) => s.level === "CRITICAL").length;
  const lowCount = MOCK_BLOOD_INVENTORY.filter((s) => s.level === "LOW").length;

  const filtered =
    filter === "All"
      ? MOCK_BLOOD_INVENTORY
      : MOCK_BLOOD_INVENTORY.filter((s) => s.level === filter);

  return (
    <div className="flex min-h-screen flex-col bg-water-subtle water-ripple">
      <HospitalTopBar
        title="Blood Inventory"
        subtitle={HOSPITAL_NAME.toUpperCase()}
        isLive={false}
      />

      <div className="flex-1 space-y-4 py-4">
        {/* Summary cards */}
        <div className="mx-4 grid grid-cols-2 gap-3">
          <div className="glass-surface rounded-2xl p-4">
            <p className="text-3xl font-black text-red-600">{criticalCount}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" strokeWidth={2.5} />
              <p className="text-xs font-bold text-red-500 tracking-wide uppercase">
                Critical Types
              </p>
            </div>
          </div>
          <div className="glass-surface rounded-2xl p-4">
            <p className="text-3xl font-black text-amber-600">{lowCount}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.5} />
              <p className="text-xs font-bold text-amber-500 tracking-wide uppercase">
                Low Types
              </p>
            </div>
          </div>
        </div>

        {/* Log donation CTA */}
        <div className="mx-4">
          <button
            id="log-donation-btn"
            onClick={() => setShowLogModal(true)}
            className="animate-float-cta flex w-full items-center justify-center gap-2 rounded-2xl bg-vr-teal py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-vr-teal-dark active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5" />
            Log Received Donation
          </button>
        </div>

        {/* Filter tabs + stock list */}
        <div className="mx-4 rounded-2xl shadow-sm overflow-hidden glass-elevated">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/20">
            <SectionHeader>Stock by Type</SectionHeader>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 px-4 py-3 border-b border-white/15">
            {FILTERS.map((f) => (
              <button
                key={f}
                id={`filter-${f.toLowerCase()}`}
                onClick={() => setFilter(f)}
                className={clsx(
                  "rounded-xl px-3 py-1 text-xs font-semibold transition-all",
                  filter === f
                    ? "bg-red-600 text-white shadow-sm"
                    : "glass-pill text-slate-600 hover:bg-white/60"
                )}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Stock rows */}
          <div className="divide-y divide-white/10">
            {filtered.map((stock) => (
              <BloodStockRow key={stock.bloodType} stock={stock} maxUnits={40} />
            ))}
          </div>
        </div>

        {/* Recent intake */}
        <div className="mx-4 rounded-2xl shadow-sm overflow-hidden glass-elevated p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-vr-teal" />
            <SectionHeader>Recent Intake</SectionHeader>
          </div>
          <div className="divide-y divide-white/10">
            {MOCK_RECENT_INTAKE.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100/80">
                  <span className="text-vr-teal text-sm">🩸</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.donor} donated 1 unit · {item.bloodType}
                  </p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log donation modal */}
      {showLogModal && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm"
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="glass-overlay w-full rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-1">Log Received Donation</h3>
            <p className="text-sm text-slate-600 mb-4">
              Record a new unit received at {HOSPITAL_NAME}.
            </p>
            <p className="rounded-2xl glass-surface p-4 text-sm text-slate-600 text-center">
              Full form coming soon — connect to blood bank integration.
            </p>
            <button
              onClick={() => setShowLogModal(false)}
              className="mt-4 w-full rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-md shadow-red-500/25 transition hover:bg-red-700 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
