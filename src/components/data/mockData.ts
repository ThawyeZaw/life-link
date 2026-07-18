// ============================================================================
// LifeLink — Myanmar-Localized Mock Data
// Thinzar Kyaw — Frontend Domain
//
// Used as fallback when Supabase is unavailable / user is unauthenticated.
// All data uses Rule 6 locale: Myanmar names, hospitals, townships, km.
// ============================================================================

import type {
  Profile,
  Hospital,
  RequestWithDetails,
  MatchWithDetails,
} from "@/utils/supabase";

// ----------------------------------------------------------------------------
// Mock Donor Profile
// ----------------------------------------------------------------------------
export const MOCK_PROFILE: Profile = {
  id: "mock-donor-001",
  full_name: "Ko Aung Kyaw",
  phone: "09-4200-11234",
  blood_type: "O-",
  township: "Sanchaung",
  date_of_birth: "1995-03-12",
  weight_kg: 68,
  medical_conditions: [],
  last_donation_date: "2024-03-12",
  is_available: true,
  hide_medical_info: false,
  lat: 16.8147,
  lng: 96.1345,
  created_at: "2021-06-01T00:00:00Z",
  updated_at: "2026-07-01T00:00:00Z",
};

// ----------------------------------------------------------------------------
// Mock Hospitals
// ----------------------------------------------------------------------------
export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "hosp-001",
    name: "Yangon General Hospital (YGH)",
    name_mya: "ရန်ကုန်ပြည်သူ့ဆေးရုံကြီး",
    township: "Mingalar Taung Nyunt",
    address: "Bogyoke Aung San Road, Mingalar Taung Nyunt, Yangon",
    phone: "01-256112",
    lat: 16.7789,
    lng: 96.1617,
    verification_status: "APPROVED",
    created_by: null,
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  },
  {
    id: "hosp-002",
    name: "Thukha Yeik Mon Specialist Hospital",
    name_mya: "သုခရိပ်မွန် အထူးကုဆေးရုံ",
    township: "Sanchaung",
    address: "Sanchaung Township, Yangon",
    phone: "01-527110",
    lat: 16.8155,
    lng: 96.1283,
    verification_status: "APPROVED",
    created_by: null,
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  },
  {
    id: "hosp-003",
    name: "Asia Royal Hospital",
    name_mya: "အာရှရွှေနန်း ဆေးရုံ",
    township: "Bahan",
    address: "Bahan Township, Yangon",
    phone: "01-538055",
    lat: 16.8059,
    lng: 96.1472,
    verification_status: "APPROVED",
    created_by: null,
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  },
  {
    id: "hosp-004",
    name: "Pun Hlaing Siloam Hospital",
    name_mya: "ပြည်လှိုင် ဆိုလိုမ် ဆေးရုံ",
    township: "Hlaing Tharyar",
    address: "Hlaing Tharyar Township, Yangon",
    phone: "01-3682106",
    lat: 16.8763,
    lng: 96.0385,
    verification_status: "APPROVED",
    created_by: null,
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  },
  {
    id: "hosp-005",
    name: "Parami Hospital",
    name_mya: "ပါရမီဆေးရုံ",
    township: "Mayangone",
    address: "Mayangone Township, Yangon",
    phone: "01-650422",
    lat: 16.8762,
    lng: 96.1214,
    verification_status: "APPROVED",
    created_by: null,
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  },
  {
    id: "hosp-006",
    name: "No. 2 Military Hospital",
    name_mya: "စစ်တပ်ဆေးရုံ အမှတ် (၂)",
    township: "North Okkalapa",
    address: "North Okkalapa Township, Yangon",
    phone: "01-452062",
    lat: 16.9012,
    lng: 96.1877,
    verification_status: "APPROVED",
    created_by: null,
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  },
];

