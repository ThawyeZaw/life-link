import type { BloodType, MatchStatus, RequestStatus, Urgency } from "./types";

export const BLOOD_TYPES: BloodType[] = [
  "O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-",
];

export const URGENCY_META: Record<
  Urgency,
  { label: string; className: string }
> = {
  CRITICAL: { label: "Critical", className: "bg-red-600 text-white" },
  URGENT: { label: "Urgent", className: "bg-amber-500 text-white" },
  STANDARD: { label: "Standard", className: "bg-slate-500 text-white" },
};

export const REQUEST_STATUS_META: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  OPEN: { label: "Searching donors", className: "bg-blue-100 text-blue-700" },
  MATCHED: { label: "Donor matched", className: "bg-violet-100 text-violet-700" },
  CONFIRMED: { label: "Donation confirmed", className: "bg-emerald-100 text-emerald-700" },
  COMPLETED: { label: "Completed", className: "bg-emerald-600 text-white" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-500" },
  EXPIRED: { label: "Expired", className: "bg-slate-100 text-slate-500" },
};

export const MATCH_STATUS_META: Record<
  MatchStatus,
  { label: string; className: string }
> = {
  INVITED: { label: "Invited", className: "bg-blue-100 text-blue-700" },
  ACCEPTED: { label: "Accepted — review contact", className: "bg-violet-100 text-violet-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-emerald-100 text-emerald-700" },
  DONATED: { label: "Donated", className: "bg-emerald-600 text-white" },
  DECLINED: { label: "Declined", className: "bg-slate-100 text-slate-500" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-500" },
};
