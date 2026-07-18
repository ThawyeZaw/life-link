-- ============================================================================
-- LifeLink — Matching Functions v2 (privacy-safe, org-aware)
-- Replaces donor matching with township-centroid based lookups (no exact
-- user coordinates, no phone numbers) and adds verified-organisation boost
-- to reverse matching.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Blood compatibility helper (donor -> recipient)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.blood_can_donate(p_donor TEXT, p_recipient TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE p_donor
    WHEN 'O-'  THEN p_recipient IN ('O-','O+','A-','A+','B-','B+','AB-','AB+')
    WHEN 'O+'  THEN p_recipient IN ('O+','A+','B+','AB+')
    WHEN 'A-'  THEN p_recipient IN ('A-','A+','AB-','AB+')
    WHEN 'A+'  THEN p_recipient IN ('A+','AB+')
    WHEN 'B-'  THEN p_recipient IN ('B-','B+','AB-','AB+')
    WHEN 'B+'  THEN p_recipient IN ('B+','AB+')
    WHEN 'AB-' THEN p_recipient IN ('AB-','AB+')
    WHEN 'AB+' THEN p_recipient IN ('AB+')
    ELSE false
  END;
$$;

-- ----------------------------------------------------------------------------
-- 2. find_available_donors — privacy-safe donor candidates
--    Uses township centroids only. Never returns phone or exact coordinates.
--    SECURITY DEFINER because profile RLS no longer exposes donors directly.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.find_available_donors(
  p_blood_type TEXT,
  p_origin_lat DOUBLE PRECISION,
  p_origin_lng DOUBLE PRECISION,
  p_radius_km NUMERIC DEFAULT 100,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  blood_type TEXT,
  township TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  distance_km NUMERIC,
  last_donation_date DATE
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.blood_type,
    p.township,
    t.lat,
    t.lng,
    ROUND((earth_distance(ll_to_earth(t.lat, t.lng), ll_to_earth(p_origin_lat, p_origin_lng)) / 1000)::NUMERIC, 1) AS distance_km,
    p.last_donation_date
  FROM public.profiles p
  JOIN public.townships t ON lower(trim(p.township)) = lower(t.name)
  WHERE p.is_available = true
    AND p.blood_type IS NOT NULL
    AND public.blood_can_donate(p.blood_type, p_blood_type)
    AND earth_distance(ll_to_earth(t.lat, t.lng), ll_to_earth(p_origin_lat, p_origin_lng)) <= (p_radius_km * 1000)
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.find_available_donors(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, NUMERIC, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_available_donors(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, NUMERIC, INTEGER) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 3. find_nearby_matching_requests v2 — org-aware reverse matching
--    Compatible blood types (not just exact), organisation name + verified
--    flag, verified orgs get a score boost.
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.find_nearby_matching_requests(DOUBLE PRECISION, DOUBLE PRECISION, TEXT, NUMERIC);

CREATE OR REPLACE FUNCTION public.find_nearby_matching_requests(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_blood_type TEXT,
  p_radius_km NUMERIC DEFAULT 100
)
RETURNS TABLE(
  request_id UUID,
  hospital_id UUID,
  hospital_name TEXT,
  hospital_township TEXT,
  organization_id UUID,
  org_name TEXT,
  org_verified BOOLEAN,
  blood_type TEXT,
  units_needed INTEGER,
  urgency TEXT,
  distance_km NUMERIC,
  compatibility_score INTEGER,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS request_id,
    r.hospital_id,
    COALESCE(h.name, o.name, 'Unknown Facility') AS hospital_name,
    COALESCE(h.township, o.township, r.township) AS hospital_township,
    r.organization_id,
    o.name AS org_name,
    COALESCE(o.is_verified, false) AS org_verified,
    r.blood_type,
    r.units_needed,
    r.urgency::TEXT,
    ROUND((earth_distance(ll_to_earth(r.lat, r.lng), ll_to_earth(p_lat, p_lng)) / 1000)::NUMERIC, 1) AS distance_km,
    (
      CASE r.urgency
        WHEN 'CRITICAL' THEN 25
        WHEN 'URGENT' THEN 15
        ELSE 5
      END
      + GREATEST(0, 30 - ROUND((earth_distance(ll_to_earth(r.lat, r.lng), ll_to_earth(p_lat, p_lng)) / 1000 * 30 / p_radius_km)::INTEGER))
      + CASE WHEN COALESCE(o.is_verified, false) THEN 15 ELSE 0 END
    )::INTEGER AS compatibility_score,
    r.lat,
    r.lng
  FROM public.requests r
  LEFT JOIN public.hospitals h ON h.id = r.hospital_id
  LEFT JOIN public.organizations o ON o.id = r.organization_id
  WHERE r.request_type = 'BLOOD'
    AND r.status = 'OPEN'
    AND r.blood_type IS NOT NULL
    AND public.blood_can_donate(p_blood_type, r.blood_type)
    AND r.lat IS NOT NULL
    AND r.lng IS NOT NULL
    AND earth_distance(ll_to_earth(r.lat, r.lng), ll_to_earth(p_lat, p_lng)) <= (p_radius_km * 1000)
  ORDER BY compatibility_score DESC, distance_km ASC
  LIMIT 20;
END;
$$;

REVOKE ALL ON FUNCTION public.find_nearby_matching_requests(DOUBLE PRECISION, DOUBLE PRECISION, TEXT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_nearby_matching_requests(DOUBLE PRECISION, DOUBLE PRECISION, TEXT, NUMERIC) TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 4. Retire find_nearby_donors — exposed phone numbers and exact coordinates
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.find_nearby_donors(DOUBLE PRECISION, DOUBLE PRECISION, TEXT, NUMERIC);