// ----------------------------------------------------------------------------
// Mock Active Requests (Command Center / Broadcast reference)
// ----------------------------------------------------------------------------
export const MOCK_REQUESTS: RequestWithDetails[] = [
  {
    id: "req-001",
    requester_id: "user-hosp-001",
    hospital_id: "hosp-001",
    request_type: "BLOOD",
    blood_type: "O-",
    supply_details: null,
    units_needed: 3,
    urgency: "CRITICAL",
    status: "OPEN",
    township: "Mingalar Taung Nyunt",
    lat: 16.7789,
    lng: 96.1617,
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    requester: { id: "user-hosp-001", full_name: "Daw Hnin Thida", phone: "01-256112", blood_type: null },
    hospital: { id: "hosp-001", name: "Yangon General Hospital (YGH)", township: "Mingalar Taung Nyunt", phone: "01-256112" },
  },
  {
    id: "req-002",
    requester_id: "user-hosp-003",
    hospital_id: "hosp-003",
    request_type: "BLOOD",
    blood_type: "A+",
    supply_details: null,
    units_needed: 2,
    urgency: "URGENT",
    status: "IN_PROGRESS",
    township: "Bahan",
    lat: 16.8059,
    lng: 96.1472,
    expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    requester: { id: "user-hosp-003", full_name: "U Kyaw Zin", phone: "01-538055", blood_type: null },
    hospital: { id: "hosp-003", name: "Asia Royal Hospital", township: "Bahan", phone: "01-538055" },
  },
  {
    id: "req-003",
    requester_id: "user-hosp-002",
    hospital_id: "hosp-002",
    request_type: "BLOOD",
    blood_type: "B-",
    supply_details: null,
    units_needed: 1,
    urgency: "STANDARD",
    status: "OPEN",
    township: "Sanchaung",
    lat: 16.8155,
    lng: 96.1283,
    expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    requester: { id: "user-hosp-002", full_name: "Ma Thida Oo", phone: "01-527110", blood_type: null },
    hospital: { id: "hosp-002", name: "Thukha Yeik Mon Specialist Hospital", township: "Sanchaung", phone: "01-527110" },
  },
  {
    id: "req-004",
    requester_id: "user-hosp-005",
    hospital_id: "hosp-005",
    request_type: "BLOOD",
    blood_type: "O+",
    supply_details: null,
    units_needed: 4,
    urgency: "CRITICAL",
    status: "FULFILLED",
    township: "Mayangone",
    lat: 16.8762,
    lng: 96.1214,
    expires_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    requester: { id: "user-hosp-005", full_name: "Ko Min Thu", phone: "01-650422", blood_type: null },
    hospital: { id: "hosp-005", name: "Parami Hospital", township: "Mayangone", phone: "01-650422" },
  },
];

// ----------------------------------------------------------------------------
// Mock Active Dispatch (for Donor Passport)
// ----------------------------------------------------------------------------
export const MOCK_ACTIVE_DISPATCH: RequestWithDetails = MOCK_REQUESTS[0];

// ----------------------------------------------------------------------------
// Mock Matches (Donation History)
// ----------------------------------------------------------------------------
export const MOCK_DONATION_HISTORY = [
  {
    id: "match-001",
    date: "2024-03-12",
    type: "Whole Blood",
    hospital: "Yangon General Hospital (YGH)",
    status: "PROCESSED" as const,
  },
  {
    id: "match-002",
    date: "2024-01-04",
    type: "Urgent Response",
    hospital: "Asia Royal Hospital",
    status: "PROCESSED" as const,
  },
  {
    id: "match-003",
    date: "2023-09-22",
    type: "Power Red",
    hospital: "Thukha Yeik Mon Specialist Hospital",
    status: "PROCESSED" as const,
  },
];

// ----------------------------------------------------------------------------
// Mock Blood Inventory (per hospital — no live endpoint yet)
// ----------------------------------------------------------------------------
export type StockLevel = "CRITICAL" | "LOW" | "ADEQUATE";

export interface BloodStock {
  bloodType: string;
  units: number;
  level: StockLevel;
  trend: "up" | "down" | "stable";
}

export const MOCK_BLOOD_INVENTORY: BloodStock[] = [
  { bloodType: "O-", units: 3,  level: "CRITICAL",  trend: "down"   },
  { bloodType: "O+", units: 18, level: "LOW",       trend: "down"   },
  { bloodType: "A+", units: 34, level: "ADEQUATE",  trend: "up"     },
  { bloodType: "A-", units: 9,  level: "LOW",       trend: "stable" },
  { bloodType: "B+", units: 22, level: "ADEQUATE",  trend: "up"     },
  { bloodType: "B-", units: 5,  level: "CRITICAL",  trend: "down"   },
  { bloodType: "AB+",units: 14, level: "ADEQUATE",  trend: "stable" },
  { bloodType: "AB-",units: 4,  level: "LOW",       trend: "down"   },
];

export const MOCK_RECENT_INTAKE = [
  { donor: "Ko Aung Kyaw", bloodType: "O-", time: "18 min ago"  },
  { donor: "Ma Thida Oo",  bloodType: "B+", time: "52 min ago"  },
  { donor: "Walk-in donor",bloodType: "A+", time: "1 hour ago"  },
];

// ----------------------------------------------------------------------------
// Live Feed Events (Command Center)
// ----------------------------------------------------------------------------
export const MOCK_LIVE_FEED = [
  {
    id: "feed-001",
    text: "Ko Min Thu accepted REQ-001 (O−) at Yangon General Hospital.",
    time: "2 min ago",
  },
  {
    id: "feed-002",
    text: "Donation REQ-004 completed successfully at Parami Hospital.",
    time: "15 min ago",
  },
  {
    id: "feed-003",
    text: "New CRITICAL request posted by Asia Royal Hospital (A+).",
    time: "42 min ago",
  },
];
