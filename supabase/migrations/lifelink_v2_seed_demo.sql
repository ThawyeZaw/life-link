-- ============================================================================
-- LifeLink v2 — Demo seed data for hackathon testing
-- All demo accounts use password: LifeLink123!
-- ============================================================================

create extension if not exists pgcrypto;

-- Helper to create a confirmed auth user (profile auto-created via trigger)
create or replace function pg_temp.seed_user(
  p_email text,
  p_password text,
  p_meta jsonb
) returns uuid
language plpgsql as $$
declare
  uid uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change, email_change_token_new, email_change_token_current
  ) values (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb, p_meta,
    now(), now(), '', '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), uid, uid::text,
    jsonb_build_object('sub', uid::text, 'email', p_email, 'email_verified', true),
    'email', now(), now(), now()
  );

  return uid;
end $$;

do $$
declare
  v_requester uuid;
  v_org_owner uuid;
  v_donor_kyawzin uuid;
  v_donor_sumyat uuid;
  v_org uuid;
  v_hosp_ygh uuid;
  v_hosp_org uuid;
  v_req_critical uuid;
begin
  -- Requester (individual, will create the demo CRITICAL request)
  v_requester := pg_temp.seed_user('thida@lifelink.demo', 'LifeLink123!', jsonb_build_object(
    'full_name','Ma Thida','account_type','individual','phone','09-773344556',
    'blood_type','A+','township','Sanchaung','lat','16.8058','lng','96.1258'));

  -- Donors around Yangon (compatible mix for O+ / B+ demos)
  perform pg_temp.seed_user('koaung@lifelink.demo', 'LifeLink123!', jsonb_build_object(
    'full_name','Ko Aung','account_type','individual','phone','09-421100223',
    'blood_type','O-','township','Kamayut','lat','16.8286','lng','96.1279'));

  v_donor_kyawzin := pg_temp.seed_user('kyawzin@lifelink.demo', 'LifeLink123!', jsonb_build_object(
    'full_name','U Kyaw Zin','account_type','individual','phone','09-965544332',
    'blood_type','O+','township','Bahan','lat','16.8085','lng','96.1552'));

  perform pg_temp.seed_user('hninwai@lifelink.demo', 'LifeLink123!', jsonb_build_object(
    'full_name','Ma Hnin Wai','account_type','individual','phone','09-780011224',
    'blood_type','A+','township','Tamwe','lat','16.8104','lng','96.1764'));

  perform pg_temp.seed_user('zawmin@lifelink.demo', 'LifeLink123!', jsonb_build_object(
    'full_name','Ko Zaw Min','account_type','individual','phone','09-450098771',
    'blood_type','A-','township','Hlaing','lat','16.8482','lng','96.1204'));

  perform pg_temp.seed_user('khinmar@lifelink.demo', 'LifeLink123!', jsonb_build_object(
    'full_name','Daw Khin Mar','account_type','individual','phone','09-262233445',
    'blood_type','B+','township','Insein','lat','16.8891','lng','96.1082'));

  perform pg_temp.seed_user('thura@lifelink.demo', 'LifeLink123!', jsonb_build_object(
    'full_name','Ko Thura','account_type','individual','phone','09-799887766',
    'blood_type','AB+','township','Mingalar Taung Nyunt','lat','16.7896','lng','96.1697'));

  v_donor_sumyat := pg_temp.seed_user('sumyat@lifelink.demo', 'LifeLink123!', jsonb_build_object(
    'full_name','Ma Su Myat','account_type','individual','phone','09-540022113',
    'blood_type','O+','township','Sanchaung','lat','16.8047','lng','96.1284'));

  perform pg_temp.seed_user('nyinyi@lifelink.demo', 'LifeLink123!', jsonb_build_object(
    'full_name','Ko Nyi Nyi','account_type','individual','phone','09-691122334',
    'blood_type','B-','township','Kyeemyindaing','lat','16.7862','lng','96.1223'));

  -- Organization account + org with a memorable invite code
  v_org_owner := pg_temp.seed_user('org@lifelink.demo', 'LifeLink123!', jsonb_build_object(
    'full_name','Yangon Youth Blood Donors','account_type','organization',
    'phone','09-880044556','township','Bahan','lat','16.8085','lng','96.1552'));

  insert into public.organizations (name, org_type, township, address, phone, invite_code, owner_id)
  values ('Yangon Youth Blood Donors', 'community', 'Bahan',
          'No. 27, Kabar Aye Pagoda Road, Bahan, Yangon', '09-880044556',
          'YANGON01', v_org_owner)
  returning id into v_org;

  insert into public.organization_members (org_id, user_id, role)
  values (v_org, v_org_owner, 'admin'),
         (v_org, v_donor_kyawzin, 'member'),
         (v_org, v_donor_sumyat, 'member');

  -- Hospitals for sample requests (fallback to any hospital if names differ)
  select id into v_hosp_ygh from public.hospitals
    where name ilike '%yangon general%' limit 1;
  if v_hosp_ygh is null then
    select id into v_hosp_ygh from public.hospitals
      where township ilike '%mingalar%' limit 1;
  end if;
  if v_hosp_ygh is null then
    select id into v_hosp_ygh from public.hospitals limit 1;
  end if;

  select id into v_hosp_org from public.hospitals
    where name ilike '%asia royal%' limit 1;
  if v_hosp_org is null then
    select id into v_hosp_org from public.hospitals
      where id <> v_hosp_ygh limit 1;
  end if;

  -- Sample requests
  insert into public.requests
    (requester_id, hospital_id, blood_type, units_needed, urgency, patient_name, notes, status)
  values
    (v_requester, v_hosp_ygh, 'O+', 2, 'CRITICAL', 'U Mya Win',
     'Emergency surgery scheduled. Please contact as soon as possible.', 'OPEN')
  returning id into v_req_critical;

  insert into public.requests
    (requester_id, organization_id, hospital_id, blood_type, units_needed, urgency, notes, status)
  values
    (v_org_owner, v_org, v_hosp_org, 'B+', 3, 'URGENT',
     'Community blood drive for thalassemia patients.', 'OPEN');
end $$;
