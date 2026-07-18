-- ============================================================================
-- LifeLink — Accounts & Organisations Foundation
-- Adds: account_type on profiles, townships (centroids), organizations,
-- organization_members, invite-code joining, privacy-tightened profile RLS,
-- donor contact reveal (donor-accepts-first), org-aware requests.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES — account type (user | organisation)
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'user'
  CHECK (account_type IN ('user', 'organisation'));

-- ----------------------------------------------------------------------------
-- 2. TOWNSHIPS — centroid coordinates for privacy-safe matching
--    User location is stored as township only; matching uses these centroids.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.townships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL
);

ALTER TABLE public.townships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Townships are publicly readable" ON public.townships;
CREATE POLICY "Townships are publicly readable"
  ON public.townships FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.townships (name, region, lat, lng)
SELECT * FROM (VALUES
  ('Ahlone',                'Yangon',   16.7870, 96.1220),
  ('Bahan',                 'Yangon',   16.8102, 96.1520),
  ('Botahtaung',            'Yangon',   16.7690, 96.1700),
  ('Dagon',                 'Yangon',   16.7980, 96.1480),
  ('Dagon Seikkan',         'Yangon',   16.8340, 96.2700),
  ('Dala',                  'Yangon',   16.7450, 96.1550),
  ('Dawbon',                'Yangon',   16.7920, 96.1880),
  ('East Dagon',            'Yangon',   16.8780, 96.2260),
  ('Hlaing',                'Yangon',   16.8480, 96.1210),
  ('Hlaing Tharyar',        'Yangon',   16.8700, 96.0700),
  ('Insein',                'Yangon',   16.8910, 96.1060),
  ('Kamayut',               'Yangon',   16.8240, 96.1280),
  ('Kyauktada',             'Yangon',   16.7750, 96.1600),
  ('Kyimyindaing',          'Yangon',   16.7890, 96.1100),
  ('Lanmadaw',              'Yangon',   16.7770, 96.1460),
  ('Latha',                 'Yangon',   16.7770, 96.1530),
  ('Mayangone',             'Yangon',   16.8600, 96.1300),
  ('Mingaladon',            'Yangon',   16.9800, 96.1100),
  ('Mingalar Taung Nyunt',  'Yangon',   16.7860, 96.1700),
  ('North Dagon',           'Yangon',   16.8800, 96.1900),
  ('North Okkalapa',        'Yangon',   16.9000, 96.1600),
  ('Pabedan',               'Yangon',   16.7770, 96.1570),
  ('Pazundaung',            'Yangon',   16.7750, 96.1760),
  ('Sanchaung',             'Yangon',   16.8100, 96.1300),
  ('Seikgyikanaungto',      'Yangon',   16.7400, 96.1300),
  ('Shwepyitha',            'Yangon',   17.0000, 96.0800),
  ('South Dagon',           'Yangon',   16.8500, 96.2100),
  ('South Okkalapa',        'Yangon',   16.8600, 96.1700),
  ('Tamwe',                 'Yangon',   16.8050, 96.1750),
  ('Thaketa',               'Yangon',   16.7900, 96.2100),
  ('Thingangyun',           'Yangon',   16.8300, 96.1900),
  ('Yankin',                'Yangon',   16.8300, 96.1650),
  ('Aungmyethazan',         'Mandalay', 22.0100, 96.1000),
  ('Chanayethazan',         'Mandalay', 21.9800, 96.0900),
  ('Chanmyathazi',          'Mandalay', 21.9400, 96.0850),
  ('Mahaaungmye',           'Mandalay', 21.9600, 96.0900),
  ('Pyigyidagun',           'Mandalay', 21.9200, 96.1100)
) AS t(name, region, lat, lng)
WHERE NOT EXISTS (SELECT 1 FROM public.townships x WHERE x.name = t.name);

-- ----------------------------------------------------------------------------
-- 3. ORGANIZATIONS — hospitals, NGOs, blood banks, communities
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  org_type TEXT NOT NULL DEFAULT 'ngo'
    CHECK (org_type IN ('hospital', 'ngo', 'blood_bank', 'community', 'other')),
  township TEXT,
  address TEXT,
  phone TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  invite_code TEXT NOT NULL UNIQUE
    DEFAULT upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8)),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Helper functions (SECURITY DEFINER avoids recursive RLS lookups)
