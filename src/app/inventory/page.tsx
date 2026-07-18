"use client";

// src/app/inventory/page.tsx
// LifeLink — Hospital Blood Inventory
// Team Vertex Red

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  Gauge,
  History,
  PackagePlus,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { clsx } from "clsx";

import { HospitalTopBar } from "@/components/layout/HospitalTopBar";
import { BloodStockRow } from "@/components/inventory/BloodStockRow";
import {
  MOCK_BLOOD_INVENTORY,
  MOCK_RECENT_INTAKE,
  type StockLevel,
} from "@/components/data/mockData";

type StockFilter = "All" | StockLevel;

type DonationForm = {
  donorName: string;
  bloodType: string;
  units: number;
  collectedAt: string;
};

const FILTERS: StockFilter[] = ["All", "CRITICAL", "LOW", "ADEQUATE"];

const FILTER_LABELS: Record<StockFilter, string> = {
  All: "All stock",
  CRITICAL: "Critical",
  LOW: "Low",
  ADEQUATE: "Adequate",
};

const HOSPITAL_NAME = "Yangon General Hospital";
const HOSPITAL_SHORT_NAME = "YGH";

const BLOOD_TYPES = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];

const initialForm: DonationForm = {
  donorName: "",
  bloodType: "O+",
  units: 1,
  collectedAt: new Date().toISOString().slice(0, 10),
};

