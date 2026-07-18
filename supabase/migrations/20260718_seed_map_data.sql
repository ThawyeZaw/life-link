-- ============================================================================
-- LifeLink — Seed data for interactive map
-- Creates test donors (profiles) and blood requests for map visualization.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create test auth users for donors
--    Password hash is a dummy (not usable for login — seed data only)
-- ----------------------------------------------------------------------------
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, is_super_admin)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  donor.email,
  '$2a$10$dummyhashfordisplaypurposesonly',
  now(),
  '{"provider":"email","providers":["email"]}',
  jsonb_build_object('full_name', donor.name),
  now(),
  now(),
  '',
  '',
  '',
  '',
  false
FROM (VALUES
  ('donor01@lifelink-seed.mm',  'Ko Aung Kyaw'),
  ('donor02@lifelink-seed.mm',  'Ma Thida Win'),
  ('donor03@lifelink-seed.mm',  'U Kyaw Zin'),
  ('donor04@lifelink-seed.mm',  'Daw Hnin Si'),
  ('donor05@lifelink-seed.mm',  'Ko Min Thu'),
  ('donor06@lifelink-seed.mm',  'Ma Su Myat'),
  ('donor07@lifelink-seed.mm',  'Ko Zaw Htet'),
  ('donor08@lifelink-seed.mm',  'Ma Ei Phyu'),
  ('donor09@lifelink-seed.mm',  'Ko Naing Lin'),
  ('donor10@lifelink-seed.mm',  'Daw Khin Mar'),
  ('donor11@lifelink-seed.mm',  'Ko Pyae Sone'),
  ('donor12@lifelink-seed.mm',  'Ma Nwe Oo'),
  ('donor13@lifelink-seed.mm',  'Ko Htet Aung'),
  ('donor14@lifelink-seed.mm',  'Ma Yamin Thwe'),
  ('donor15@lifelink-seed.mm',  'U Soe Moe'),
  ('donor16@lifelink-seed.mm',  'Daw Mya Thida'),
  ('donor17@lifelink-seed.mm',  'Ko Ye Lin'),
  ('donor18@lifelink-seed.mm',  'Ma Phoo Pwint'),
  ('donor19@lifelink-seed.mm',  'Ko Sai Khun'),
  ('donor20@lifelink-seed.mm',  'Daw Than Than Nu')
) AS donor(email, name)
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = donor.email);

-- ----------------------------------------------------------------------------
-- 2. Create donor profiles with realistic Yangon township locations
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, phone, blood_type, township, lat, lng, is_available, last_donation_date, hide_medical_info)
SELECT
  u.id,
  u.raw_user_meta_data ->> 'full_name',
  d.phone,
  d.blood_type,
  d.township,
  d.lat,
  d.lng,
  true,
  d.last_donation_date::date,
  false