CREATE OR REPLACE FUNCTION public.is_org_member(p_org UUID, p_user UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = p_org AND user_id = p_user
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org UUID, p_user UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = p_org AND user_id = p_user AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.shares_org_with(p_user UUID, p_other UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members a
    JOIN public.organization_members b ON a.org_id = b.org_id
    WHERE a.user_id = p_user AND b.user_id = p_other
  );
$$;

-- Organizations: public read (invite_code protected via column grants below)
DROP POLICY IF EXISTS "Organizations are publicly readable" ON public.organizations;
CREATE POLICY "Organizations are publicly readable"
  ON public.organizations FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Org admins can update their organization" ON public.organizations;
CREATE POLICY "Org admins can update their organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (public.is_org_admin(id, auth.uid()))
  WITH CHECK (public.is_org_admin(id, auth.uid()));

-- Column-level protection: invite_code is NEVER selectable directly.
-- Admins retrieve it via get_my_org_invite_code().
REVOKE ALL ON public.organizations FROM anon, authenticated;
GRANT SELECT (id, name, org_type, township, address, phone, is_verified, owner_id, hospital_id, created_at, updated_at)
  ON public.organizations TO anon, authenticated;
GRANT UPDATE (name, org_type, township, address, phone)
  ON public.organizations TO authenticated;

-- Members: visible to co-members; admins remove members; users can leave.
DROP POLICY IF EXISTS "Members visible to org members" ON public.organization_members;
CREATE POLICY "Members visible to org members"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (public.is_org_member(org_id, auth.uid()));

DROP POLICY IF EXISTS "Admins remove members and users can leave" ON public.organization_members;
CREATE POLICY "Admins remove members and users can leave"
  ON public.organization_members FOR DELETE
  TO authenticated
  USING (
    (user_id = auth.uid() OR public.is_org_admin(org_id, auth.uid()))
    AND user_id <> (SELECT o.owner_id FROM public.organizations o WHERE o.id = org_id)
  );

-- ----------------------------------------------------------------------------
-- 4. ORGANISATION FUNCTIONS — create, join by invite code, read invite code
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_organization(
  p_name TEXT,
  p_org_type TEXT DEFAULT 'ngo',
  p_township TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_org UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;
  IF p_name IS NULL OR length(trim(p_name)) < 2 THEN
    RAISE EXCEPTION 'INVALID_NAME';
  END IF;

  INSERT INTO public.organizations (name, org_type, township, phone, address, owner_id)
  VALUES (
    trim(p_name),
    CASE WHEN p_org_type IN ('hospital','ngo','blood_bank','community','other') THEN p_org_type ELSE 'ngo' END,
    p_township, p_phone, p_address, auth.uid()
  )
  RETURNING id INTO v_org;

  INSERT INTO public.organization_members (org_id, user_id, role)
  VALUES (v_org, auth.uid(), 'admin')
  ON CONFLICT (org_id, user_id) DO NOTHING;

  UPDATE public.profiles SET account_type = 'organisation' WHERE id = auth.uid();

  RETURN v_org;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_organization_by_code(p_code TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_org UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT id INTO v_org
  FROM public.organizations
  WHERE invite_code = upper(trim(p_code));

  IF v_org IS NULL THEN
    RAISE EXCEPTION 'INVALID_CODE';
  END IF;

  INSERT INTO public.organization_members (org_id, user_id, role)
  VALUES (v_org, auth.uid(), 'member')
  ON CONFLICT (org_id, user_id) DO NOTHING;

  RETURN v_org;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_org_invite_code(p_org_id UUID)
RETURNS TEXT
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  IF NOT public.is_org_admin(p_org_id, auth.uid()) THEN
    RAISE EXCEPTION 'NOT_ADMIN';
  END IF;
  SELECT invite_code INTO v_code FROM public.organizations WHERE id = p_org_id;
  RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION public.create_organization(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_organization_by_code(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_org_invite_code(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_organization_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_org_invite_code(UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- 5. REQUESTS — organisation identity on broadcasts
-- ----------------------------------------------------------------------------
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_requests_organization_id ON public.requests(organization_id);

DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.requests;
CREATE POLICY "Authenticated users can create requests"
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
    AND (organization_id IS NULL OR public.is_org_member(organization_id, auth.uid()))
  );

-- ----------------------------------------------------------------------------
-- 6. PROFILES — privacy-tightened RLS (anti-scam)
--    Donor contact info is only revealed after the donor accepts a match.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_view_donor_contact(p_viewer UUID, p_donor UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matches m
    JOIN public.requests r ON r.id = m.request_id
    WHERE m.donor_id = p_donor
      AND r.requester_id = p_viewer
      AND m.status IN ('ACCEPTED', 'COMPLETED')
  );
$$;

DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anon can view available donor locations" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Requesters expose their profile by creating a request (contactability)
DROP POLICY IF EXISTS "Requester profiles are viewable" ON public.profiles;
CREATE POLICY "Requester profiles are viewable"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.requester_id = profiles.id));

-- Donor profile visible to a requester only after the donor accepted the match
DROP POLICY IF EXISTS "Donor visible to requester after accepted match" ON public.profiles;
CREATE POLICY "Donor visible to requester after accepted match"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.can_view_donor_contact(auth.uid(), id));

-- Members of the same organisation can see each other
DROP POLICY IF EXISTS "Org co-members can view profiles" ON public.profiles;
CREATE POLICY "Org co-members can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.shares_org_with(auth.uid(), id));

-- public_profiles view must respect the caller's RLS, not the owner's
ALTER VIEW public.public_profiles SET (security_invoker = on);

-- Contact reveal for an accepted match (donor-accepts-first flow)
CREATE OR REPLACE FUNCTION public.get_match_donor_contact(p_match_id UUID)
RETURNS TABLE (full_name TEXT, phone TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT pr.full_name, pr.phone
  FROM public.matches m
  JOIN public.requests r ON r.id = m.request_id
  JOIN public.profiles pr ON pr.id = m.donor_id
  WHERE m.id = p_match_id
    AND r.requester_id = auth.uid()
    AND m.status IN ('ACCEPTED', 'COMPLETED');
$$;

REVOKE ALL ON FUNCTION public.get_match_donor_contact(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_match_donor_contact(UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- 7. SIGNUP TRIGGER — capture profile fields from auth metadata
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, blood_type, township, account_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(new.raw_user_meta_data ->> 'phone', ''),
    CASE
      WHEN new.raw_user_meta_data ->> 'blood_type' IN ('O+','O-','A+','A-','B+','B-','AB+','AB-')
      THEN new.raw_user_meta_data ->> 'blood_type'
      ELSE NULL
    END,
    NULLIF(new.raw_user_meta_data ->> 'township', ''),
    CASE
      WHEN new.raw_user_meta_data ->> 'account_type' = 'organisation' THEN 'organisation'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. TIMESTAMPS
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
