-- ============================================================================
-- LifeLink v2 — Display helper functions (privacy-gated reads)
-- ============================================================================

-- Matches of a request, for the requester / org members.
-- Donor full name + contact only revealed AFTER the donor accepts.
create or replace function public.get_request_matches(p_request_id uuid)
returns table (
  id uuid,
  request_id uuid,
  status text,
  distance_km numeric,
  donor_name text,
  donor_blood_type text,
  donor_township text,
  contact_phone text,
  contact_note text,
  invited_at timestamptz,
  responded_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select
    m.id, m.request_id, m.status, m.distance_km,
    case when m.status in ('ACCEPTED','CONFIRMED','DONATED')
         then p.full_name
         else split_part(p.full_name, ' ', 1) end,
    p.blood_type,
    p.township,
    case when m.status in ('ACCEPTED','CONFIRMED','DONATED') then m.contact_phone end,
    case when m.status in ('ACCEPTED','CONFIRMED','DONATED') then m.contact_note end,
    m.invited_at, m.responded_at
  from matches m
  join profiles p on p.id = m.donor_id
  join requests r on r.id = m.request_id
  where m.request_id = p_request_id
    and (
      r.requester_id = auth.uid()
      or (r.organization_id is not null and exists (
            select 1 from organization_members om
            where om.org_id = r.organization_id and om.user_id = auth.uid()))
    )
  order by (m.status in ('ACCEPTED','CONFIRMED')) desc, m.invited_at asc;
$$;

revoke execute on function public.get_request_matches(uuid) from anon;

-- A donor's own invitations (with request + hospital context and the
-- response token so the dashboard can deep-link to the accept page).
create or replace function public.get_my_invitations()
returns table (
  match_id uuid,
  token uuid,
  match_status text,
  distance_km numeric,
  invited_at timestamptz,
  blood_type text,
  units_needed int,
  urgency text,
  request_status text,
  hospital_name text,
  hospital_township text
)
language sql stable security definer set search_path = public as $$
  select m.id, m.token, m.status, m.distance_km, m.invited_at,
         r.blood_type, r.units_needed, r.urgency, r.status,
         h.name, h.township
  from matches m
  join requests r on r.id = m.request_id
  join hospitals h on h.id = r.hospital_id
  where m.donor_id = auth.uid()
  order by m.invited_at desc;
$$;

revoke execute on function public.get_my_invitations() from anon;
