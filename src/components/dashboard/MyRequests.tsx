"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Droplets, ChevronRight } from "lucide-react";
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

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      let query = supabase
        .from("requests")
        .select("*, hospitals(name, township)")
        .order("created_at", { ascending: false })
        .limit(20);
      query = orgId
        ? query.eq("organization_id", orgId)
        : query.eq("requester_id", userData.user.id);
      const { data } = await query;
      setRequests((data as BloodRequest[]) ?? []);
    };
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [orgId]);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <Droplets className="h-4 w-4" /> {title}
      </h2>
      {requests === null ? null : requests.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
          No requests yet.
        </p>
      ) : (
        requests.map((r) => {
          const status = REQUEST_STATUS_META[r.status];
          const urgency = URGENCY_META[r.urgency];
          return (
            <Link
              key={r.id}
              href={`/requests/${r.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-red-200"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {r.blood_type}
                </span>
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {r.hospitals?.name ?? "Hospital"}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <StatusPill label={urgency.label} className={urgency.className} />
                    <StatusPill label={status.label} className={status.className} />
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
            </Link>
          );
        })
      )}
    </section>
  );
};
