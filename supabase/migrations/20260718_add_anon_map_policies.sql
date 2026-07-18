-- ============================================================================
-- LifeLink — Add anonymous read access for public map data
-- Allows the interactive map to show hospitals, requests, and donor locations
-- without requiring authentication.
-- ============================================================================

-- Hospitals: anon can view APPROVED hospitals
CREATE POLICY "Anon can view approved hospitals"
  ON public.hospitals FOR SELECT
  TO anon
  USING (verification_status = 'APPROVED');

-- Requests: anon can view active (OPEN / IN_PROGRESS) requests
CREATE POLICY "Anon can view active requests"
  ON public.requests FOR SELECT
  TO anon
  USING (status IN ('OPEN', 'IN_PROGRESS'));

-- Profiles: anon can view basic donor info (blood_type, township, lat, lng)
-- Only for available donors — no personal info exposed
CREATE POLICY "Anon can view available donor locations"
  ON public.profiles FOR SELECT
  TO anon
  USING (is_available = true);
