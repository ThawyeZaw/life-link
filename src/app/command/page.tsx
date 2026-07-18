"use client";

// src/app/command/page.tsx
// LifeLink — Hospital Emergency Command Center
// Team Vertex Red

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  Activity,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  Filter,
  Hospital,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

import { HospitalTopBar } from "@/components/layout/HospitalTopBar";
import { MapPlaceholder } from "@/components/command/MapPlaceholder";
import { RequestCard } from "@/components/command/RequestCard";
import { LiveFeed } from "@/components/command/LiveFeed";

import {
  getActiveRequests,
  subscribeToRequests,
  type RequestWithDetails,
  type Urgency,
} from "@/utils/supabase";

import { MOCK_LIVE_FEED, MOCK_REQUESTS } from "@/components/data/mockData";

type FilterTab = "ALL" | Urgency;
type DataMode = "loading" | "live" | "demo";

type AdvancedFilters = {
  bloodType: string;
  township: string;
};

const TABS: Array<{
  key: FilterTab;
  label: string;
}> = [
  { key: "ALL", label: "All" },
  { key: "CRITICAL", label: "Critical" },
  { key: "URGENT", label: "Urgent" },
  { key: "STANDARD", label: "Routine" },
];

const BLOOD_TYPES = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const MOCK_DISTANCES = [2.4, 3.1, 1.8, 4.2, 5.4, 0.9];

const INITIAL_FILTERS: AdvancedFilters = {
  bloodType: "All",
  township: "",
};

