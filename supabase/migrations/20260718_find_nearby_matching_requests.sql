-- ============================================================================
-- LifeLink — Migration: Reverse donor-to-request matching RPC
-- Thaw Ye Zaw — Backend / Database Domain
-- ============================================================================

-- ----------------------------------------------------------------------------
-- find_nearby_matching_requests — Reverse fallback: find hospitals with
-- active blood requests compatible with a donor's blood type.
-- Used by /api/match-requests when Python engine is unreachable.
-- ----------------------------------------------------------------------------
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
  blood_type TEXT,
  units_needed INTEGER,
  urgency TEXT,
  distance_km NUMERIC,
  compatibility_score INTEGER,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS request_id,
    r.hospital_id,
    h.name AS hospital_name,
    h.township AS hospital_township,
    r.blood_type,
    r.units_needed,
    r.urgency::TEXT,
    ROUND((earth_distance(ll_to_earth(r.lat, r.lng), ll_to_earth(p_lat, p_lng)) / 1000)::NUMERIC, 1) AS distance_km,
    -- Simple scoring: urgency weight + distance weight
    (
      CASE r.urgency
        WHEN 'CRITICAL' THEN 25
        WHEN 'URGENT' THEN 15
        ELSE 5
      END
      + GREATEST(0, 30 - ROUND((earth_distance(ll_to_earth(r.lat, r.lng), ll_to_earth(p_lat, p_lng)) / 1000 * 30 / p_radius_km)::INTEGER))
    )::INTEGER AS compatibility_score,
    r.lat,
    r.lng
  FROM public.requests r
  JOIN public.hospitals h ON h.id = r.hospital_id
  WHERE r.request_type = 'BLOOD'
    AND r.status = 'OPEN'
    AND r.blood_type = p_blood_type
    AND r.lat IS NOT NULL
    AND r.lng IS NOT NULL
    AND earth_distance(ll_to_earth(r.lat, r.lng), ll_to_earth(p_lat, p_lng)) <= (p_radius_km * 1000)
  ORDER BY compatibility_score DESC, distance_km ASC
  LIMIT 20;
END;
$$;
