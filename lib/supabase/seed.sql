-- ============================================================================
-- Vertex Red — Seed Data: Yangon Hospitals
-- Thaw Ye Zaw — Backend / Database Domain
-- ============================================================================

-- Pre-approved Yangon hospitals with real coordinates
INSERT INTO public.hospitals (name, township, address, phone, lat, lng, verification_status) VALUES
(
  'Yangon General Hospital (YGH)',
  'Mingalar Taung Nyunt',
  'Bo Min Yaung Street, Mingalar Taung Nyunt',
  '01-256112',
  16.7789,
  96.1617,
  'APPROVED'
),
(
  'Thukha Yeik Mon Specialist Hospital',
  'Sanchaung',
  'Baho Road, Sanchaung Township',
  '01-512345',
  16.8147,
  96.1345,
  'APPROVED'
),
(
  'Asia Royal Hospital',
  'Bahan',
  'No. 14, Sayar San Road, Bahan',
  '01-558266',
  16.8102,
  96.1631,
  'APPROVED'
),
(
  'Pun Hlaing Siloam Hospital',
  'Hlaing Tharyar',
  'Pun Hlaing Estate Ave, Hlaing Tharyar',
  '01-685678',
  16.8456,
  96.0889,
  'APPROVED'
),
(
  'Parami Hospital',
  'Mayangone',
  'No. 60, Parami Road, Mayangone',
  '01-657777',
  16.8478,
  96.1175,
  'APPROVED'
),
(
  'No. 2 Military Hospital',
  'North Okkalapa',
  'Thudhamma Road, North Okkalapa',
  '01-620345',
  16.8790,
  96.1645,
  'APPROVED'
)
ON CONFLICT DO NOTHING;

-- Sample donor profiles for development/testing (optional — remove before production)
-- These use placeholder UUIDs. Replace with real auth.users IDs when testing.
-- INSERT INTO public.profiles (id, full_name, phone, blood_type, township, is_available, lat, lng) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'Ko Aung',    '09123456789', 'O+',  'Sanchaung',      true,  16.8147, 96.1345),
-- ('00000000-0000-0000-0000-000000000002', 'Ma Thida',   '09123456780', 'A+',  'Bahan',          true,  16.8102, 96.1631),
-- ('00000000-0000-0000-0000-000000000003', 'U Kyaw Zin', '09123456781', 'B+',  'Tamwe',          true,  16.7985, 96.1765),
-- ('00000000-0000-0000-0000-000000000004', 'Daw Hnin',   '09123456782', 'AB+', 'Kamayut',        false, 16.8223, 96.1487),
-- ('00000000-0000-0000-0000-000000000005', 'Ko Min Thu', '09123456783', 'O-',  'Insein',         true,  16.8867, 96.1001);
