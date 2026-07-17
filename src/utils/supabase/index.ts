// ============================================================================
// Vertex Red — Supabase Barrel Export
// Thaw Ye Zaw — Backend / Database Domain
//
// ⚠️ CROSS-BOUNDARY: Frontend AI agents should import from this file ONLY.
//    It exposes everything Thinzar's domain needs to build the UI.
//
// Usage:
//   import { getActiveRequests, type RequestWithDetails } from '@/utils/supabase';
// ============================================================================

// ----------------------------------------------------------------------------
// Client Creators
// ----------------------------------------------------------------------------
// NOTE: Only the browser client is exported here. The server client
// (./server) uses `next/headers` and must be imported directly from
// '@/utils/supabase/server' in Server Components / API routes only.
// Same for the middleware client ('@/utils/supabase/middleware').
export { createClient as createBrowserClient } from './client';

// ----------------------------------------------------------------------------
// All Database Types
// ----------------------------------------------------------------------------
import type {
  BloodType,
  Urgency,
  RequestStatus,
  RequestType,
  MatchStatus,
  VerificationStatus,
  NotificationType,
  Profile,
  Hospital,
  Request,
  Match,
  Message,
  Notification,
  RequestWithDetails,
  MatchWithDetails,
  MessageWithSender,
} from './types';

export type {
  BloodType,
  Urgency,
  RequestStatus,
  RequestType,
  MatchStatus,
  VerificationStatus,
  NotificationType,
  Profile,
  Hospital,
  Request,
  Match,
  Message,
  Notification,
  RequestWithDetails,
  MatchWithDetails,
  MessageWithSender,
};

// ----------------------------------------------------------------------------
// Query Helpers (client-side safe)
// ----------------------------------------------------------------------------
export {
  // Profiles
  getMyProfile,
  updateMyProfile,
  getAvailableDonors,
  // Hospitals
  getApprovedHospitals,
  submitHospital,
  // Requests
  getActiveRequests,
  getRequestsByUrgency,
  createRequest,
  updateRequestStatus,
  // Matches
  getMyMatches,
  updateMatchStatus,
  // Messages
  getMatchMessages,
  sendMessage,
  // Notifications
  getMyNotifications,
  markNotificationRead,
  // Real-time Subscriptions
  subscribeToRequests,
  subscribeToMessages,
  subscribeToNotifications,
} from './queries';

// ============================================================================
// API Route Contracts — Request / Response shapes for every endpoint
// ============================================================================

// ----------------------------------------------------------------------------
// GET /api/hospitals
// ----------------------------------------------------------------------------
/** Response from GET /api/hospitals */
export interface HospitalsApiResponse {
  hospitals: Hospital[];
}

// ----------------------------------------------------------------------------
// POST /api/match-donors
// ----------------------------------------------------------------------------
/** Request body for POST /api/match-donors */
export interface MatchDonorsRequest {
  requestId: string;
  bloodType: BloodType;
  location: {
    lat: number;
    lng: number;
  };
  urgency?: Urgency;
  township?: string;
}

/** Single donor result from matching */
export interface MatchDonorResult {
  id: string;
  full_name: string;
  phone: string | null;
  blood_type: BloodType;
  township: string | null;
  distance_km: number;
  compatibility_score: number;
  lat: number | null;
  lng: number | null;
  last_donation_date: string | null;
  match_reason: string | null;
}

/** Response from POST /api/match-donors */
export interface MatchDonorsResponse {
  donors: MatchDonorResult[];
  total_scored: number;
  total_filtered: number;
  message?: string;
}

// ----------------------------------------------------------------------------
// GET /api/profile
// ----------------------------------------------------------------------------
/** Response from GET /api/profile */
export interface ProfileApiResponse {
  profile: Profile;
}

// ----------------------------------------------------------------------------
// PUT /api/profile
// ----------------------------------------------------------------------------
/** Request body for PUT /api/profile */
export type UpdateProfileRequest = Partial<
  Omit<Profile, 'id' | 'created_at' | 'updated_at'>
>;

/** Response from PUT /api/profile */
export type UpdateProfileResponse = ProfileApiResponse;

// ----------------------------------------------------------------------------
// GET /api/requests
// ----------------------------------------------------------------------------
/** Response from GET /api/requests */
export interface RequestsApiResponse {
  requests: RequestWithDetails[];
}

// ----------------------------------------------------------------------------
// POST /api/requests
// ----------------------------------------------------------------------------
/** Request body for POST /api/requests */
export interface CreateRequestRequest {
  requestType: RequestType;
  bloodType?: BloodType;
  supplyDetails?: string;
  unitsNeeded?: number;
  urgency?: Urgency;
  township?: string;
  lat?: number;
  lng?: number;
  hospitalId?: string;
  expiresAt?: string;
}

/** Response from POST /api/requests */
export interface CreateRequestResponse {
  request: Request;
}

// ----------------------------------------------------------------------------
// API Error Response (all endpoints)
// ----------------------------------------------------------------------------
export interface ApiErrorResponse {
  error: string;
}

/** Type helper: union of success + error for each endpoint */
export type ApiResult<T> = T | ApiErrorResponse;
