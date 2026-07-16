// ============================================================================
// Vertex Red — Supabase Query Helpers
// Thaw Ye Zaw — Backend / Database Domain
//
// ⚠️ CROSS-BOUNDARY: These queries will be consumed by components in
// Thinzar's domain (/app/, /components/). Keep return types consistent.
// ============================================================================

import { createClient } from './client';
import type {
  Profile,
  Hospital,
  Request,
  RequestWithDetails,
  Match,
  MatchWithDetails,
  Message,
  MessageWithSender,
  Notification,
  BloodType,
  Urgency,
} from './types';

// ----------------------------------------------------------------------------
// Profiles
// ----------------------------------------------------------------------------

/** Fetch the currently authenticated user's profile */
export const getMyProfile = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data as Profile;
};

/** Update the current user's profile */
export const updateMyProfile = async (updates: Partial<Profile>) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
};

/**
 * Get available donors by blood type (for matching engine / map).
 * Uses public_profiles view — automatically masks medical_conditions,
 * weight_kg, and date_of_birth for users who set hide_medical_info = true.
 */
export const getAvailableDonors = async (bloodType?: BloodType) => {
  const supabase = createClient();
  let query = supabase
    .from('public_profiles')
    .select('*')
    .eq('is_available', true)
    .not('blood_type', 'is', null);

  if (bloodType) {
    query = query.eq('blood_type', bloodType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Profile[];
};

// ----------------------------------------------------------------------------
// Hospitals
// ----------------------------------------------------------------------------

/** Get all approved hospitals */
export const getApprovedHospitals = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('verification_status', 'APPROVED')
    .order('name');

  if (error) throw error;
  return data as Hospital[];
};

/** Submit a new hospital for verification */
export const submitHospital = async (
  hospital: Omit<Hospital, 'id' | 'verification_status' | 'created_by' | 'created_at' | 'updated_at'>
) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('hospitals')
    .insert({ ...hospital, created_by: user.id, verification_status: 'PENDING' })
    .select()
    .single();

  if (error) throw error;
  return data as Hospital;
};

// ----------------------------------------------------------------------------
// Requests
// ----------------------------------------------------------------------------

/** Get all active (non-expired, non-fulfilled) requests with details */
export const getActiveRequests = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      requester:requester_id(id, full_name, phone, blood_type),
      hospital:hospital_id(id, name, township, phone)
    `)
    .in('status', ['OPEN', 'IN_PROGRESS'])
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as RequestWithDetails[];
};

/** Get requests filtered by urgency */
export const getRequestsByUrgency = async (urgency: Urgency) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      requester:requester_id(id, full_name, phone, blood_type),
      hospital:hospital_id(id, name, township, phone)
    `)
    .eq('urgency', urgency)
    .in('status', ['OPEN', 'IN_PROGRESS'])
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as RequestWithDetails[];
};

/** Create a new blood or medical supply request */
export const createRequest = async (
  req: Omit<Request, 'id' | 'requester_id' | 'status' | 'created_at' | 'updated_at'>
) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('requests')
    .insert({ ...req, requester_id: user.id, status: 'OPEN' })
    .select()
    .single();

  if (error) throw error;
  return data as Request;
};

/** Update request status (requester only) */
export const updateRequestStatus = async (requestId: string, status: Request['status']) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data as Request;
};

// ----------------------------------------------------------------------------
// Matches
// ----------------------------------------------------------------------------

/** Get matches for the current user (as donor or requester) */
export const getMyMatches = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Matches where user is the donor
  const { data: donorMatches, error: donorError } = await supabase
    .from('matches')
    .select(`
      *,
      donor:donor_id(id, full_name, phone, blood_type, township),
      request:request_id(id, blood_type, urgency, status, township, units_needed)
    `)
    .eq('donor_id', user.id)
    .order('created_at', { ascending: false });

  if (donorError) throw donorError;

  // Matches for requests the user created
  const { data: requesterMatches, error: reqError } = await supabase
    .from('matches')
    .select(`
      *,
      donor:donor_id(id, full_name, phone, blood_type, township),
      request:request_id!inner(id, blood_type, urgency, status, township, units_needed)
    `)
    .eq('request.requester_id', user.id)
    .order('created_at', { ascending: false });

  if (reqError) throw reqError;

  return [...(donorMatches || []), ...(requesterMatches || [])] as unknown as MatchWithDetails[];
};

/** Update match status (donor accepts/declines) */
export const updateMatchStatus = async (matchId: string, status: Match['status']) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', matchId)
    .select()
    .single();

  if (error) throw error;
  return data as Match;
};

// ----------------------------------------------------------------------------
// Messages
// ----------------------------------------------------------------------------

/** Get messages for a match with sender profiles */
export const getMatchMessages = async (matchId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(id, full_name)
    `)
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as unknown as MessageWithSender[];
};

/** Send a message in a match conversation */
export const sendMessage = async (matchId: string, content: string) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: user.id, content })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
};

// ----------------------------------------------------------------------------
// Notifications
// ----------------------------------------------------------------------------

/** Get the current user's notifications */
export const getMyNotifications = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data as Notification[];
};

/** Mark a notification as read */
export const markNotificationRead = async (notificationId: string) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

// ----------------------------------------------------------------------------
// Real-time Subscriptions (client-side)
// ----------------------------------------------------------------------------

/** Subscribe to real-time request updates */
export const subscribeToRequests = (
  onInsert: (req: Request) => void,
  onUpdate: (req: Request) => void
) => {
  const supabase = createClient();
  return supabase
    .channel('requests-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'requests' },
      (payload) => onInsert(payload.new as Request)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'requests' },
      (payload) => onUpdate(payload.new as Request)
    )
    .subscribe();
};

/** Subscribe to real-time messages for a specific match */
export const subscribeToMessages = (
  matchId: string,
  onInsert: (msg: Message) => void
) => {
  const supabase = createClient();
  return supabase
    .channel(`messages-${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => onInsert(payload.new as Message)
    )
    .subscribe();
};

/** Subscribe to notifications for the current user */
export const subscribeToNotifications = (
  userId: string,
  onInsert: (notif: Notification) => void
) => {
  const supabase = createClient();
  return supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onInsert(payload.new as Notification)
    )
    .subscribe();
};
