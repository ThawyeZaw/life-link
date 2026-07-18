-- ============================================================================
-- LifeLink — Migration 00006: Donor Matching Function + Notification Triggers
-- Thaw Ye Zaw — Backend / Database Domain
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Re-insert the 6 specialist/private hospitals lost when 00005
--    did DELETE FROM public.hospitals (only MIMU dataset hospitals were re-inserted)
-- ----------------------------------------------------------------------------
INSERT INTO public.hospitals (name, name_mya, township, address, phone, lat, lng, verification_status)
SELECT * FROM (VALUES
  ('Yangon General Hospital (YGH)', 'ရန်ကုန်ပြည်သူ့ဆေးရုံကြီး', 'Mingalar Taung Nyunt', 'Yangon, Yangon (West) District', '01-256112', 16.7789, 96.1617, 'APPROVED'),
  ('Thukha Yeik Mon Specialist Hospital', 'သုခရိပ်မြုံအထူးကုဆေးရုံ', 'Sanchaung', 'Yangon, Yangon (West) District', '01-512345', 16.8147, 96.1345, 'APPROVED'),
  ('Asia Royal Hospital', 'အာရှတော်ဝင်ဆေးရုံ', 'Bahan', 'Yangon, Yangon (West) District', '01-558266', 16.8102, 96.1631, 'APPROVED'),
  ('Pun Hlaing Siloam Hospital', 'ပန်းလှိုင်ဆီလွမ်ဆေးရုံ', 'Hlaing Tharyar', 'Yangon, Yangon (North) District', '01-685678', 16.8456, 96.0889, 'APPROVED'),
  ('Parami Hospital', 'ပါရမီဆေးရုံ', 'Mayangone', 'Yangon, Yangon (West) District', '01-657777', 16.8478, 96.1175, 'APPROVED'),
  ('No. 2 Military Hospital', 'အမှတ်(၂)စစ်ဆေးရုံ', 'North Okkalapa', 'Yangon, Yangon (East) District', '01-620345', 16.8790, 96.1645, 'APPROVED')
) AS t(name, name_mya, township, address, phone, lat, lng, verification_status)
WHERE NOT EXISTS (
  SELECT 1 FROM public.hospitals h WHERE h.name = t.name AND h.township = t.township
);

-- ----------------------------------------------------------------------------
-- 1. find_nearby_donors — Fallback donor proximity search
-- Used by the /api/match-donors API route until the Python matching engine
-- is deployed. Returns available donors within radius, ordered by distance.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.find_nearby_donors(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_blood_type TEXT,
  p_radius_km NUMERIC DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  phone TEXT,
  blood_type TEXT,
  township TEXT,
  distance_km NUMERIC,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.phone,
    p.blood_type,
    p.township,
    ROUND((earth_distance(ll_to_earth(p.lat, p.lng), ll_to_earth(p_lat, p_lng)) / 1000)::NUMERIC, 1) AS distance_km,
    p.lat,
    p.lng
  FROM public.profiles p
  WHERE p.is_available = true
    AND p.blood_type = p_blood_type
    AND p.lat IS NOT NULL
    AND p.lng IS NOT NULL
    AND earth_distance(ll_to_earth(p.lat, p.lng), ll_to_earth(p_lat, p_lng)) <= (p_radius_km * 1000)
  ORDER BY distance_km ASC;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Auto-notify donors when a new match is created
-- Inserts a 'MATCH_FOUND' notification for the matched donor
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_donor_on_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request RECORD;
  v_hospital_name TEXT;
BEGIN
  -- Get request details for the notification body
  SELECT r.blood_type, r.urgency, r.hospital_id, r.township INTO v_request
  FROM public.requests r
  WHERE r.id = NEW.request_id;

  -- Get hospital name if linked
  SELECT h.name INTO v_hospital_name
  FROM public.hospitals h
  WHERE h.id = v_request.hospital_id;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    related_match_id,
    related_request_id
  ) VALUES (
    NEW.donor_id,
    'MATCH_FOUND',
    'New Donation Match Found',
    format(
      'You have been matched to a %s %s request in %s.%s',
      v_request.urgency,
      COALESCE(v_request.blood_type, 'medical supply'),
      COALESCE(v_request.township, 'nearby area'),
      CASE
        WHEN v_hospital_name IS NOT NULL THEN ' Hospital: ' || v_hospital_name || '.'
        ELSE ''
      END
    ),
    NEW.id,
    NEW.request_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_donor_on_match ON public.matches;
CREATE TRIGGER trg_notify_donor_on_match
  AFTER INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_donor_on_match();

-- ----------------------------------------------------------------------------
-- 3. Auto-notify requester when their request status changes
-- Inserts a 'REQUEST_UPDATE' notification for the requester
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_requester_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only fire when status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    related_request_id
  ) VALUES (
    NEW.requester_id,
    'REQUEST_UPDATE',
    CASE NEW.status
      WHEN 'IN_PROGRESS' THEN 'Request In Progress'
      WHEN 'FULFILLED' THEN 'Request Fulfilled'
      WHEN 'EXPIRED' THEN 'Request Expired'
      ELSE 'Request Updated'
    END,
    format(
      'Your %s request (#%s) is now %s.',
      COALESCE(NEW.blood_type, 'Medical Supply'),
      substring(NEW.id::TEXT, 1, 8),
      CASE NEW.status
        WHEN 'IN_PROGRESS' THEN 'being processed'
        WHEN 'FULFILLED' THEN 'fulfilled'
        WHEN 'EXPIRED' THEN 'expired'
        ELSE LOWER(NEW.status)
      END
    ),
    NEW.id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_requester_status ON public.requests;
CREATE TRIGGER trg_notify_requester_status
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_requester_on_status_change();

-- ----------------------------------------------------------------------------
-- 4. Auto-notify donors when a new request matching their blood type is created
-- Useful for opt-in "alert me" feature for available donors
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_available_donors_on_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only notify for urgent/critical blood requests
  IF NEW.request_type != 'BLOOD' THEN
    RETURN NEW;
  END IF;

  IF NEW.urgency NOT IN ('CRITICAL', 'URGENT') THEN
    RETURN NEW;
  END IF;

  -- Notify available donors with matching blood type in the same township (if provided)
  -- Limit to avoid excessive notifications
  INSERT INTO public.notifications (user_id, type, title, body, related_request_id)
  SELECT
    p.id,
    'NEW_REQUEST'::TEXT,
    format('%s Blood Needed', NEW.urgency),
    format(
      'A %s %s request was just posted in %s.',
      LOWER(NEW.urgency),
      NEW.blood_type,
      COALESCE(NEW.township, 'your area')
    ),
    NEW.id
  FROM public.profiles p
  WHERE p.is_available = true
    AND p.blood_type = NEW.blood_type
    AND p.id != NEW.requester_id
    AND (
      NEW.township IS NULL
      OR p.township IS NULL
      OR p.township = NEW.township
    )
  LIMIT 20;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_donors_on_request ON public.requests;
CREATE TRIGGER trg_notify_donors_on_request
  AFTER INSERT ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_available_donors_on_request();