export default function CommandPage() {
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [dataMode, setDataMode] = useState<DataMode>("loading");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>(INITIAL_FILTERS);

  const loadRequests = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setDataMode("loading");
    }

    try {
      const data = await getActiveRequests();
      setRequests(data);
      setDataMode("live");
    } catch (error) {
      console.error("Unable to load LifeLink requests:", error);
      setRequests(MOCK_REQUESTS);
      setDataMode("demo");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();

    const channel = subscribeToRequests(
      (newRequest) => {
        setRequests((current) => [
          {
            ...newRequest,
            requester: {
              id: "",
              full_name: "Emergency patient",
              phone: null,
              blood_type: newRequest.blood_type ?? null,
            },
            hospital: null,
          } as RequestWithDetails,
          ...current.filter((request) => request.id !== newRequest.id),
        ]);
      },
      (updatedRequest) => {
        setRequests((current) =>
          current.map((request) =>
            request.id === updatedRequest.id
              ? { ...request, ...updatedRequest }
              : request,
          ),
        );
      },
    );

    return () => {
      channel.unsubscribe();
    };
  }, [loadRequests]);

  const requestStats = useMemo(() => {
    const critical = requests.filter(
      (request) => request.urgency === "CRITICAL",
    ).length;

    const urgent = requests.filter(
      (request) => request.urgency === "URGENT",
    ).length;

    const standard = requests.filter(
      (request) => request.urgency === "STANDARD",
    ).length;

    const totalUnits = requests.reduce(
      (total, request) => total + Number(request.units_needed ?? 0),
      0,
    );

    return {
      total: requests.length,
      critical,
      urgent,
      standard,
      totalUnits,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedTownship = filters.township.trim().toLowerCase();

    return requests.filter((request) => {
      if (activeTab !== "ALL" && request.urgency !== activeTab) {
        return false;
      }

      if (
        filters.bloodType !== "All" &&
        request.blood_type !== filters.bloodType
      ) {
        return false;
      }

      if (
        normalizedTownship &&
        !request.township?.toLowerCase().includes(normalizedTownship)
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableValues = [
        request.hospital?.name,
        request.township,
        request.blood_type,
        request.requester?.full_name,
        request.urgency,
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [activeTab, filters, requests, search]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.bloodType !== "All") count += 1;
    if (filters.township.trim()) count += 1;

    return count;
  }, [filters]);

  const handleManageRequest = (id: string) => {
    const request = requests.find((item) => item.id === id);

    if (!request) return;

    window.alert(
      `Opening ${request.blood_type ?? "blood"} request management in prototype mode.`,
    );
  };

  const clearAllFilters = () => {
    setActiveTab("ALL");
    setSearch("");
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-10 text-[#111827]">
      <HospitalTopBar
        title="Command Center"
        subtitle="LifeLink Emergency Operations"
        isLive
      />

      <main>
        <section className="relative overflow-hidden bg-[#0D1933]">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-red-500/20 blur-[100px]" />
            <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-emerald-400/15 blur-[100px]" />
            <div className="absolute bottom-0 left-1/3 h-52 w-96 rounded-full bg-blue-500/10 blur-[90px]" />

            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "38px 38px",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 backdrop-blur-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>

                  <span className="text-[11px] font-bold text-slate-200">
                    Emergency coordination network online
                  </span>
                </div>

                <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em] text-red-300">
                  Live hospital operations
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                  Emergency Command Center
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Monitor urgent blood requests, coordinate nearby donors, and
                  manage hospital response activity from one real-time
                  workspace.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => void loadRequests(true)}
                  disabled={isRefreshing}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-xs font-bold text-white backdrop-blur-xl transition hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={clsx("h-4 w-4", isRefreshing && "animate-spin")}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.alert(
                      "Emergency request creation opens here in prototype mode.",
                    )
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 text-xs font-bold text-white shadow-[0_12px_35px_rgba(239,68,68,0.3)] transition hover:-translate-y-0.5 hover:bg-red-400"
                >
                  <Plus className="h-4 w-4" />
                  New request
                </button>
              </div>
            </div>

            {dataMode === "demo" && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100 backdrop-blur-xl">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-bold">
                    Prototype command data active
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-100/70">
                    Live Supabase requests could not be loaded, so LifeLink is
                    displaying realistic sample emergency data.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <CommandMetric
                icon={Activity}
                value={requestStats.total}
                label="Active requests"
                accent="text-blue-300"
              />

              <CommandMetric
                icon={AlertTriangle}
                value={requestStats.critical}
                label="Critical"
                accent="text-red-300"
              />

              <CommandMetric
                icon={Clock3}
                value={requestStats.urgent}
                label="Urgent"
                accent="text-amber-300"
              />

              <CommandMetric
                icon={Droplets}
                value={requestStats.totalUnits}
                label="Units required"
                accent="text-pink-300"
              />

              <CommandMetric
                icon={Users}
                value="24"
                label="Donors responding"
                accent="text-emerald-300"
                className="col-span-2 lg:col-span-1"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-6 px-5 py-6 sm:px-8 lg:px-10">
          <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 px-4 py-5 sm:px-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />

                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
                        Emergency coverage map
                      </p>
                    </div>

                    <h2 className="mt-2 text-xl font-black tracking-tight text-[#0D1933]">
                      Live request locations
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Visualize active requests and nearby response coverage.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                    <Radio className="h-3.5 w-3.5" />
                    Real-time monitoring
                  </div>
                </div>
              </div>

              <div className="relative bg-slate-50 p-3 sm:p-4">
                <MapPlaceholder />

                <div className="pointer-events-none absolute left-6 top-7 hidden rounded-2xl border border-white/80 bg-white/90 p-3 shadow-lg backdrop-blur sm:block">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Highest priority
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                    <p className="text-xs font-bold text-[#0D1933]">
                      {requestStats.critical} critical requests
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="relative overflow-hidden rounded-[1.75rem] bg-[#0D1933] p-5 text-white shadow-[0_18px_50px_rgba(13,25,51,0.18)]">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-red-500/20 blur-3xl" />

              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 shadow-lg shadow-red-950/20">
                  <Zap className="h-6 w-6" />
                </div>

                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
                  Priority intelligence
                </p>

                <h2 className="mt-2 text-xl font-black tracking-tight">
                  Immediate response needed
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  LifeLink has detected requests requiring accelerated donor
                  dispatch and hospital coordination.
                </p>

                <div className="mt-6 space-y-3">
                  <PriorityRow
                    label="Critical requests"
                    value={requestStats.critical}
                    tone="red"
                  />

                  <PriorityRow
                    label="Urgent requests"
                    value={requestStats.urgent}
                    tone="amber"
                  />

                  <PriorityRow
                    label="Routine requests"
                    value={requestStats.standard}
                    tone="blue"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("CRITICAL")}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black text-[#0D1933] transition hover:bg-slate-100"
                >
                  Review critical requests
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </aside>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 px-4 py-5 sm:px-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-red-500" />

                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
                      Request operations
                    </p>
                  </div>

                  <h2 className="mt-2 text-xl font-black tracking-tight text-[#0D1933]">
                    Active emergency requests
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Search, prioritize, and manage hospital blood requests.
                  </p>
                </div>

                <div className="flex w-full gap-2 xl:max-w-xl">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="command-search"
                      type="search"
                      placeholder="Search hospital, blood type or township"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-[#0D1933] outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
                    />
                  </div>

                  <button
                    type="button"
                    aria-label="Open advanced filters"
                    onClick={() => setShowFilters(true)}
                    className={clsx(
                      "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition",
                      activeFilterCount > 0
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100",
                    )}
                  >
                    <SlidersHorizontal className="h-4 w-4" />

                    {activeFilterCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-black text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border-b border-slate-100 px-4 py-3 sm:px-5">
              <div className="flex min-w-max items-center gap-2">
                {TABS.map((tab) => {
                  const count =
                    tab.key === "ALL"
                      ? requestStats.total
                      : requests.filter(
                          (request) => request.urgency === tab.key,
                        ).length;

                  return (
                    <button
                      key={tab.key}
                      id={`tab-${tab.key.toLowerCase()}`}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={clsx(
                        "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition",
                        activeTab === tab.key
                          ? tab.key === "CRITICAL"
                            ? "bg-red-500 text-white shadow-sm"
                            : "bg-[#0D1933] text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      )}
                    >
                      {tab.label}

                      <span
                        className={clsx(
                          "rounded-full px-1.5 py-0.5 text-[9px]",
                          activeTab === tab.key
                            ? "bg-white/15 text-white"
                            : "bg-white text-slate-400",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

                {(activeFilterCount > 0 || search || activeTab !== "ALL") && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="ml-1 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#F8FAFC] px-4 py-4 sm:px-5">
              {dataMode === "loading" ? (
                <CommandLoadingState />
              ) : filteredRequests.length === 0 ? (
                <EmptyRequestsState onClear={clearAllFilters} />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {filteredRequests.map((request, index) => (
                    <div
                      key={request.id}
                      className="overflow-hidden rounded-[1.5rem]"
                    >
                      <RequestCard
                        request={request}
                        distanceKm={
                          MOCK_DISTANCES[index % MOCK_DISTANCES.length]
                        }
                        onManage={handleManageRequest}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {dataMode !== "loading" && (
            <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-emerald-600" />

                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                        Live network activity
                      </p>
                    </div>

                    <h2 className="mt-2 text-xl font-black tracking-tight text-[#0D1933]">
                      Response feed
                    </h2>
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    Updating
                  </span>
                </div>

                <LiveFeed items={MOCK_LIVE_FEED} />
              </div>

              <aside className="space-y-4">
                <OperationStatusCard
                  icon={ShieldCheck}
                  title="Hospital verified"
                  description="Emergency requests are being issued through an authenticated facility account."
                  tone="emerald"
                />

                <OperationStatusCard
                  icon={Users}
                  title="24 donors responding"
                  description="Nearby compatible donors are currently engaging with active alerts."
                  tone="blue"
                />

                <OperationStatusCard
                  icon={Sparkles}
                  title="Smart matching active"
                  description="Requests are prioritized using urgency, compatibility, availability, and distance."
                  tone="red"
                />
              </aside>
            </section>
          )}
        </div>
      </main>

      {showFilters && (
        <FilterModal
          filters={filters}
          setFilters={setFilters}
          onClose={() => setShowFilters(false)}
          onClear={() => setFilters(INITIAL_FILTERS)}
        />
      )}
    </div>
  );
}

function CommandMetric({
  icon: Icon,
  value,
  label,
  accent,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  accent: string;
  className?: string;
}) {
  return (
    <article
      className={clsx(
        "rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-3 backdrop-blur-xl sm:p-4",
        className,
      )}
    >
      <Icon className={clsx("h-4 w-4", accent)} />

      <p className="mt-3 text-xl font-black text-white sm:text-2xl">{value}</p>

      <p className="mt-1 text-[10px] font-semibold text-slate-400 sm:text-xs">
        {label}
      </p>
    </article>
  );
}

function PriorityRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "amber" | "blue";
}) {
  const toneStyles = {
    red: "bg-red-500/15 text-red-300",
    amber: "bg-amber-400/15 text-amber-300",
    blue: "bg-blue-400/15 text-blue-300",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <div className="flex items-center gap-3">
        <span
          className={clsx(
            "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black",
            toneStyles[tone],
          )}
        >
          {value}
        </span>

        <p className="text-xs font-bold text-slate-200">{label}</p>
      </div>

      <ChevronRight className="h-4 w-4 text-slate-500" />
    </div>
  );
}

function OperationStatusCard({
  icon: Icon,
  title,
  description,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tone: "emerald" | "blue" | "red";
}) {
  const styles = {
    emerald: {
      wrapper: "border-emerald-100 bg-emerald-50/70",
      icon: "bg-emerald-500 text-white",
    },
    blue: {
      wrapper: "border-blue-100 bg-blue-50/70",
      icon: "bg-blue-500 text-white",
    },
    red: {
      wrapper: "border-red-100 bg-red-50/70",
      icon: "bg-red-500 text-white",
    },
  };

  return (
    <article
      className={clsx("rounded-[1.5rem] border p-4", styles[tone].wrapper)}
    >
      <div
        className={clsx(
          "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
          styles[tone].icon,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-black text-[#0D1933]">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </article>
  );
}

function CommandLoadingState() {
  return (
    <div className="grid animate-pulse gap-4 lg:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-64 rounded-[1.5rem] bg-slate-200" />
      ))}
    </div>
  );
}

function EmptyRequestsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-black text-[#0D1933]">
        No requests match this view
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Try changing the urgency, blood type, township, or search query.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0D1933] px-5 text-sm font-bold text-white transition hover:bg-[#18294F]"
      >
        <Filter className="h-4 w-4" />
        Reset filters
      </button>
    </div>
  );
}

function FilterModal({
  filters,
  setFilters,
  onClose,
  onClear,
}: {
  filters: AdvancedFilters;
  setFilters: React.Dispatch<React.SetStateAction<AdvancedFilters>>;
  onClose: () => void;
  onClear: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#07101F]/65 backdrop-blur-sm sm:items-center sm:px-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-filter-title"
        className="w-full overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-w-lg sm:rounded-[2rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-[#0D1933] px-6 pb-6 pt-5 text-white">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/20 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-red-300">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Command filters
              </div>

              <h2 id="command-filter-title" className="mt-4 text-xl font-black">
                Refine emergency requests
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Filter active requests by blood type and township.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 transition hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label
              htmlFor="blood-type-filter"
              className="text-xs font-bold text-slate-600"
            >
              Blood type
            </label>

            <select
              id="blood-type-filter"
              value={filters.bloodType}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  bloodType: event.target.value,
                }))
              }
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-[#0D1933] outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
            >
              {BLOOD_TYPES.map((bloodType) => (
                <option key={bloodType} value={bloodType}>
                  {bloodType === "All" ? "All blood types" : bloodType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="township-filter"
              className="text-xs font-bold text-slate-600"
            >
              Township
            </label>

            <div className="relative mt-2">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="township-filter"
                type="text"
                value={filters.township}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    township: event.target.value,
                  }))
                }
                placeholder="Example: Bahan"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-[#0D1933] outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClear}
              className="h-12 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl bg-red-500 text-sm font-bold text-white shadow-lg shadow-red-100 transition hover:bg-red-600"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
