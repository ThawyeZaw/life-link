export type BloodType =
  | "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";

export type AccountType = "individual" | "organization";
export type Urgency = "CRITICAL" | "URGENT" | "STANDARD";
export type RequestStatus =
  | "OPEN" | "MATCHED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "EXPIRED";
export type MatchStatus =
  | "INVITED" | "ACCEPTED" | "CONFIRMED" | "DONATED" | "DECLINED" | "CANCELLED";

export interface Profile {
  id: string;
  account_type: AccountType;
  full_name: string;
  email: string;
  phone: string | null;
  blood_type: BloodType | null;
  township: string | null;
  lat: number | null;
  lng: number | null;
  is_available: boolean;
  last_donation_date: string | null;
  telegram_chat_id: number | null;
}

export interface Hospital {
  id: string;
  name: string;
  name_mya: string | null;
  township: string | null;
  address: string | null;
  phone: string | null;
  lat: number;
  lng: number;
}

export interface Organization {
  id: string;
  name: string;
  org_type: string;
  township: string | null;
  address: string | null;
  phone: string | null;
  invite_code: string;
  owner_id: string;
}

export interface BloodRequest {
  id: string;
  requester_id: string;
  organization_id: string | null;
  hospital_id: string;
  blood_type: BloodType;
  units_needed: number;
  urgency: Urgency;
  patient_name: string | null;
  notes: string | null;
  status: RequestStatus;
  created_at: string;
  hospitals?: Hospital;
}

export interface Match {
  id: string;
  request_id: string;
  donor_id: string;
  status: MatchStatus;
  distance_km: number | null;
  contact_phone: string | null;
  contact_note: string | null;
  invited_at: string;
  responded_at: string | null;
}

export interface DonorCandidate {
  donor_id: string;
  display_name: string;
  blood_type: BloodType;
  township: string | null;
  distance_km: number;
  already_invited: boolean;
}
