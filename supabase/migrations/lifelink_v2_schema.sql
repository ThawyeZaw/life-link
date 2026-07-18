-- ============================================================================
-- LifeLink v2 — Full schema reset (explicitly approved: "override db init")
-- Keeps: public.hospitals (data), public.townships (data)
-- Drops & recreates: profiles, organizations, organization_members,
--                    requests, matches (+ removes old messages/notifications)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Drop old triggers / functions / tables
-- ----------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;

do $$
declare fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and not exists (
        select 1 from pg_depend d
        where d.objid = p.oid and d.deptype = 'e'
      )
  loop
    execute 'drop function if exists ' || fn.sig || ' cascade';
  end loop;
end $$;

drop table if exists public.messages cascade;
drop table if exists public.notifications cascade;
drop table if exists public.matches cascade;
drop table if exists public.requests cascade;
drop table if exists public.organization_members cascade;
drop table if exists public.organizations cascade;
drop table if exists public.profiles cascade;

-- Clean out all old auth users (demo/test accounts from v1)
update public.hospitals set created_by = null where created_by is not null;
delete from auth.users;

-- ----------------------------------------------------------------------------
-- 2. New tables
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  account_type text not null default 'individual'
    check (account_type in ('individual','organization')),
  full_name text not null,
  email text not null,
  phone text,
  blood_type text
    check (blood_type in ('O+','O-','A+','A-','B+','B-','AB+','AB-')),
  township text,
  -- Exact coordinates: stored for matching only, NEVER exposed to other users
  lat double precision,
  lng double precision,
  is_available boolean not null default true,
  last_donation_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_type text not null default 'community'
    check (org_type in ('hospital','ngo','blood_bank','community','other')),
  township text,
  address text,
  phone text,
  invite_code text not null unique
    default upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8)),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin','member')),
  joined_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  hospital_id uuid not null references public.hospitals(id),
  blood_type text not null
    check (blood_type in ('O+','O-','A+','A-','B+','B-','AB+','AB-')),
  units_needed int not null default 1 check (units_needed > 0),
  urgency text not null default 'URGENT'
    check (urgency in ('CRITICAL','URGENT','STANDARD')),
  patient_name text,
  notes text,
  status text not null default 'OPEN'
    check (status in ('OPEN','MATCHED','CONFIRMED','COMPLETED','CANCELLED','EXPIRED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '72 hours'
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  donor_id uuid not null references public.profiles(id) on delete cascade,
  -- Secret token used in the email accept/decline link
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'INVITED'
    check (status in ('INVITED','ACCEPTED','CONFIRMED','DONATED','DECLINED','CANCELLED')),
  distance_km numeric,
  -- Contact details the donor consents to share when accepting
  contact_phone text,
  contact_note text,
  invited_at timestamptz not null default now(),
  responded_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (request_id, donor_id)
);

create index requests_status_idx on public.requests (status);
create index requests_requester_idx on public.requests (requester_id);
create index matches_request_idx on public.matches (request_id);
create index matches_donor_idx on public.matches (donor_id);
create index profiles_matching_idx on public.profiles (blood_type, is_available)
  where account_type = 'individual';

-- ----------------------------------------------------------------------------
-- 3. Functions
-- ----------------------------------------------------------------------------
create or replace function public.haversine_km(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision
language sql immutable as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

-- Can donor blood type be given to recipient blood type?
create or replace function public.blood_compatible(p_donor text, p_recipient text)
returns boolean
language sql immutable as $$
  select case p_recipient
    when 'O-'  then p_donor = 'O-'
    when 'O+'  then p_donor in ('O-','O+')
    when 'A-'  then p_donor in ('O-','A-')
    when 'A+'  then p_donor in ('O-','O+','A-','A+')
    when 'B-'  then p_donor in ('O-','B-')
    when 'B+'  then p_donor in ('O-','O+','B-','B+')
    when 'AB-' then p_donor in ('O-','A-','B-','AB-')
    when 'AB+' then true
    else false
  end;
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger requests_updated_at before update on public.requests
  for each row execute function public.set_updated_at();
create trigger matches_updated_at before update on public.matches
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup (metadata comes from the signup form)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles
    (id, full_name, email, phone, account_type, blood_type, township, lat, lng)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name',''), 'LifeLink User'),
    new.email,
    nullif(new.raw_user_meta_data->>'phone',''),
    coalesce(nullif(new.raw_user_meta_data->>'account_type',''), 'individual'),
    nullif(new.raw_user_meta_data->>'blood_type',''),
    nullif(new.raw_user_meta_data->>'township',''),
    nullif(new.raw_user_meta_data->>'lat','')::double precision,
    nullif(new.raw_user_meta_data->>'lng','')::double precision
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Radar search: privacy-safe donor candidates for a request.
-- Distance is computed from the request's HOSPITAL (never the patient's home).
-- Returns only: first name, blood type, township, rounded distance.
create or replace function public.find_nearby_donors(
  p_request_id uuid,
  p_radius_km double precision default 15
)
returns table (
  donor_id uuid,
  display_name text,
  blood_type text,
  township text,
  distance_km numeric,
  already_invited boolean
)
language sql stable security definer set search_path = public as $$
  select
    p.id,
    split_part(p.full_name, ' ', 1) || ' ' || coalesce(split_part(p.full_name, ' ', 2), ''),
    p.blood_type,
    p.township,
    round(haversine_km(h.lat, h.lng, p.lat, p.lng)::numeric, 1),
    exists (select 1 from matches m where m.request_id = r.id and m.donor_id = p.id)
  from requests r
  join hospitals h on h.id = r.hospital_id
  join profiles p
    on p.account_type = 'individual'
   and p.id <> r.requester_id
   and p.is_available
   and p.blood_type is not null
   and p.lat is not null and p.lng is not null
   and blood_compatible(p.blood_type, r.blood_type)
   and (p.last_donation_date is null
        or p.last_donation_date <= current_date - 90)
   and haversine_km(h.lat, h.lng, p.lat, p.lng) <= p_radius_km
  where r.id = p_request_id
  order by haversine_km(h.lat, h.lng, p.lat, p.lng) asc
  limit 50;
$$;

revoke execute on function public.find_nearby_donors(uuid, double precision) from anon;

-- ----------------------------------------------------------------------------
-- 4. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.requests enable row level security;
alter table public.matches enable row level security;
alter table public.hospitals enable row level security;
alter table public.townships enable row level security;

-- Reset any leftover policies on kept tables
do $$
declare pol record;
begin
  for pol in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('hospitals','townships')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

create policy "hospitals_public_read" on public.hospitals
  for select using (true);
create policy "townships_public_read" on public.townships
  for select using (true);

-- Profiles: strictly own-row only (privacy)
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Organizations: visible to owner + members
create policy "orgs_read_member" on public.organizations
  for select using (
    owner_id = auth.uid()
    or exists (select 1 from public.organization_members m
               where m.org_id = id and m.user_id = auth.uid())
  );
create policy "orgs_update_owner" on public.organizations
  for update using (owner_id = auth.uid());

-- Membership rows: user sees own memberships
create policy "org_members_read_own" on public.organization_members
  for select using (user_id = auth.uid());

-- Requests: open ones are public (map browse); own + org ones fully visible
create policy "requests_read_public_open" on public.requests
  for select using (status in ('OPEN','MATCHED'));
create policy "requests_read_own" on public.requests
  for select using (requester_id = auth.uid());
create policy "requests_read_org" on public.requests
  for select using (
    organization_id is not null
    and exists (select 1 from public.organization_members m
                where m.org_id = organization_id and m.user_id = auth.uid())
  );
create policy "requests_insert_own" on public.requests
  for insert with check (requester_id = auth.uid());
create policy "requests_update_own" on public.requests
  for update using (requester_id = auth.uid());

-- Matches: donor sees own invitations; requester sees matches on own requests.
-- All writes go through server API (service role) so status flow is enforced.
create policy "matches_read_donor" on public.matches
  for select using (donor_id = auth.uid());
create policy "matches_read_requester" on public.matches
  for select using (
    exists (select 1 from public.requests r
            where r.id = request_id and r.requester_id = auth.uid())
  );
