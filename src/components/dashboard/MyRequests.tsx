"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Clock3,
  Droplets,
  MapPin,
  Plus,
  Radio,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { REQUEST_STATUS_META, URGENCY_META } from "@/lib/blood";
import { StatusPill } from "@/components/ui/StatusPill";
import type { BloodRequest } from "@/lib/types";

export const MyRequests = ({
  orgId,
  title = "My blood requests",
}: {
  orgId?: string;
  title?: string;
}) => {
  const [requests, setRequests] = useState<BloodRequest[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const load = async () => {
      setRefreshing(true);

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        if (mounted) {
          setRequests([]);
          setRefreshing(false);
        }

        return;
      }

      let query = supabase
        .from("requests")
        .select("*, hospitals(name, township)")
        .order("created_at", { ascending: false })
        .limit(20);

      query = orgId
        ? query.eq("organization_id", orgId)
        : query.eq("requester_id", userData.user.id);

      const { data } = await query;

      if (mounted) {
        setRequests((data as BloodRequest[]) ?? []);
        setRefreshing(false);
      }
    };

    load();

    const interval = setInterval(load, 8000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [orgId]);

  if (requests === null) {
    return <RequestsLoadingState />;
  }

  const activeRequests = requests.filter(
    (request) =>
      request.status !== "CANCELLED" &&
      request.status !== "COMPLETED" &&
      request.status !== "EXPIRED",
  ).length;

  return (
    <section className="min-w-0 space-y-3">
      <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff7f7_100%)] p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-red-200/50 blur-3xl" />
          <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="absolute right-6 top-5 h-20 w-20 rounded-full border border-red-200/50" />
          <div className="absolute right-9 top-8 h-14 w-14 rounded-full border border-red-200/50" />
          <div className="absolute right-[3.45rem] top-[3.35rem] h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]">
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-70" />
          </div>
        </div>

        <div className="relative flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-[0_12px_28px_rgba(239,68,68,0.24)]">
              <Droplets className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-500 sm:text-xs">
                  Request radar
                </p>

                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>

              <h2 className="mt-1.5 break-words text-lg font-black tracking-[-0.025em] text-slate-950 sm:text-xl">
                {title}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Monitor emergency requests and track their latest response
                status.
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm sm:flex">
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                refreshing ? "animate-spin text-red-500" : "text-slate-400"
              }`}
            />
            Auto-updating
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <RequestSummaryItem
            icon={<Activity className="h-4 w-4" />}
            label="Active"
            value={activeRequests.toString()}
            active
          />

          <RequestSummaryItem
            icon={<Droplets className="h-4 w-4" />}
            label="Total"
            value={requests.length.toString()}
          />

          <div className="col-span-2 sm:col-span-1">
            <RequestSummaryItem
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Network"
              value="Protected"
            />
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <EmptyRequestsState orgId={orgId} />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const status = REQUEST_STATUS_META[request.status];
            const urgency = URGENCY_META[request.urgency];

            const isActive =
              request.status !== "CANCELLED" &&
              request.status !== "COMPLETED" &&
              request.status !== "EXPIRED";

            return (
              <Link
                key={request.id}
                href={`/requests/${request.id}`}
                className="group block min-w-0 rounded-[22px] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100 sm:rounded-[26px]"
              >
                <article
                  className={`relative min-w-0 overflow-hidden rounded-[22px] border bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.055)] transition duration-300 sm:rounded-[26px] sm:p-5 ${
                    isActive
                      ? "border-red-200 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-[0_20px_55px_rgba(239,68,68,0.11)]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {isActive && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                  )}

                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white shadow-lg sm:h-14 sm:w-14 sm:text-base ${
                        isActive
                          ? "bg-red-500 shadow-red-500/20"
                          : "bg-slate-800 shadow-slate-900/15"
                      }`}
                    >
                      {request.blood_type}

                      {isActive && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-red-500" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-black leading-5 text-slate-950 sm:text-base">
                            {request.hospitals?.name ?? "Hospital"}
                          </p>

                          {request.hospitals?.township && (
                            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">
                                {request.hospitals.township}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition group-hover:bg-red-50 group-hover:text-red-500">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <StatusPill
                          label={urgency.label}
                          className={urgency.className}
                        />

                        <StatusPill
                          label={status.label}
                          className={status.className}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-slate-50 px-3 py-2.5 sm:rounded-2xl">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Droplets className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                              Blood
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-black text-slate-700 sm:text-sm">
                            {request.blood_type}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 px-3 py-2.5 sm:rounded-2xl">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock3 className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                              Priority
                            </span>
                          </div>

                          <p className="mt-1 truncate text-xs font-black text-slate-700 sm:text-sm">
                            {urgency.label}
                          </p>
                        </div>
                      </div>

                      {isActive && (
                        <div className="mt-3 flex min-h-10 items-center justify-between gap-3 rounded-xl bg-slate-950 px-3.5 text-xs font-bold text-white transition group-hover:bg-red-600 sm:rounded-2xl sm:text-sm">
                          <span className="truncate">Open live request</span>

                          <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

const RequestsLoadingState = () => {
  return (
    <section className="min-w-0 space-y-3">
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-950">
              Loading request radar
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Checking your recent emergency requests.
            </p>
          </div>
        </div>
      </div>

      {[1, 2].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-[22px] border border-slate-200 bg-white p-4 sm:rounded-[26px] sm:p-5"
        >
          <div className="flex gap-3">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200 sm:h-14 sm:w-14" />

            <div className="min-w-0 flex-1">
              <div className="h-4 w-2/3 rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-1/3 rounded-full bg-slate-100" />

              <div className="mt-4 flex gap-2">
                <div className="h-6 w-20 rounded-full bg-slate-100" />
                <div className="h-6 w-20 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

const EmptyRequestsState = ({ orgId }: { orgId?: string }) => {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-dashed border-slate-300 bg-white p-5 text-center sm:rounded-[28px] sm:p-7">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-4 h-36 w-36 -translate-x-1/2 rounded-full bg-red-100/50 blur-3xl" />
      </div>

      <div className="relative">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          {orgId ? (
            <Building2 className="h-6 w-6" />
          ) : (
            <Droplets className="h-6 w-6" />
          )}
        </div>

        <h3 className="mt-4 text-base font-black text-slate-950">
          No requests yet
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          {orgId
            ? "Emergency requests created by this organization will appear here."
            : "Your blood requests will appear here after you create one."}
        </p>

        <Link
          href="/requests/new"
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-500 px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(239,68,68,0.22)] transition hover:bg-red-600"
        >
          <Plus className="h-4 w-4" />
          Create request
        </Link>
      </div>
    </div>
  );
};

type RequestSummaryItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
};

const RequestSummaryItem = ({
  icon,
  label,
  value,
  active = false,
}: RequestSummaryItemProps) => {
  return (
    <div className="min-w-0 rounded-2xl border border-white bg-white/80 p-3 shadow-sm backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`shrink-0 ${active ? "text-red-500" : "text-slate-400"}`}
        >
          {icon}
        </span>

        <span className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
      </div>

      <p
        className={`mt-1.5 truncate text-sm font-black ${
          active ? "text-red-600" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
};
