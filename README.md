# LifeLink

> Connecting blood donors with patients and hospitals across Myanmar — in minutes, not days. Private by design: a donor's location and contact are never shared until they say yes.

## The Flow

```
Request blood → Radar scans nearby compatible donors (anonymized)
             → Selected donors get an email with a secret accept link
             → Donor accepts & shares contact details (consent-based)
             → Requester confirms the donor → donation → completed
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/login` · `/signup` | Email + password auth (individual / organization accounts) |
| `/dashboard` | Role-aware hub: availability toggle, invitations, requests, org roster |
| `/requests/new` | Create a blood request (always tied to a hospital) |
| `/requests/[id]` | Radar search, donor alerts, live response tracking |
| `/match/[token]` | Donor accept/decline page (token-authenticated, no login needed) |
| `/map` | Public map of 200+ hospitals + places needing blood now |

API routes: `/api/auth/signup`, `/api/radar`, `/api/invite`, `/api/match/[token]`, `/api/match/update`, `/api/org/join`, `/api/org/members`.

## Stack

Next.js (App Router) · Tailwind CSS · Lucide · Supabase (Postgres, Auth, RLS) · react-map-gl (Mapbox) · Resend

Matching runs inside Postgres (`find_nearby_donors`): blood-type compatibility + haversine distance from the request's hospital + 90-day donor cooldown.

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in values (see comments in the file)
npm run dev
```

Database migrations live in `supabase/migrations/` (apply in order):
1. `lifelink_v2_schema.sql` — tables, matching functions, RLS
2. `lifelink_v2_seed_demo.sql` — demo accounts + sample requests
3. `lifelink_v2_display_functions.sql` — privacy-gated read functions
4. `lifelink_v2_reset_demo_state.sql` — re-run anytime to reset the demo

## Demo Accounts (password: `LifeLink123!`)

| Account | Email | Role |
|---|---|---|
| Ma Thida | `thida@lifelink.demo` | Requester (has a sample CRITICAL request) |
| U Kyaw Zin | `kyawzin@lifelink.demo` | Donor, O+ (Bahan) |
| Yangon Youth Blood Donors | `org@lifelink.demo` | Organization (invite code `YANGON01`) |

Plus 7 more donors around Yangon. The `/login` page has 1-tap demo login buttons.

## Deploy (Vercel)

1. Push the repo and import it in Vercel (framework preset: Next.js).
2. Set all variables from `.env.example` in Project Settings → Environment Variables.
   - Set `NEXT_PUBLIC_SITE_URL` to your production URL (used in donor email links).
3. Deploy. The Supabase database is already migrated and seeded.

Note: without a verified domain in Resend, invitation emails only deliver to the
Resend account owner's address — the in-app invitations list covers everyone else.
