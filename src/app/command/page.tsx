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
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Droplets,
  Filter,
  Hospital,
  ListFilter,
  Map,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
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
type MobileView = "REQUESTS" | "MAP" | "ACTIVITY";

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

const INITIAL_VISIBLE_REQUESTS = 6;

export default function CommandPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [dataMode, setDataMode] = useState<DataMode>("loading");

  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [mobileView, setMobileView] = useState<MobileView>("REQUESTS");

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AdvancedFilters>(INITIAL_FILTERS);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [visibleRequestCount, setVisibleRequestCount] = useState(
    INITIAL_VISIBLE_REQUESTS,
  );

  const [selectedRequest, setSelectedRequest] =
    useState<RequestWithDetails | null>(null);

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
              ? {
                  ...request,
                  ...updatedRequest,
                }
              : request,
          ),
        );

        setSelectedRequest((current) => {
          if (!current || current.id !== updatedRequest.id) {
            return current;
          }

          return {
            ...current,
            ...updatedRequest,
          };
        });
      },
    );

    return () => {
      channel.unsubscribe();
    };
  }, [loadRequests]);

  useEffect(() => {
    setVisibleRequestCount(INITIAL_VISIBLE_REQUESTS);
  }, [activeTab, filters, search]);

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
        request.status,
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [activeTab, filters, requests, search]);

  const visibleRequests = useMemo(
    () => filteredRequests.slice(0, visibleRequestCount),
    [filteredRequests, visibleRequestCount],
  );

  const hasMoreRequests = visibleRequestCount < filteredRequests.length;

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.bloodType !== "All") {
      count += 1;
    }

    if (filters.township.trim()) {
      count += 1;
    }

    return count;
  }, [filters]);

  const hasActiveFilters =
    activeTab !== "ALL" || Boolean(search.trim()) || activeFilterCount > 0;

  const handleManageRequest = (id: string) => {
    const request = requests.find((item) => item.id === id);

    if (request) {
      setSelectedRequest(request);
    }
  };

  const clearAllFilters = () => {
    setActiveTab("ALL");
    setSearch("");
    setFilters(INITIAL_FILTERS);
  };

  const showCriticalRequests = () => {
    setActiveTab("CRITICAL");
    setMobileView("REQUESTS");

    window.scrollTo({
      top: 340,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] pb-24 text-[#111827] lg:pb-10">
      <HospitalTopBar
        title="Command Center"
        subtitle="LifeLink Emergency Operations"
        isLive
      />

      <main>
        <CommandHero
          stats={requestStats}
          dataMode={dataMode}
          isRefreshing={isRefreshing}
          onRefresh={() => void loadRequests(true)}
          onCreateRequest={() => router.push("/broadcast")}
          onCritical={showCriticalRequests}
        />

        <MobileViewNavigation
          value={mobileView}
          requestCount={requestStats.total}
          onChange={setMobileView}
        />

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="hidden gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_390px]">
            <RequestWorkspace
              requests={requests}
              filteredRequests={filteredRequests}
              visibleRequests={visibleRequests}
              dataMode={dataMode}
              activeTab={activeTab}
              search={search}
              activeFilterCount={activeFilterCount}
              hasActiveFilters={hasActiveFilters}
              hasMoreRequests={hasMoreRequests}
              onActiveTabChange={setActiveTab}
              onSearchChange={setSearch}
              onOpenFilters={() => setShowFilters(true)}
              onClearFilters={clearAllFilters}
              onManageRequest={handleManageRequest}
              onLoadMore={() =>
                setVisibleRequestCount((current) => current + 6)
              }
            />

            <aside className="min-w-0">
              <div className="sticky top-5 space-y-5">
                <CompactMapPanel stats={requestStats} />
                <CompactActivityPanel />
              </div>
            </aside>
          </div>

          <div className="lg:hidden">
            {mobileView === "REQUESTS" && (
              <RequestWorkspace
                requests={requests}
                filteredRequests={filteredRequests}
                visibleRequests={visibleRequests}
                dataMode={dataMode}
                activeTab={activeTab}
                search={search}
                activeFilterCount={activeFilterCount}
                hasActiveFilters={hasActiveFilters}
                hasMoreRequests={hasMoreRequests}
                onActiveTabChange={setActiveTab}
                onSearchChange={setSearch}
                onOpenFilters={() => setShowFilters(true)}
                onClearFilters={clearAllFilters}
                onManageRequest={handleManageRequest}
                onLoadMore={() =>
                  setVisibleRequestCount((current) => current + 6)
                }
              />
            )}

            {mobileView === "MAP" && <CompactMapPanel stats={requestStats} />}

            {mobileView === "ACTIVITY" && <CompactActivityPanel />}
          </div>
        </div>
      </main>

      <button
        type="button"
        onClick={() => router.push("/broadcast")}
        className="fixed bottom-5 right-4 z-30 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 text-sm font-black text-white shadow-[0_18px_45px_rgba(239,68,68,0.35)] transition active:scale-[0.97] lg:hidden"
      >
        <Plus className="h-5 w-5" />
        New request
      </button>

      {showFilters && (
        <FilterModal
          filters={filters}
          setFilters={setFilters}
          onClose={() => setShowFilters(false)}
          onClear={() => setFilters(INITIAL_FILTERS)}
        />
      )}

      {selectedRequest && (
        <RequestDetailsDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

function CommandHero({
  stats,
  dataMode,
  isRefreshing,
  onRefresh,
  onCreateRequest,
  onCritical,
}: {
  stats: {
    total: number;
    critical: number;
    urgent: number;
    standard: number;
    totalUnits: number;
  };
  dataMode: DataMode;
  isRefreshing: boolean;
  onRefresh: () => void;
  onCreateRequest: () => void;
  onCritical: () => void;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0D1933]">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-red-500/20 blur-[90px]" />
        <div className="absolute -right-20 top-5 h-72 w-72 rounded-full bg-emerald-400/10 blur-[95px]" />
        <div className="absolute bottom-0 left-1/3 h-48 w-80 rounded-full bg-blue-500/10 blur-[90px]" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "38px 38px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-[10px] font-bold text-slate-200">
                Emergency coordination network online
              </span>
            </div>

            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
              Live hospital operations
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
              Emergency Command Center
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400 sm:text-sm">
              Review urgent requests, coordinate donors, and monitor emergency
              response activity.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh emergency requests"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-white backdrop-blur-xl transition hover:bg-white/[0.14] disabled:opacity-50"
            >
              <RefreshCw
                className={clsx("h-4 w-4", isRefreshing && "animate-spin")}
              />
            </button>

            <button
              type="button"
              onClick={onCreateRequest}
              className="hidden h-11 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 text-xs font-black text-white shadow-lg shadow-red-950/20 transition hover:bg-red-400 sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              New request
            </button>
          </div>
        </div>

        {dataMode === "demo" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-[10px] font-semibold text-amber-100">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Sample emergency data is currently displayed.
          </div>
        )}

        <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
          <CommandMetric
            icon={Activity}
            value={stats.total}
            label="Active"
            accent="text-blue-300"
          />

          <button type="button" onClick={onCritical} className="text-left">
            <CommandMetric
              icon={AlertTriangle}
              value={stats.critical}
              label="Critical"
              accent="text-red-300"
              highlighted={stats.critical > 0}
            />
          </button>

          <CommandMetric
            icon={Clock3}
            value={stats.urgent}
            label="Urgent"
            accent="text-amber-300"
          />

          <CommandMetric
            icon={Droplets}
            value={stats.totalUnits}
            label="Units"
            accent="text-pink-300"
          />
        </div>
      </div>
    </section>
  );
}

function CommandMetric({
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
        "h-full rounded-2xl border p-3 backdrop-blur-xl transition",
        highlighted
          ? "border-red-400/30 bg-red-500/15"
          : "border-white/10 bg-white/[0.07]",
      )}
    >
      <Icon className={clsx("h-4 w-4", accent)} />

      <p className="mt-2 text-xl font-black text-white sm:text-2xl">{value}</p>

      <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-400 sm:text-[10px]">
        {label}
      </p>
    </article>
  );
}

function MobileViewNavigation({
  value,
  requestCount,
  onChange,
}: {
  value: MobileView;
  requestCount: number;
  onChange: (view: MobileView) => void;
}) {
  return (
    <div className="sticky top-[72px] z-30 border-b border-slate-200/70 bg-[#F4F6FA]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
      <nav
        aria-label="Command center sections"
        className="mx-auto grid max-w-xl grid-cols-3 rounded-2xl border border-white bg-white p-1.5 shadow-sm"
      >
        <MobileViewButton
          active={value === "REQUESTS"}
          label="Requests"
          count={requestCount}
          icon={ListFilter}
          onClick={() => onChange("REQUESTS")}
        />

        <MobileViewButton
          active={value === "MAP"}
          label="Map"
          icon={Map}
          onClick={() => onChange("MAP")}
        />

        <MobileViewButton
          active={value === "ACTIVITY"}
          label="Activity"
          icon={Radio}
          onClick={() => onChange("ACTIVITY")}
        />
      </nav>
    </div>
  );
}

function MobileViewButton({
  active,
  label,
  count,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "flex h-11 items-center justify-center gap-2 rounded-xl px-2 text-[10px] font-black transition",
        active
          ? "bg-[#0D1933] text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-50",
      )}
    >
      <Icon
        className={clsx(
          "h-4 w-4",
          active ? "text-emerald-300" : "text-slate-400",
        )}
      />

      {label}

      {count !== undefined && (
        <span
          className={clsx(
            "rounded-full px-1.5 py-0.5 text-[8px]",
            active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function RequestWorkspace({
  requests,
  filteredRequests,
  visibleRequests,
  dataMode,
  activeTab,
  search,
  activeFilterCount,
  hasActiveFilters,
  hasMoreRequests,
  onActiveTabChange,
  onSearchChange,
  onOpenFilters,
  onClearFilters,
  onManageRequest,
  onLoadMore,
}: {
  requests: RequestWithDetails[];
  filteredRequests: RequestWithDetails[];
  visibleRequests: RequestWithDetails[];
  dataMode: DataMode;
  activeTab: FilterTab;
  search: string;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  hasMoreRequests: boolean;
  onActiveTabChange: (tab: FilterTab) => void;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
  onClearFilters: () => void;
  onManageRequest: (id: string) => void;
  onLoadMore: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-red-500" />

              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-500">
                Request operations
              </p>
            </div>

            <h2 className="mt-1 text-lg font-black text-[#0D1933]">
              Active emergency requests
            </h2>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500">
            {filteredRequests.length} results
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Hospital, blood type or township"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-[#0D1933] outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
            />
          </div>

          <button
            type="button"
            onClick={onOpenFilters}
            aria-label="Open request filters"
            className={clsx(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition",
              activeFilterCount > 0
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />

            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[8px] font-black text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <div className="flex min-w-max items-center gap-2">
            {TABS.map((tab) => {
              const count =
                tab.key === "ALL"
                  ? requests.length
                  : requests.filter((request) => request.urgency === tab.key)
                      .length;

              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onActiveTabChange(tab.key)}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black transition",
                    active
                      ? tab.key === "CRITICAL"
                        ? "bg-red-500 text-white"
                        : "bg-[#0D1933] text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                  )}
                >
                  {tab.label}

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

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-black text-red-500 hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#F8FAFC] p-4 sm:p-5">
        {dataMode === "loading" ? (
          <CommandLoadingState />
        ) : filteredRequests.length === 0 ? (
          <EmptyRequestsState onClear={onClearFilters} />
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleRequests.map((request, index) => (
                <div
                  key={request.id}
                  className="overflow-hidden rounded-[1.5rem]"
                >
                  <RequestCard
                    request={request}
                    distanceKm={MOCK_DISTANCES[index % MOCK_DISTANCES.length]}
                    onManage={onManageRequest}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col items-center gap-2">
              <p className="text-[10px] font-semibold text-slate-400">
                Showing {visibleRequests.length} of {filteredRequests.length}{" "}
                requests
              </p>

              {hasMoreRequests && (
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-xs font-black text-[#0D1933] shadow-sm transition hover:bg-slate-50"
                >
                  Load more requests
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

function CompactMapPanel({
  stats,
}: {
  stats: {
    total: number;
    critical: number;
    urgent: number;
    standard: number;
    totalUnits: number;
  };
}) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />

            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-red-500">
              Emergency coverage
            </p>
          </div>

          <h2 className="mt-1 text-base font-black text-[#0D1933]">
            Live request map
          </h2>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      <div className="relative bg-slate-50 p-3">
        <MapPlaceholder />

        <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2">
          <MapStat
            label="Critical"
            value={stats.critical}
            className="text-red-600"
          />

          <MapStat
            label="Urgent"
            value={stats.urgent}
            className="text-amber-600"
          />

          <MapStat
            label="Routine"
            value={stats.standard}
            className="text-blue-600"
          />
        </div>
      </div>
    </section>
  );
}

function MapStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-white/80 bg-white/90 p-2 text-center shadow-md backdrop-blur">
      <p className={clsx("text-sm font-black", className)}>{value}</p>

      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function CompactActivityPanel() {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-600" />

            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600">
              Network activity
            </p>
          </div>

          <h2 className="mt-1 text-base font-black text-[#0D1933]">
            Live response feed
          </h2>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[8px] font-black text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Updating
        </span>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        <LiveFeed items={MOCK_LIVE_FEED} />
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 p-4">
        <OperationStatus
          icon={ShieldCheck}
          title="Verified"
          text="Hospital account"
          className="bg-emerald-50 text-emerald-600"
        />

        <OperationStatus
          icon={Users}
          title="24 active"
          text="Donor responses"
          className="bg-blue-50 text-blue-600"
        />
      </div>
    </section>
  );
}

function OperationStatus({
  icon: Icon,
  title,
  text,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
  className: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white p-3">
      <div
        className={clsx(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          className,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[10px] font-black text-[#0D1933]">
          {title}
        </p>

        <p className="truncate text-[8px] text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function RequestDetailsDrawer({
  request,
  onClose,
}: {
  request: RequestWithDetails;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end bg-[#07101F]/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-details-title"
        className="h-full w-full max-w-md overflow-y-auto bg-[#F4F6FA] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 bg-[#0D1933] px-5 py-5 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-red-300">
                <Radio className="h-3.5 w-3.5" />
                Active request
              </div>

              <h2
                id="request-details-title"
                className="mt-4 text-2xl font-black"
              >
                Request details
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Review the request before coordinating donors.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close request details"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="space-y-4 p-5">
          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Blood required
                </p>

                <p className="mt-2 text-4xl font-black text-[#0D1933]">
                  {request.blood_type ?? "—"}
                </p>
              </div>

              <span
                className={clsx(
                  "rounded-full px-3 py-1.5 text-[9px] font-black uppercase",
                  request.urgency === "CRITICAL"
                    ? "bg-red-50 text-red-600"
                    : request.urgency === "URGENT"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-blue-50 text-blue-600",
                )}
              >
                {request.urgency}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <RequestDetailMetric
                icon={Droplets}
                label="Units needed"
                value={String(request.units_needed ?? 0)}
              />

              <RequestDetailMetric
                icon={Activity}
                label="Status"
                value={request.status}
              />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-[#0D1933]">
                  {request.hospital?.name ?? "Verified hospital"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {request.township ?? "Location awaiting confirmation"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white bg-white p-5 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
              Requester
            </p>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Hospital className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-[#0D1933]">
                  {request.requester?.full_name ?? "Emergency patient"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Contact details protected
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-black text-emerald-950">
                  Verified hospital request
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  This request is linked to an authenticated hospital account
                  and recorded for emergency coordination.
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600"
            >
              Close
            </button>

            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-500 text-sm font-black text-white shadow-lg shadow-red-100"
            >
              <Zap className="h-4 w-4" />
              Coordinate
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function RequestDetailMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <Icon className="h-4 w-4 text-slate-400" />

      <p className="mt-2 truncate text-sm font-black text-[#0D1933]">{value}</p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function CommandLoadingState() {
  return (
    <div className="grid animate-pulse gap-4 xl:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-60 rounded-[1.5rem] bg-slate-200" />
      ))}
    </div>
  );
}

function EmptyRequestsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-black text-[#0D1933]">
        No matching requests
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Change the urgency, blood type, township, or search term.
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
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#07101F]/65 backdrop-blur-sm sm:items-center sm:px-5"
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
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-red-300">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Request filters
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
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
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-[#0D1933] outline-none placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
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
              className="h-12 rounded-2xl bg-red-500 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-600"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
