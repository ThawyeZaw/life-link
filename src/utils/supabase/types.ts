// ============================================================================
// LifeLink — Database Types
// Thaw Ye Zaw — Backend / Database Domain
// ============================================================================

/** Blood type enum */
export type BloodType = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

/** Request urgency levels */
export type Urgency = 'CRITICAL' | 'URGENT' | 'STANDARD';

/** Request status workflow */
export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'EXPIRED';

/** Whether a blood or medical supply request */
export type RequestType = 'BLOOD' | 'MEDICAL_SUPPLY';

/** Match status between donor and request */
export type MatchStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';

/** Hospital verification status */
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Notification event types */
export type NotificationType = 'MATCH_FOUND' | 'REQUEST_UPDATE' | 'NEW_REQUEST' | 'CHAT_MESSAGE';

// ----------------------------------------------------------------------------
// Table Row Types
// ----------------------------------------------------------------------------

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  blood_type: BloodType | null;
  township: string | null;
  date_of_birth: string | null;
  weight_kg: number | null;
  medical_conditions: string[];
  last_donation_date: string | null;
  is_available: boolean;
  hide_medical_info: boolean;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
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
  verification_status: VerificationStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  requester_id: string;
  hospital_id: string | null;
  request_type: RequestType;
  blood_type: BloodType | null;
  supply_details: string | null;
  units_needed: number;
  urgency: Urgency;
  status: RequestStatus;
  township: string | null;
  lat: number | null;
  lng: number | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  request_id: string;
  donor_id: string;
  status: MatchStatus;
  distance_km: number | null;
  compatibility_score: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  is_read: boolean;
  related_match_id: string | null;
  related_request_id: string | null;
  created_at: string;
}

// ----------------------------------------------------------------------------
// Composite / Joined Types
// ----------------------------------------------------------------------------

/** Request joined with requester profile and hospital */
export interface RequestWithDetails extends Request {
  requester: Pick<Profile, 'id' | 'full_name' | 'phone' | 'blood_type'>;
  hospital: Pick<Hospital, 'id' | 'name' | 'township' | 'phone'> | null;
}

/** Match joined with donor profile and request */
export interface MatchWithDetails extends Match {
  donor: Pick<Profile, 'id' | 'full_name' | 'phone' | 'blood_type' | 'township'>;
  request: Pick<Request, 'id' | 'blood_type' | 'urgency' | 'status' | 'township' | 'units_needed'>;
}

/** Message with sender profile */
export interface MessageWithSender extends Message {
  sender: Pick<Profile, 'id' | 'full_name'>;
}