export default function InventoryPage() {
  const [filter, setFilter] = useState<StockFilter>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState<DonationForm>(initialForm);

  const inventoryStats = useMemo(() => {
    const criticalCount = MOCK_BLOOD_INVENTORY.filter(
      (stock) => stock.level === "CRITICAL",
    ).length;

    const lowCount = MOCK_BLOOD_INVENTORY.filter(
      (stock) => stock.level === "LOW",
    ).length;

    const adequateCount = MOCK_BLOOD_INVENTORY.filter(
      (stock) => stock.level === "ADEQUATE",
    ).length;

    const totalUnits = MOCK_BLOOD_INVENTORY.reduce(
      (total, stock) => total + stock.units,
      0,
    );

    return {
      criticalCount,
      lowCount,
      adequateCount,
      totalUnits,
    };
  }, []);

  const filteredInventory = useMemo(() => {
    return MOCK_BLOOD_INVENTORY.filter((stock) => {
      const matchesFilter = filter === "All" || stock.level === filter;
      const matchesSearch = stock.bloodType
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [filter, searchTerm]);

  const healthPercentage = Math.round(
    (inventoryStats.adequateCount / MOCK_BLOOD_INVENTORY.length) * 100,
  );

  const handleSubmitDonation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setShowLogModal(false);
    setShowSuccess(true);
    setForm(initialForm);

    window.setTimeout(() => {
      setShowSuccess(false);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-10 text-[#111827]">
      <HospitalTopBar
        title="Blood Inventory"
        subtitle={`${HOSPITAL_NAME.toUpperCase()} · ${HOSPITAL_SHORT_NAME}`}
        isLive
      />

      <main>
        <section className="relative overflow-hidden bg-[#0D1933] px-5 pb-8 pt-5">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-red-500/20 blur-[90px]" />
            <div className="absolute -right-24 top-12 h-72 w-72 rounded-full bg-emerald-400/15 blur-[90px]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "38px 38px",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 backdrop-blur-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>

                  <span className="text-[11px] font-bold text-slate-200">
                    Blood bank monitoring live
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                  Hospital Blood Inventory
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  Monitor blood availability, detect shortages, record incoming
                  donations, and keep emergency teams prepared.
                </p>
              </div>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-red-300 backdrop-blur sm:flex">
                <Droplets className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <HeroMetric
                label="Total units"
                value={inventoryStats.totalUnits}
                icon={Droplets}
                accent="text-blue-300"
              />

              <HeroMetric
                label="Critical"
                value={inventoryStats.criticalCount}
                icon={AlertTriangle}
                accent="text-red-300"
              />

              <HeroMetric
                label="Low stock"
                value={inventoryStats.lowCount}
                icon={Clock3}
                accent="text-amber-300"
              />

              <HeroMetric
                label="Adequate"
                value={inventoryStats.adequateCount}
                icon={CheckCircle2}
                accent="text-emerald-300"
              />
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-white">
                    Overall inventory health
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {inventoryStats.adequateCount} of{" "}
                    {MOCK_BLOOD_INVENTORY.length} blood types currently adequate
                  </p>
                </div>

                <div className="flex items-center gap-2 text-emerald-300">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-black">
                    {healthPercentage}%
                  </span>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400 transition-all duration-700"
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl space-y-6 px-5 py-6">
          {showSuccess && (
            <div className="flex items-start gap-3 rounded-[1.4rem] border border-emerald-200 bg-emerald-50 p-4 shadow-[0_12px_35px_rgba(16,185,129,0.1)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <Check className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-emerald-950">
                  Donation recorded
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  The received blood unit has been added to the prototype
                  inventory.
                </p>
              </div>
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-2">
            <button
              id="log-donation-btn"
              type="button"
              onClick={() => setShowLogModal(true)}
              className="group relative overflow-hidden rounded-[1.75rem] bg-emerald-500 p-5 text-left text-white shadow-[0_18px_45px_rgba(16,185,129,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-emerald-600"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <PackagePlus className="h-5 w-5" />
                  </div>

                  <p className="mt-5 text-lg font-black">
                    Log received donation
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-50">
                    Add a new blood donation to hospital inventory.
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 transition-transform group-hover:translate-x-1">
                  <Plus className="h-5 w-5" />
                </div>
              </div>
            </button>

            <article className="relative overflow-hidden rounded-[1.75rem] border border-red-100 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-100/70 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-red-600">
                    Action needed
                  </span>
                </div>

                <p className="mt-5 text-lg font-black text-[#0D1933]">
                  {inventoryStats.criticalCount + inventoryStats.lowCount} types
                  need attention
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Review low and critical blood groups before the next emergency
                  demand.
                </p>
              </div>
            </article>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 px-4 py-5 sm:px-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-red-500" />
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
                      Live stock levels
                    </p>
                  </div>

                  <h2 className="mt-2 text-xl font-black tracking-tight text-[#0D1933]">
                    Blood stock by type
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Review current stock levels across all blood groups.
                  </p>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search blood type"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-[#0D1933] outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border-b border-slate-100 px-4 py-3 sm:px-5">
              <div className="flex min-w-max gap-2">
                {FILTERS.map((item) => {
                  const count =
                    item === "All"
                      ? MOCK_BLOOD_INVENTORY.length
                      : MOCK_BLOOD_INVENTORY.filter(
                          (stock) => stock.level === item,
                        ).length;

                  return (
                    <button
                      key={item}
                      id={`filter-${item.toLowerCase()}`}
                      type="button"
                      onClick={() => setFilter(item)}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition",
                        filter === item
                          ? "bg-[#0D1933] text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      )}
                    >
                      {FILTER_LABELS[item]}

                      <span
                        className={clsx(
                          "rounded-full px-1.5 py-0.5 text-[9px]",
                          filter === item
                            ? "bg-white/15 text-white"
                            : "bg-white text-slate-400",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredInventory.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredInventory.map((stock) => (
                  <BloodStockRow
                    key={stock.bloodType}
                    stock={stock}
                    maxUnits={40}
                  />
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-sm font-black text-[#0D1933]">
                  No matching stock found
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Try another blood type or inventory status.
                </p>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-emerald-600" />

                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                    Recent activity
                  </p>
                </div>

                <h2 className="mt-2 text-xl font-black tracking-tight text-[#0D1933]">
                  Recent blood intake
                </h2>
              </div>

              <button
                type="button"
                className="hidden items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-[#0D1933] sm:flex"
              >
                View history
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 px-5">
              {MOCK_RECENT_INTAKE.map((item, index) => (
                <article
                  key={`${item.donor}-${item.time}-${index}`}
                  className="flex items-center gap-4 py-4"
                >
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                    <Droplets className="h-5 w-5" />

                    <span className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#0D1933] px-1 text-[8px] font-black text-white">
                      {item.bloodType}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#0D1933]">
                      {item.donor}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Donated 1 unit of {item.bloodType}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-semibold text-slate-400">
                      {item.time}
                    </p>

                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Received
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <InsightCard
              icon={TrendingDown}
              title="O− requires attention"
              text="Current stock is below the emergency safety threshold."
              tone="red"
            />

            <InsightCard
              icon={TrendingUp}
              title="A+ supply improving"
              text="Recent donor intake increased available units."
              tone="emerald"
            />

            <InsightCard
              icon={ShieldCheck}
              title="Inventory verified"
              text="Latest hospital stock review completed today."
              tone="blue"
            />
          </section>

          <section className="relative overflow-hidden rounded-[1.75rem] bg-[#0D1933] p-5 text-white shadow-[0_18px_50px_rgba(13,25,51,0.18)]">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-red-500/20 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-300">
                  LifeLink intelligence
                </p>

                <h2 className="mt-2 text-lg font-black">
                  Smarter emergency preparation
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  LifeLink can use demand patterns, active hospital requests,
                  and donation history to identify blood shortages before they
                  become critical.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {showLogModal && (
        <DonationModal
          form={form}
          setForm={setForm}
          onClose={() => setShowLogModal(false)}
          onSubmit={handleSubmitDonation}
        />
      )}
    </div>
  );
}

function HeroMetric({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Droplets;
  accent: string;
}) {
  return (
    <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-3 backdrop-blur-xl sm:p-4">
      <Icon className={clsx("h-4 w-4", accent)} />

      <p className="mt-3 text-xl font-black text-white sm:text-2xl">{value}</p>

      <p className="mt-1 text-[10px] font-semibold text-slate-400 sm:text-xs">
        {label}
      </p>
    </article>
  );
}

function InsightCard({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: typeof TrendingDown;
  title: string;
  text: string;
  tone: "red" | "emerald" | "blue";
}) {
  const styles = {
    red: {
      wrapper: "border-red-100 bg-red-50/70",
      icon: "bg-red-500 text-white shadow-red-200",
    },
    emerald: {
      wrapper: "border-emerald-100 bg-emerald-50/70",
      icon: "bg-emerald-500 text-white shadow-emerald-200",
    },
    blue: {
      wrapper: "border-blue-100 bg-blue-50/70",
      icon: "bg-blue-500 text-white shadow-blue-200",
    },
  };

  return (
    <article
      className={clsx("rounded-[1.5rem] border p-4", styles[tone].wrapper)}
    >
      <div
        className={clsx(
          "flex h-10 w-10 items-center justify-center rounded-xl shadow-lg",
          styles[tone].icon,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-black text-[#0D1933]">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </article>
  );
}

function DonationModal({
  form,
  setForm,
  onClose,
  onSubmit,
}: {
  form: DonationForm;
  setForm: React.Dispatch<React.SetStateAction<DonationForm>>;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#07101F]/65 px-0 backdrop-blur-sm sm:items-center sm:px-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-modal-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-lg sm:rounded-[2rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-[#0D1933] px-6 pb-6 pt-5 text-white">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300">
                <PackagePlus className="h-3.5 w-3.5" />
                New inventory intake
              </div>

              <h2
                id="donation-modal-title"
                className="mt-4 text-xl font-black tracking-tight"
              >
                Log received donation
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Record blood received at {HOSPITAL_NAME}.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close donation form"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <FormField label="Donor name" icon={UserRound}>
            <input
              required
              type="text"
              value={form.donorName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  donorName: event.target.value,
                }))
              }
              placeholder="Enter donor's full name"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-[#0D1933] outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Blood type" icon={Droplets}>
              <select
                value={form.bloodType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bloodType: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-[#0D1933] outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              >
                {BLOOD_TYPES.map((bloodType) => (
                  <option key={bloodType} value={bloodType}>
                    {bloodType}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Units received" icon={ArrowDownRight}>
              <input
                required
                min={1}
                max={10}
                type="number"
                value={form.units}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    units: Number(event.target.value),
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-[#0D1933] outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </FormField>
          </div>

          <FormField label="Collection date" icon={CalendarDays}>
            <input
              required
              type="date"
              value={form.collectedAt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  collectedAt: event.target.value,
                }))
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-[#0D1933] outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />
          </FormField>

          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <p className="text-xs leading-5 text-blue-800">
              Confirm that screening, labeling, and storage procedures were
              completed before adding this unit to available inventory.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-600 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add to inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600">
        <Icon className="h-3.5 w-3.5 text-emerald-600" />
        {label}
      </span>

      {children}
    </label>
  );
}