FROM auth.users u
JOIN (VALUES
  ('donor01@lifelink-seed.mm',  '09-4200-1001', 'O-',  'Sanchaung',              16.8147, 96.1345, '2026-06-15'),
  ('donor02@lifelink-seed.mm',  '09-4200-1002', 'A+',  'Bahan',                  16.8059, 96.1472, '2026-05-20'),
  ('donor03@lifelink-seed.mm',  '09-4200-1003', 'B+',  'Kamayut',                16.8234, 96.1288, '2026-04-10'),
  ('donor04@lifelink-seed.mm',  '09-4200-1004', 'O+',  'Tamwe',                  16.8141, 96.1777, '2026-06-01'),
  ('donor05@lifelink-seed.mm',  '09-4200-1005', 'AB+', 'Mayangone',              16.8762, 96.1214, '2026-03-25'),
  ('donor06@lifelink-seed.mm',  '09-4200-1006', 'A-',  'Hlaing',                 16.8543, 96.1125, '2026-06-10'),
  ('donor07@lifelink-seed.mm',  '09-4200-1007', 'O+',  'Mingalar Taung Nyunt',   16.7789, 96.1617, '2026-07-01'),
  ('donor08@lifelink-seed.mm',  '09-4200-1008', 'B+',  'Insein',                 16.8902, 96.1089, '2026-05-28'),
  ('donor09@lifelink-seed.mm',  '09-4200-1009', 'O-',  'North Okkalapa',         16.9012, 96.1877, '2026-04-18'),
  ('donor10@lifelink-seed.mm',  '09-4200-1010', 'A+',  'Sanchaung',              16.8195, 96.1367, '2026-06-22'),
  ('donor11@lifelink-seed.mm',  '09-4200-1011', 'AB-', 'Bahan',                  16.8100, 96.1500, '2026-02-14'),
  ('donor12@lifelink-seed.mm',  '09-4200-1012', 'B-',  'Kamayut',                16.8280, 96.1320, '2026-05-05'),
  ('donor13@lifelink-seed.mm',  '09-4200-1013', 'O+',  'Thingangyun',            16.8300, 96.1900, '2026-06-30'),
  ('donor14@lifelink-seed.mm',  '09-4200-1014', 'A+',  'Yankin',                 16.8280, 96.1720, '2026-07-05'),
  ('donor15@lifelink-seed.mm',  '09-4200-1015', 'B+',  'Tamwe',                  16.8200, 96.1800, '2026-04-22'),
  ('donor16@lifelink-seed.mm',  '09-4200-1016', 'O-',  'Dagon',                  16.8500, 96.1500, '2026-06-12'),
  ('donor17@lifelink-seed.mm',  '09-4200-1017', 'AB+', 'Ahlone',                 16.7850, 96.1370, '2026-03-30'),
  ('donor18@lifelink-seed.mm',  '09-4200-1018', 'A-',  'Lanmadaw',               16.7778, 96.1490, '2026-05-15'),
  ('donor19@lifelink-seed.mm',  '09-4200-1019', 'O+',  'Kyauktada',              16.7750, 96.1590, '2026-06-28'),
  ('donor20@lifelink-seed.mm',  '09-4200-1020', 'B+',  'Mayangone',              16.8800, 96.1250, '2026-04-08')
) AS d(email, phone, blood_type, township, lat, lng, last_donation_date)
ON u.email = d.email
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id);

-- ----------------------------------------------------------------------------
-- 3. Create a system user for request creation
-- ----------------------------------------------------------------------------
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, is_super_admin)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'system@lifelink-seed.mm',
  '$2a$10$dummyhashfordisplaypurposesonly',
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"LifeLink System"}',
  now(),
  now(),
  '',
  '',
  '',
  '',
  false
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'system@lifelink-seed.mm');

INSERT INTO public.profiles (id, full_name, blood_type, township, lat, lng, is_available)
SELECT
  u.id,
  'LifeLink System',
  'O+',
  'Yangon',
  16.8409,
  96.1735,
  true
FROM auth.users u
WHERE u.email = 'system@lifelink-seed.mm'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id);

-- ----------------------------------------------------------------------------
-- 4. Create 15 blood requests at various Yangon hospitals
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  sys_user_id UUID;
  ygh_id UUID;
  thingangyun_id UUID;
  north_okkala_id UUID;
  insein_id UUID;
  sanpya_id UUID;
  waibargi_id UUID;
  yangon_children_id UUID;
