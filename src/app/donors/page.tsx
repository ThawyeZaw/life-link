"use client";

// src/app/donors/page.tsx
// LifeLink — Hospital Donor Network
// Team Vertex Red

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpDown,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  Filter,
  HeartPulse,
  MapPin,
  Navigation,
  Phone,
  Radio,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRoundCheck,
  Users,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

import { HospitalTopBar } from "@/components/layout/HospitalTopBar";
import { BroadcastRadar } from "@/components/broadcast/BroadcastRadar";
import { createClient } from "@/utils/supabase/client";

type DonorAvailability = "AVAILABLE" | "RESPONDING" | "RESTING" | "OFFLINE";

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

type SortOption = "NEAREST" | "MOST_ACTIVE" | "RECENT";

type MobileView = "DONORS" | "COVERAGE";

interface Donor {
  id: string;
  fullName: string;
  bloodType: BloodType;
  township: string;
  distanceKm: number;
  availability: DonorAvailability;
  verified: boolean;
  donationCount: number;
  livesImpacted: number;
  lastDonation: string;
  eligibleFrom: string;
  responseRate: number;
  phone?: string;
}

interface AdvancedFilters {
  verifiedOnly: boolean;
  availableOnly: boolean;
  township: string;
}

const BLOOD_TYPES: Array<"ALL" | BloodType> = [
  "ALL",
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
];

const INITIAL_FILTERS: AdvancedFilters = {
  verifiedOnly: true,
  availableOnly: false,
  township: "",
};

const INITIAL_VISIBLE_DONORS = 6;

const MOCK_DONORS: Donor[] = [
  {
    id: "donor-001",
    fullName: "Thinzar Kyaw",
    bloodType: "O-",
    township: "Bahan",
    distanceKm: 1.2,
    availability: "AVAILABLE",
    verified: true,
    donationCount: 14,
    livesImpacted: 42,
    lastDonation: "2026-04-10",
    eligibleFrom: "Eligible today",
    responseRate: 96,
    phone: "+95 9 420 000 101",
  },
  {
    id: "donor-002",
    fullName: "Aung Min Htet",
    bloodType: "A+",
    township: "Sanchaung",
    distanceKm: 2.4,
    availability: "RESPONDING",
    verified: true,
    donationCount: 9,
    livesImpacted: 27,
    lastDonation: "2026-05-21",
    eligibleFrom: "Eligible today",
    responseRate: 91,
    phone: "+95 9 420 000 102",
  },
  {
    id: "donor-003",
    fullName: "May Thiri Win",
    bloodType: "B+",
    township: "Kamayut",
    distanceKm: 3.1,
    availability: "AVAILABLE",
    verified: true,
    donationCount: 7,
    livesImpacted: 21,
    lastDonation: "2026-04-28",
    eligibleFrom: "Eligible today",
    responseRate: 89,
    phone: "+95 9 420 000 103",
  },
  {
    id: "donor-004",
    fullName: "Htet Wai Yan",
    bloodType: "AB+",
    township: "Hlaing",
    distanceKm: 4.3,
    availability: "RESTING",
    verified: true,
    donationCount: 11,
    livesImpacted: 33,
    lastDonation: "2026-07-02",
    eligibleFrom: "Available in 19 days",
    responseRate: 84,
  },
  {
    id: "donor-005",
    fullName: "Su Myat Noe",
    bloodType: "O+",
    township: "Tamwe",
    distanceKm: 5.1,
    availability: "AVAILABLE",
    verified: true,
    donationCount: 18,
    livesImpacted: 54,
    lastDonation: "2026-03-19",
    eligibleFrom: "Eligible today",
    responseRate: 98,
    phone: "+95 9 420 000 105",
  },
  {
    id: "donor-006",
    fullName: "Kaung Myat Thu",
    bloodType: "A-",
    township: "Yankin",
    distanceKm: 5.7,
    availability: "OFFLINE",
    verified: true,
    donationCount: 5,
    livesImpacted: 15,
    lastDonation: "2026-05-03",
    eligibleFrom: "Eligible today",
    responseRate: 72,
  },
  {
    id: "donor-007",
    fullName: "Ei Mon Kyaw",
    bloodType: "B-",
    township: "Thingangyun",
    distanceKm: 6.2,
    availability: "AVAILABLE",
    verified: true,
    donationCount: 12,
    livesImpacted: 36,
    lastDonation: "2026-04-14",
    eligibleFrom: "Eligible today",
    responseRate: 94,
    phone: "+95 9 420 000 107",
  },
  {
    id: "donor-008",
    fullName: "Nay Lin Oo",
    bloodType: "AB-",
    township: "Dagon",
    distanceKm: 7.4,
    availability: "RESTING",
    verified: false,
    donationCount: 3,
    livesImpacted: 9,
    lastDonation: "2026-06-29",
    eligibleFrom: "Available in 16 days",
    responseRate: 68,
  },
];

