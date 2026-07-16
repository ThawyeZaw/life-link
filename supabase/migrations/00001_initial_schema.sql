-- ============================================================================
-- Vertex Red — Initial Database Schema
-- Thaw Ye Zaw — Backend / Database Domain
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES — extends auth.users with donor/requester details
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  blood_type TEXT CHECK (blood_type IN ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-')),
  township TEXT,
  date_of_birth DATE,
  weight_kg NUMERIC(4,1),
  medical_conditions TEXT[] DEFAULT '{}',
  last_donation_date DATE,
  is_available BOOLEAN DEFAULT false,
  hide_medical_info BOOLEAN DEFAULT false,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read basic profile info for donor matching
-- But sensitive fields (medical_conditions, weight_kg, date_of_birth)
-- are hidden via the public_profiles view when hide_medical_info = true
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ----------------------------------------------------------------------------
-- Privacy-aware view: masks sensitive data when hide_medical_info is true
-- Other users see NULL for medical_conditions, weight_kg, date_of_birth
-- The profile owner always sees their full data via the base table
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  phone,
  blood_type,
  township,
  CASE WHEN hide_medical_info = true AND id != auth.uid() THEN NULL ELSE date_of_birth END AS date_of_birth,
  CASE WHEN hide_medical_info = true AND id != auth.uid() THEN NULL ELSE weight_kg END AS weight_kg,
  CASE WHEN hide_medical_info = true AND id != auth.uid() THEN '{}'::TEXT[] ELSE medical_conditions END AS medical_conditions,
  last_donation_date,
  is_available,
  hide_medical_info,
  lat,
  lng,
  created_at,
  updated_at
FROM public.profiles;

-- Trigger to auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. HOSPITALS — verified medical facilities
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  township TEXT,
  address TEXT,
  phone TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  verification_status TEXT DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Everyone can view APPROVED hospitals + their own regardless of status
CREATE POLICY "Anyone can view approved or own hospitals"
  ON public.hospitals FOR SELECT
  TO authenticated
  USING (verification_status = 'APPROVED' OR created_by = auth.uid());

-- Authenticated users can submit new hospitals
CREATE POLICY "Authenticated users can submit hospitals"
  ON public.hospitals FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Users can update their own non-approved hospitals
CREATE POLICY "Users can update own pending hospitals"
  ON public.hospitals FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() AND verification_status = 'PENDING')
  WITH CHECK (created_by = auth.uid() AND verification_status = 'PENDING');

-- ----------------------------------------------------------------------------
-- 3. REQUESTS — blood & medical supply emergency requests
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('BLOOD', 'MEDICAL_SUPPLY')),
  blood_type TEXT CHECK (blood_type IN ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-')),
  supply_details TEXT,
  units_needed INTEGER DEFAULT 1 CHECK (units_needed > 0),
  urgency TEXT NOT NULL DEFAULT 'STANDARD' CHECK (urgency IN ('CRITICAL', 'URGENT', 'STANDARD')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'FULFILLED', 'EXPIRED')),
  township TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active requests
CREATE POLICY "Authenticated users can view all requests"
  ON public.requests FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create requests as themselves
CREATE POLICY "Authenticated users can create requests"
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

-- Requester can update their own requests
CREATE POLICY "Requester can update own requests"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (requester_id = auth.uid())
  WITH CHECK (requester_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4. MATCHES — donor-to-request matching records
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED')),
  distance_km NUMERIC(5,1),
  compatibility_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Donor sees their own matches
CREATE POLICY "Donor can view own matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

-- Requester sees matches for their requests
CREATE POLICY "Requester can view matches for their requests"
  ON public.matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_id AND r.requester_id = auth.uid()
    )
  );

-- Authenticated users can create matches (Python engine via API route)
CREATE POLICY "Authenticated users can create matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Donor can update their own match status (accept/decline)
CREATE POLICY "Donor can update own matches"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (donor_id = auth.uid())
  WITH CHECK (donor_id = auth.uid());

-- Requester can also update match status on their requests (e.g. mark COMPLETED)
CREATE POLICY "Requester can update matches for their requests"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_id AND r.requester_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_id AND r.requester_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 5. MESSAGES — in-app chat between matched parties
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Participants (donor + requester) can read messages in their match
CREATE POLICY "Participants can view match messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.requests r ON r.id = m.request_id
      WHERE m.id = match_id
        AND (m.donor_id = auth.uid() OR r.requester_id = auth.uid())
    )
  );

-- Participants can send messages in their match
CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.matches m
      JOIN public.requests r ON r.id = m.request_id
      WHERE m.id = match_id
        AND (m.donor_id = auth.uid() OR r.requester_id = auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- 6. NOTIFICATIONS — in-app alert system
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MATCH_FOUND', 'REQUEST_UPDATE', 'NEW_REQUEST', 'CHAT_MESSAGE')),
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  related_match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  related_request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users see only their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System / API can insert notifications for any user
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 7. INDEXES — performance optimization
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_blood_type ON public.profiles(blood_type);
CREATE INDEX IF NOT EXISTS idx_profiles_township ON public.profiles(township);
CREATE INDEX IF NOT EXISTS idx_profiles_is_available ON public.profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_hospitals_verification ON public.hospitals(verification_status);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_urgency ON public.requests(urgency);
CREATE INDEX IF NOT EXISTS idx_requests_blood_type ON public.requests(blood_type);
CREATE INDEX IF NOT EXISTS idx_requests_expires_at ON public.requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_matches_request_id ON public.matches(request_id);
CREATE INDEX IF NOT EXISTS idx_matches_donor_id ON public.matches(donor_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Enable the earthdistance extension for proximity calculations
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;

-- Spatial indexes for proximity queries (matching engine)
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING gist (ll_to_earth(lat, lng));
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON public.hospitals USING gist (ll_to_earth(lat, lng));
CREATE INDEX IF NOT EXISTS idx_requests_location ON public.requests USING gist (ll_to_earth(lat, lng));

-- ----------------------------------------------------------------------------
-- 8. REAL-TIME — enable supabase real-time for live-updating tables
-- ----------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ----------------------------------------------------------------------------
-- 9. UPDATED_AT TRIGGERS — auto-update timestamps
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER trg_hospitals_updated_at
  BEFORE UPDATE ON public.hospitals
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