BEGIN
  SELECT id INTO sys_user_id FROM auth.users WHERE email = 'system@lifelink-seed.mm';
  SELECT id INTO ygh_id FROM public.hospitals WHERE name ILIKE '%yangon general hospital%' LIMIT 1;
  SELECT id INTO thingangyun_id FROM public.hospitals WHERE name ILIKE '%thingangyun%' LIMIT 1;
  SELECT id INTO north_okkala_id FROM public.hospitals WHERE name ILIKE '%north okkalapa%' LIMIT 1;
  SELECT id INTO insein_id FROM public.hospitals WHERE name ILIKE '%insein%general%' LIMIT 1;
  SELECT id INTO sanpya_id FROM public.hospitals WHERE name ILIKE '%sanpya%' LIMIT 1;
  SELECT id INTO waibargi_id FROM public.hospitals WHERE name ILIKE '%way bar gi%' LIMIT 1;
  SELECT id INTO yangon_children_id FROM public.hospitals WHERE name ILIKE '%yankin children%' LIMIT 1;

  -- Fall back to any approved hospital if specific ones not found
  IF ygh_id IS NULL THEN SELECT id INTO ygh_id FROM public.hospitals WHERE verification_status = 'APPROVED' ORDER BY RANDOM() LIMIT 1; END IF;
  IF thingangyun_id IS NULL THEN SELECT id INTO thingangyun_id FROM public.hospitals WHERE verification_status = 'APPROVED' AND id != COALESCE(ygh_id, '00000000-0000-0000-0000-000000000000') ORDER BY RANDOM() LIMIT 1; END IF;
  IF north_okkala_id IS NULL THEN SELECT id INTO north_okkala_id FROM public.hospitals WHERE verification_status = 'APPROVED' AND id NOT IN (COALESCE(ygh_id, '00000000-0000-0000-0000-000000000000'), COALESCE(thingangyun_id, '00000000-0000-0000-0000-000000000001')) ORDER BY RANDOM() LIMIT 1; END IF;
  IF insein_id IS NULL THEN SELECT id INTO insein_id FROM public.hospitals WHERE verification_status = 'APPROVED' ORDER BY RANDOM() LIMIT 1; END IF;
  IF sanpya_id IS NULL THEN SELECT id INTO sanpya_id FROM public.hospitals WHERE verification_status = 'APPROVED' ORDER BY RANDOM() LIMIT 1; END IF;
  IF waibargi_id IS NULL THEN SELECT id INTO waibargi_id FROM public.hospitals WHERE verification_status = 'APPROVED' ORDER BY RANDOM() LIMIT 1; END IF;
  IF yangon_children_id IS NULL THEN SELECT id INTO yangon_children_id FROM public.hospitals WHERE verification_status = 'APPROVED' ORDER BY RANDOM() LIMIT 1; END IF;

  -- Only insert if requests table is empty
  IF NOT EXISTS (SELECT 1 FROM public.requests LIMIT 1) THEN

    INSERT INTO public.requests (requester_id, hospital_id, request_type, blood_type, units_needed, urgency, status, township, lat, lng, expires_at)
    VALUES
      (sys_user_id, ygh_id,             'BLOOD', 'O-',  3, 'CRITICAL', 'OPEN',        'Lanmadaw',              16.7778, 96.1490, now() + interval '24 hours'),
      (sys_user_id, thingangyun_id,      'BLOOD', 'A+',  2, 'URGENT',   'OPEN',        'Thingangyun',           16.8300, 96.1900, now() + interval '24 hours'),
      (sys_user_id, north_okkala_id,     'BLOOD', 'B+',  1, 'STANDARD', 'OPEN',        'North Okkalapa',        16.9012, 96.1877, now() + interval '24 hours'),
      (sys_user_id, insein_id,           'BLOOD', 'O+',  4, 'CRITICAL', 'IN_PROGRESS', 'Insein',                16.8902, 96.1089, now() + interval '12 hours'),
      (sys_user_id, sanpya_id,           'BLOOD', 'AB+', 2, 'URGENT',   'OPEN',        'Thingangyun',           16.8350, 96.1880, now() + interval '24 hours'),
      (sys_user_id, ygh_id,              'BLOOD', 'A-',  1, 'STANDARD', 'OPEN',        'Lanmadaw',              16.7800, 96.1510, now() + interval '24 hours'),
      (sys_user_id, waibargi_id,         'BLOOD', 'O+',  5, 'CRITICAL', 'OPEN',        'Mayangone',             16.8762, 96.1214, now() + interval '8 hours'),
      (sys_user_id, ygh_id,              'BLOOD', 'B+',  2, 'URGENT',   'IN_PROGRESS', 'Sanchaung',             16.8147, 96.1345, now() + interval '24 hours'),
      (sys_user_id, yangon_children_id,  'BLOOD', 'O-',  3, 'STANDARD', 'OPEN',        'Yankin',                16.8280, 96.1720, now() + interval '24 hours'),
      (sys_user_id, north_okkala_id,     'BLOOD', 'AB-', 1, 'URGENT',   'OPEN',        'North Okkalapa',        16.9050, 96.1900, now() + interval '24 hours'),
      (sys_user_id, insein_id,           'BLOOD', 'A+',  3, 'CRITICAL', 'OPEN',        'Hlaing',                16.8543, 96.1125, now() + interval '6 hours'),
      (sys_user_id, thingangyun_id,      'BLOOD', 'B-',  1, 'STANDARD', 'OPEN',        'Thingangyun',           16.8320, 96.1930, now() + interval '24 hours'),
      (sys_user_id, ygh_id,              'BLOOD', 'O+',  2, 'URGENT',   'OPEN',        'Kyauktada',             16.7750, 96.1590, now() + interval '24 hours'),
      (sys_user_id, sanpya_id,           'BLOOD', 'A+',  4, 'CRITICAL', 'OPEN',        'Tamwe',                 16.8141, 96.1777, now() + interval '4 hours'),
      (sys_user_id, waibargi_id,         'BLOOD', 'AB+', 2, 'STANDARD', 'OPEN',        'Bahan',                 16.8059, 96.1472, now() + interval '24 hours');

  END IF;
END $$;