export default function DonorsPage() {
  const [donors] = useState<Donor[]>(MOCK_DONORS);
  const [selectedBloodType, setSelectedBloodType] = useState<"ALL" | BloodType>(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("NEAREST");
  const [filters, setFilters] = useState<AdvancedFilters>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_DONORS);
  const [mobileView, setMobileView] = useState<MobileView>("DONORS");

  // Radar state for reverse broadcast
  const [showRadar, setShowRadar] = useState(false);
  const [radarBloodType, setRadarBloodType] = useState<BloodType>("O+");
  // Township centroid of the logged-in user (privacy-safe; never exact GPS).
  // Defaults to downtown Yangon until the profile township is resolved.
  const [radarCenter, setRadarCenter] = useState({ lat: 16.8409, lng: 96.1735 });

  useEffect(() => {
    const loadMyDonorContext = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("blood_type, township")
          .eq("id", user.id)
          .single();

        if (profile?.blood_type) {
          setRadarBloodType(profile.blood_type as BloodType);
        }
        if (profile?.township) {
          const { data: township } = await supabase
            .from("townships")
            .select("lat, lng")
            .ilike("name", profile.township.trim())
            .maybeSingle();
          if (township) {
            setRadarCenter({ lat: township.lat, lng: township.lng });
          }
        }
      } catch (error) {
        console.error("Unable to load donor context:", error);
      }
    };

    void loadMyDonorContext();
  }, []);

  const stats = useMemo(() => {
    const available = donors.filter(
      (donor) => donor.availability === "AVAILABLE",
    ).length;

    const responding = donors.filter(
      (donor) => donor.availability === "RESPONDING",
    ).length;

    const verified = donors.filter((donor) => donor.verified).length;

    const averageDistance =
      donors.length > 0
        ? donors.reduce((total, donor) => total + donor.distanceKm, 0) /
          donors.length
        : 0;

    return {
      total: donors.length,
      available,
      responding,
      verified,
      averageDistance,
    };
  }, [donors]);

  const filteredDonors = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedTownship = filters.township.trim().toLowerCase();

    const filtered = donors.filter((donor) => {
      if (
        selectedBloodType !== "ALL" &&
        donor.bloodType !== selectedBloodType
      ) {
        return false;
      }

      if (filters.verifiedOnly && !donor.verified) {
        return false;
      }

      if (filters.availableOnly && donor.availability !== "AVAILABLE") {
        return false;
      }

      if (
        normalizedTownship &&
        !donor.township.toLowerCase().includes(normalizedTownship)
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        donor.fullName,
        donor.bloodType,
        donor.township,
        donor.availability,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });

    return [...filtered].sort((first, second) => {
      if (sortBy === "MOST_ACTIVE") {
        return second.donationCount - first.donationCount;
      }

      if (sortBy === "RECENT") {
        return (
          new Date(second.lastDonation).getTime() -
          new Date(first.lastDonation).getTime()
        );
      }

      return first.distanceKm - second.distanceKm;
    });
  }, [donors, filters, search, selectedBloodType, sortBy]);

  const visibleDonors = filteredDonors.slice(0, visibleCount);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.verifiedOnly) count += 1;
    if (filters.availableOnly) count += 1;
    if (filters.township.trim()) count += 1;

    return count;
  }, [filters]);

  const clearFilters = () => {
    setSearch("");
    setSelectedBloodType("ALL");
    setFilters(INITIAL_FILTERS);
    setSortBy("NEAREST");
    setVisibleCount(INITIAL_VISIBLE_DONORS);
  };

  if (showRadar) {
    return (
      <BroadcastRadar
        centerLat={radarCenter.lat}
        centerLng={radarCenter.lng}
        mode="hospital"
        bloodTypes={[radarBloodType]}
        entityId=""
        onClose={() => setShowRadar(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-24 text-[#111827] lg:pb-10">
      <HospitalTopBar
        title="Donor Network"
        subtitle="Verified nearby blood donors"
        isLive
      />

      <main>
        <DonorNetworkHeader
          stats={stats}
          onAvailable={() => {
            setFilters((current) => ({
              ...current,
              availableOnly: true,
            }));
            setMobileView("DONORS");
          }}
          onFindHospitals={() => setShowRadar(true)}
          radarBloodType={radarBloodType}
          onRadarBloodTypeChange={setRadarBloodType}
        />

        <MobileViewTabs
          value={mobileView}
          onChange={setMobileView}
          donorCount={filteredDonors.length}
        />

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
            <DonorDirectory
              donors={donors}
              filteredDonors={filteredDonors}
              visibleDonors={visibleDonors}
              selectedBloodType={selectedBloodType}
              search={search}
              sortBy={sortBy}
              activeFilterCount={activeFilterCount}
              onBloodTypeChange={(bloodType) => {
                setSelectedBloodType(bloodType);
                setVisibleCount(INITIAL_VISIBLE_DONORS);
              }}
              onSearchChange={(value) => {
                setSearch(value);
                setVisibleCount(INITIAL_VISIBLE_DONORS);
              }}
              onSortChange={setSortBy}
              onOpenFilters={() => setShowFilters(true)}
              onSelectDonor={setSelectedDonor}
              onLoadMore={() => setVisibleCount((current) => current + 6)}
              onClear={clearFilters}
            />

            <aside className="min-w-0">
              <div className="sticky top-5 space-y-5">
                <CoveragePanel stats={stats} donors={donors} />
                <NetworkSafetyCard />
              </div>
            </aside>
          </div>

          <div className="lg:hidden">
            {mobileView === "DONORS" ? (
              <DonorDirectory
                donors={donors}
                filteredDonors={filteredDonors}
                visibleDonors={visibleDonors}
                selectedBloodType={selectedBloodType}
                search={search}
                sortBy={sortBy}
                activeFilterCount={activeFilterCount}
                onBloodTypeChange={(bloodType) => {
                  setSelectedBloodType(bloodType);
                  setVisibleCount(INITIAL_VISIBLE_DONORS);
                }}
                onSearchChange={(value) => {
                  setSearch(value);
                  setVisibleCount(INITIAL_VISIBLE_DONORS);
                }}
                onSortChange={setSortBy}
                onOpenFilters={() => setShowFilters(true)}
                onSelectDonor={setSelectedDonor}
                onLoadMore={() => setVisibleCount((current) => current + 6)}
                onClear={clearFilters}
              />
            ) : (
              <div className="space-y-5">
                <CoveragePanel stats={stats} donors={donors} />
                <NetworkSafetyCard />
              </div>
            )}
          </div>
        </div>
      </main>

      {showFilters && (
        <FilterModal
          filters={filters}
          setFilters={setFilters}
          onClear={() => setFilters(INITIAL_FILTERS)}
          onClose={() => setShowFilters(false)}
        />
      )}

      {selectedDonor && (
        <DonorDetailsDrawer
          donor={selectedDonor}
          onClose={() => setSelectedDonor(null)}
        />
      )}
    </div>
  );
}

function DonorNetworkHeader({
  stats,
  onAvailable,
  onFindHospitals,
  radarBloodType,
  onRadarBloodTypeChange,
}: {
  stats: {
    total: number;
    available: number;
    responding: number;
    verified: number;
    averageDistance: number;
  };
  onAvailable: () => void;
  onFindHospitals: () => void;
  radarBloodType: BloodType;
  onRadarBloodTypeChange: (bloodType: BloodType) => void;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0D1933]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-[90px]" />
        <div className="absolute -right-20 top-4 h-64 w-64 rounded-full bg-red-500/15 blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[10px] font-bold text-slate-200">
                Donor matching network online
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Verified donor network
            </h1>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400 sm:text-sm">
              Find compatible donors using blood type, readiness, verification,
              and distance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAvailable}
              className="hidden h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 text-xs font-black text-[#05291F] shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-300 sm:inline-flex"
            >
              <Zap className="h-4 w-4" />
              Available now
            </button>

            <select
              value={radarBloodType}
              onChange={(e) => onRadarBloodTypeChange(e.target.value as BloodType)}
              className="h-9 rounded-xl border border-white/10 bg-white/[0.08] px-2 text-xs font-bold text-white outline-none"
            >
              {BLOOD_TYPES.filter((bt) => bt !== "ALL").map((bt) => (
                <option key={bt} value={bt} className="bg-[#0D1933]">
                  {bt}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onFindHospitals}
              className="hidden h-11 items-center justify-center gap-2 rounded-2xl bg-red-400 px-4 text-xs font-black text-[#3B0A0A] shadow-lg shadow-red-950/20 transition hover:bg-red-300 sm:inline-flex"
            >
              <Radio className="h-4 w-4" />
              Find Hospitals
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
          <HeaderMetric
            icon={Users}
            value={stats.total}
            label="Donors"
            accent="text-blue-300"
          />

          <HeaderMetric
            icon={UserRoundCheck}
            value={stats.available}
            label="Available"
            accent="text-emerald-300"
            highlighted={stats.available > 0}
          />

          <HeaderMetric
            icon={Radio}
            value={stats.responding}
            label="Responding"
            accent="text-red-300"
          />

          <HeaderMetric
            icon={Navigation}
            value={`${stats.averageDistance.toFixed(1)} km`}
            label="Average"
            accent="text-amber-300"
          />
        </div>
      </div>
    </section>
  );
}

function HeaderMetric({
  icon: Icon,
  value,
  label,
  accent,
  highlighted = false,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  accent: string;
  highlighted?: boolean;
}) {
  return (
    <article
      className={clsx(
        "rounded-2xl border p-3 backdrop-blur-xl",
        highlighted
          ? "border-emerald-400/30 bg-emerald-400/10"
          : "border-white/10 bg-white/[0.07]",
      )}
    >
      <Icon className={clsx("h-4 w-4", accent)} />

      <p className="mt-2 truncate text-lg font-black text-white sm:text-2xl">
        {value}
      </p>

      <p className="mt-0.5 truncate text-[8px] font-semibold text-slate-400 sm:text-[10px]">
        {label}
      </p>
    </article>
  );
}

function MobileViewTabs({
  value,
  onChange,
  donorCount,
}: {
  value: MobileView;
  onChange: (value: MobileView) => void;
  donorCount: number;
}) {
  return (
    <div className="sticky top-[72px] z-30 border-b border-slate-200/70 bg-[#F4F6FA]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
      <nav className="mx-auto grid max-w-xl grid-cols-2 rounded-2xl border border-white bg-white p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => onChange("DONORS")}
          className={clsx(
            "flex h-11 items-center justify-center gap-2 rounded-xl text-[10px] font-black transition",
            value === "DONORS" ? "bg-[#0D1933] text-white" : "text-slate-500",
          )}
        >
          <Users className="h-4 w-4" />
          Donors
          <span
            className={clsx(
              "rounded-full px-1.5 py-0.5 text-[8px]",
              value === "DONORS"
                ? "bg-white/15 text-white"
                : "bg-slate-100 text-slate-500",
            )}
          >
            {donorCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("COVERAGE")}
          className={clsx(
            "flex h-11 items-center justify-center gap-2 rounded-xl text-[10px] font-black transition",
            value === "COVERAGE" ? "bg-[#0D1933] text-white" : "text-slate-500",
          )}
        >
          <MapPin className="h-4 w-4" />
          Coverage
        </button>
      </nav>
    </div>
  );
}

function DonorDirectory({
  donors,
  filteredDonors,
  visibleDonors,
  selectedBloodType,
  search,
  sortBy,
  activeFilterCount,
  onBloodTypeChange,
  onSearchChange,
  onSortChange,
  onOpenFilters,
  onSelectDonor,
  onLoadMore,
  onClear,
}: {
  donors: Donor[];
  filteredDonors: Donor[];
  visibleDonors: Donor[];
  selectedBloodType: "ALL" | BloodType;
  search: string;
  sortBy: SortOption;
  activeFilterCount: number;
  onBloodTypeChange: (value: "ALL" | BloodType) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onOpenFilters: () => void;
  onSelectDonor: (donor: Donor) => void;
  onLoadMore: () => void;
  onClear: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserRoundCheck className="h-4 w-4 text-emerald-600" />

              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                Donor directory
              </p>
            </div>

            <h2 className="mt-1 text-lg font-black text-[#0D1933]">
              Nearby verified donors
            </h2>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500">
            {filteredDonors.length} matches
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Name, township or blood type"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-[#0D1933] outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            />
          </div>

          <button
            type="button"
            onClick={onOpenFilters}
            aria-label="Open donor filters"
            className={clsx(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
              activeFilterCount > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />

            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 px-1 text-[8px] font-black text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {BLOOD_TYPES.map((bloodType) => {
              const active = selectedBloodType === bloodType;

              const count =
                bloodType === "ALL"
                  ? donors.length
                  : donors.filter((donor) => donor.bloodType === bloodType)
                      .length;

              return (
                <button
                  key={bloodType}
                  type="button"
                  onClick={() => onBloodTypeChange(bloodType)}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-black transition",
                    active
                      ? "bg-[#0D1933] text-white"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {bloodType === "ALL" ? "All" : bloodType}

                  <span
                    className={clsx(
                      "rounded-full px-1.5 py-0.5 text-[8px]",
                      active
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

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold text-slate-400">
            Showing donors by readiness and location
          </p>

          <label className="relative shrink-0">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

            <select
              value={sortBy}
              onChange={(event) =>
                onSortChange(event.target.value as SortOption)
              }
              className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-[10px] font-black text-slate-600 outline-none"
            >
              <option value="NEAREST">Nearest</option>
              <option value="MOST_ACTIVE">Most active</option>
              <option value="RECENT">Recent donation</option>
            </select>
          </label>
        </div>
      </div>

      <div className="bg-[#F8FAFC] p-4 sm:p-5">
        {visibleDonors.length === 0 ? (
          <EmptyDonorState onClear={onClear} />
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleDonors.map((donor) => (
                <DonorCard
                  key={donor.id}
                  donor={donor}
                  onOpen={() => onSelectDonor(donor)}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-col items-center gap-2">
              <p className="text-[10px] font-semibold text-slate-400">
                Showing {visibleDonors.length} of {filteredDonors.length} donors
              </p>

              {visibleDonors.length < filteredDonors.length && (
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-xs font-black text-[#0D1933] shadow-sm"
                >
                  Load more donors
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function DonorCard({ donor, onOpen }: { donor: Donor; onOpen: () => void }) {
  const availability = getAvailabilityConfig(donor.availability);

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#0D1933] text-xl font-black text-white">
            {getInitials(donor.fullName)}

            {donor.verified && (
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white bg-emerald-500 text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-[#0D1933]">
                  {donor.fullName}
                </h3>

                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate">{donor.township}</span>
                  <span>·</span>
                  <span>{donor.distanceKm.toFixed(1)} km</span>
                </div>
              </div>

              <div className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 px-3 text-xl font-black text-red-600">
                {donor.bloodType}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em]",
                  availability.className,
                )}
              >
                <span
                  className={clsx(
                    "h-1.5 w-1.5 rounded-full",
                    availability.dotClassName,
                    donor.availability === "AVAILABLE" && "animate-pulse",
                  )}
                />
                {availability.label}
              </span>

              {donor.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <DonorMetric value={donor.donationCount} label="Donations" />

          <DonorMetric value={`${donor.responseRate}%`} label="Response" />

          <DonorMetric value={donor.livesImpacted} label="Lives helped" />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <CalendarClock className="h-4 w-4 shrink-0 text-slate-400" />

          <p className="truncate text-[10px] font-semibold text-slate-500">
            {donor.eligibleFrom}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0D1933] px-3 text-[10px] font-black text-white"
        >
          View donor
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

function DonorMetric({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5 text-center">
      <p className="truncate text-sm font-black text-[#0D1933]">{value}</p>

      <p className="mt-0.5 truncate text-[8px] font-bold uppercase tracking-[0.06em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function CoveragePanel({
  stats,
  donors,
}: {
  stats: {
    total: number;
    available: number;
    responding: number;
    verified: number;
    averageDistance: number;
  };
  donors: Donor[];
}) {
  const coverage = [
    {
      township: "Bahan",
      count: donors.filter((donor) => donor.township === "Bahan").length,
    },
    {
      township: "Sanchaung",
      count: donors.filter((donor) => donor.township === "Sanchaung").length,
    },
    {
      township: "Kamayut",
      count: donors.filter((donor) => donor.township === "Kamayut").length,
    },
    {
      township: "Hlaing",
      count: donors.filter((donor) => donor.township === "Hlaing").length,
    },
  ];

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
      <div className="relative overflow-hidden bg-[#0D1933] px-5 py-5 text-white">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-[#05291F]">
              <Navigation className="h-5 w-5" />
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.1em] text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live coverage
            </span>
          </div>

          <h2 className="mt-4 text-lg font-black">Donor coverage</h2>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Nearby verified donor distribution and availability.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <CoverageMetric
            icon={UserRoundCheck}
            value={stats.available}
            label="Available"
            className="bg-emerald-50 text-emerald-600"
          />

          <CoverageMetric
            icon={Navigation}
            value={`${stats.averageDistance.toFixed(1)} km`}
            label="Average distance"
            className="bg-blue-50 text-blue-600"
          />
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Township coverage
          </p>

          <div className="mt-3 space-y-2">
            {coverage.map((item) => (
              <div
                key={item.township}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />

                  <span className="text-xs font-bold text-[#0D1933]">
                    {item.township}
                  </span>
                </div>

                <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-slate-500">
                  {item.count} donor
                  {item.count === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CoverageMetric({
  icon: Icon,
  value,
  label,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  className: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div
        className={clsx(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          className,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-3 text-lg font-black text-[#0D1933]">{value}</p>

      <p className="text-[9px] font-bold text-slate-400">{label}</p>
    </div>
  );
}

function NetworkSafetyCard() {
  return (
    <section className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-black text-emerald-950">
            Donor privacy protected
          </h3>

          <p className="mt-1 text-xs leading-5 text-emerald-700">
            Contact details remain hidden until a verified emergency request is
            matched and accepted.
          </p>
        </div>
      </div>
    </section>
  );
}

function DonorDetailsDrawer({
  donor,
  onClose,
}: {
  donor: Donor;
  onClose: () => void;
}) {
  const availability = getAvailabilityConfig(donor.availability);

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-[#07101F]/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="donor-details-title"
        className="h-full w-full max-w-md overflow-y-auto bg-[#F4F6FA] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-[#0D1933] px-5 pb-5 pt-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-300">
                <UserRoundCheck className="h-3.5 w-3.5" />
                Verified donor
              </div>

              <h2 id="donor-details-title" className="mt-4 text-2xl font-black">
                Donor profile
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Review readiness before creating a match.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close donor details"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] bg-[#0D1933] text-xl font-black text-white">
                {getInitials(donor.fullName)}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-black text-[#0D1933]">
                  {donor.fullName}
                </h3>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {donor.township} · {donor.distanceKm} km
                </div>

                <span
                  className={clsx(
                    "mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em]",
                    availability.className,
                  )}
                >
                  <span
                    className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      availability.dotClassName,
                    )}
                  />
                  {availability.label}
                </span>
              </div>

              <div className="flex h-14 min-w-14 items-center justify-center rounded-2xl bg-red-50 px-3 text-2xl font-black text-red-600">
                {donor.bloodType}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <DrawerMetric value={donor.donationCount} label="Donations" />

              <DrawerMetric value={donor.livesImpacted} label="Lives helped" />

              <DrawerMetric value={`${donor.responseRate}%`} label="Response" />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
              Donation readiness
            </p>

            <div className="mt-4 space-y-3">
              <DetailRow
                icon={CalendarClock}
                label="Eligibility"
                value={donor.eligibleFrom}
              />

              <DetailRow
                icon={Clock3}
                label="Last donation"
                value={formatDate(donor.lastDonation)}
              />

              <DetailRow
                icon={Navigation}
                label="Distance"
                value={`${donor.distanceKm.toFixed(1)} km away`}
              />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-emerald-950">
                  Identity verified
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  This donor has completed identity and blood-type verification
                  within LifeLink.
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600"
            >
              Close
            </button>

            <button
              type="button"
              disabled={donor.availability !== "AVAILABLE"}
              onClick={() =>
                window.alert(`Create a verified match for ${donor.fullName}.`)
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-500 text-sm font-black text-white shadow-lg shadow-red-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <Radio className="h-4 w-4" />
              Match donor
            </button>
          </div>

          {donor.phone && donor.availability === "RESPONDING" && (
            <button
              type="button"
              onClick={() => window.open(`tel:${donor.phone}`, "_self")}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0D1933] text-sm font-black text-white"
            >
              <Phone className="h-4 w-4" />
              Contact responding donor
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function DrawerMetric({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-base font-black text-[#0D1933]">{value}</p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.07em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-xs font-black text-[#0D1933]">
          {value}
        </p>
      </div>
    </div>
  );
}

function FilterModal({
  filters,
  setFilters,
  onClear,
  onClose,
}: {
  filters: AdvancedFilters;
  setFilters: React.Dispatch<React.SetStateAction<AdvancedFilters>>;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#07101F]/65 backdrop-blur-sm sm:items-center sm:px-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donor-filter-title"
        className="w-full overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-w-lg sm:rounded-[2rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-[#0D1933] px-6 pb-6 pt-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-300">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Donor filters
              </div>

              <h2 id="donor-filter-title" className="mt-4 text-xl font-black">
                Refine donor results
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Filter by verification, availability, and township.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <FilterToggle
            icon={ShieldCheck}
            title="Verified donors only"
            description="Hide donors whose verification is incomplete."
            checked={filters.verifiedOnly}
            onChange={(checked) =>
              setFilters((current) => ({
                ...current,
                verifiedOnly: checked,
              }))
            }
          />

          <FilterToggle
            icon={UserRoundCheck}
            title="Available now"
            description="Show donors who are ready to receive requests."
            checked={filters.availableOnly}
            onChange={(checked) =>
              setFilters((current) => ({
                ...current,
                availableOnly: checked,
              }))
            }
          />

          <div>
            <label
              htmlFor="donor-township"
              className="text-xs font-bold text-slate-600"
            >
              Township
            </label>

            <div className="relative mt-2">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="donor-township"
                value={filters.township}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    township: event.target.value,
                  }))
                }
                placeholder="Example: Bahan"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClear}
              className="h-12 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl bg-emerald-500 text-sm font-black text-white shadow-lg shadow-emerald-100"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterToggle({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-[#0D1933]">{title}</p>

        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span
        className={clsx(
          "relative h-7 w-12 shrink-0 rounded-full transition",
          checked ? "bg-emerald-500" : "bg-slate-200",
        )}
      >
        <span
          className={clsx(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-6" : "left-1",
          )}
        />
      </span>
    </label>
  );
}

function EmptyDonorState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
        <Users className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-black text-[#0D1933]">
        No matching donors
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Try changing the blood type, availability, township, or search term.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0D1933] px-5 text-sm font-bold text-white"
      >
        <Filter className="h-4 w-4" />
        Reset filters
      </button>
    </div>
  );
}

function getAvailabilityConfig(availability: DonorAvailability) {
  const configs = {
    AVAILABLE: {
      label: "Available",
      className: "border-emerald-100 bg-emerald-50 text-emerald-700",
      dotClassName: "bg-emerald-500",
    },
    RESPONDING: {
      label: "Responding",
      className: "border-red-100 bg-red-50 text-red-700",
      dotClassName: "bg-red-500",
    },
    RESTING: {
      label: "Recovery",
      className: "border-amber-100 bg-amber-50 text-amber-700",
      dotClassName: "bg-amber-500",
    },
    OFFLINE: {
      label: "Offline",
      className: "border-slate-200 bg-slate-50 text-slate-500",
      dotClassName: "bg-slate-400",
    },
  };

  return configs[availability];
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
