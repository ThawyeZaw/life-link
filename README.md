# LifeLink

> **Hackathon Pitch:** A real-time emergency platform that connects blood donors, hospitals, and critical medical needs — like Grab, but for saving lives.

---

## Core Features

### Public Marketing Landing Page (`/`)
Brand awareness and conversion — hero section with stats, "How it works" step guide, trust indicators, and CTAs that route through the auth modal. No operational data (live feeds, maps, donor contacts) is exposed without authentication.

### Protected Operations Dashboard (`/dashboard`)
Authenticated hub with three widgets:
- **Request Board** — Live feed of emergency blood requests, filterable by urgency (ALL / CRITICAL / URGENT / STANDARD).
- **Ping a Hero** — One-tap donor dispatch. Select a blood type and alert nearby matching donors.
- **Location Feed** — Compact hospital proximity preview with link to the full live map.

### Interactive Medical Map (`/map`)
Mapbox-powered map displaying active donor locations, hospital pins, and urgent request zones across Myanmar.

### Donor Passport (`/passport`)
Donor profile with hero card, eligibility section, active dispatch tracking, and donation history with stats.

### Hospital Command Center (`/command`)
Live request board with real-time updates, search, urgency filters, map placeholder, and live feed.

### Emergency Broadcast (`/broadcast`)
Three-step form: urgency selection, blood type grid, facility selector. Broadcasts to matching donors.

### Blood Inventory (`/inventory`)
Stock dashboard with critical/low summary cards, type filter pills, stock list, recent intake log, and log-donation modal.

### Unified Auth System
Sign In / Sign Up modal accessible from any public page. Includes **Developer Demo Login** cards for testing.

### Curved Floating Navigation Pill
Site-wide glassmorphism bottom navigation — rendered once in the root layout, available on every page. Route-aware: shows public links (About, Services, Team, Contact) or app links (Request Board, Passport, Broadcast, Inventory, Live Map) depending on the current route context. Scroll-aware hide/show behavior. No sidebar — the floating pill is the exclusive navigation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), Tailwind CSS, Lucide React |
| **Database / Realtime** | Supabase (PostgreSQL + Realtime subscriptions) |
| **Mapping** | Mapbox GL JS |
| **Matching Engine** | Python (FastAPI microservice) |
| **Auth** | Supabase Auth |

---

## Project Structure

```
vertex-red/
├── src/
│   ├── app/                          # Next.js App Router pages & layouts
│   │   ├── layout.tsx                # Root layout (font, globals, site-wide Navbar pill)
│   │   ├── page.tsx                  # Public marketing landing page
│   │   ├── about/page.tsx            # About / mission page
│   │   ├── services/page.tsx         # Services overview
│   │   ├── team/page.tsx             # Team profile grid
│   │   ├── contact/page.tsx          # Contact form + info
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Protected shell with DashboardGuard (no sidebar)
│   │   │   └── page.tsx              # Operations dashboard (RequestBoard, PingHero, MapPreview)
│   │   ├── passport/page.tsx         # Donor Passport
│   │   ├── command/page.tsx          # Hospital command center
│   │   ├── broadcast/page.tsx        # Emergency broadcast form
│   │   ├── inventory/page.tsx        # Blood inventory dashboard
│   │   ├── map/page.tsx              # Full Mapbox live map (stub)
│   │   └── api/                      # API routes & matching engine proxy
│   ├── components/                   # Reusable React UI components
│   │   ├── Navbar.tsx                # Curved floating glass navigation pill (site-wide)
│   │   ├── AuthModal.tsx             # Auth dialog with demo login cards
│   │   ├── AuthTabs.tsx              # Sign In / Sign Up tabbed form
│   │   ├── PasswordPolicy.tsx        # Live password strength checklist
│   │   ├── DashboardGuard.tsx        # Client-side session gate for /dashboard
│   │   ├── marketing/                # Home page sections
│   │   │   ├── HeroSection.tsx       # Hero with glass stat overlay
│   │   │   ├── FeatureSection.tsx    # Staggered feature cards
│   │   │   ├── ValuesTabs.tsx        # Interactive value tabs
│   │   │   └── CommunityStories.tsx  # Testimonial grid
│   │   ├── dashboard/                # Dashboard widgets
│   │   │   ├── RequestBoard.tsx      # Urgency-filterable request feed
│   │   │   ├── MapPreview.tsx        # Hospital proximity preview
│   │   │   └── PingHero.tsx          # Emergency donor dispatch
│   │   ├── layout/                   # Top bars (DonorTopBar, HospitalTopBar, BottomNav)
│   │   ├── passport/                 # Donor passport cards and history
│   │   ├── command/                  # Request cards, map placeholder, live feed
│   │   ├── broadcast/                # Urgency selector, facility selector, blood type grid
│   │   ├── inventory/                # Blood stock rows
│   │   ├── data/
│   │   │   └── mockData.ts           # Realistic Myanmar-localized mock data
│   │   └── ui/                       # Shared UI primitives
│   │       ├── UrgencyBadge.tsx
│   │       ├── BloodTypeBadge.tsx
│   │       ├── StatCard.tsx
│   │       └── SectionHeader.tsx
│   ├── styles/
│   │   └── globals.css               # Tailwind base, CSS variables, glass/animation utilities
│   └── utils/supabase/               # Supabase client, queries, types
├── engine/                           # Python FastAPI matching engine
├── public/                           # Static assets and screenshots
├── design_system.md                  # Visual design system (single source of truth)
├── AGENTS.md                         # AI code generation rules
└── API.md                            # API documentation
```

---

## Design System

LifeLink uses an **Apple Liquid Glass** visual language with water-inspired soft blue undertones. See [design_system.md](design_system.md) for the complete design system including:

- **Three-tier glass depth system** — `.glass-surface` / `.glass-elevated` / `.glass-overlay`
- **Water-inspired gradients** — `.bg-water-gradient`, `.bg-water-subtle`, `.water-ripple`
- **Floating animations** — `.animate-float-subtle`, `.animate-float-cta`, `.hover:float-card`
- **Curved floating navigation pill** — site-wide, route-aware, scroll-aware
- **Color system** — LifeLink Red primaries, semantic urgency colors, text hierarchy
- **Typography** — Inter font stack with Myanmar fallback rules
- **Mobile-first layout** — Tailwind responsive breakpoints, 44px touch targets

---

## Local Setup

### Prerequisites
- Node.js 20+
- npm or yarn
- A [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/your-org/vertex-red.git
cd vertex-red
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

> **Note:** The project uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Never commit `.env.local` to version control.

### 4. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 5. Use demo accounts (no Supabase required)

Click **Login / Join** in the floating nav pill, then choose a demo card:
- **Hospital Admin** — `hospital.demo@ygh.gov.mm` / `hospital123`
- **Donor Hero (O+)** — `koaung.demo@gmail.com` / `donor123`

Demo login sets a local session flag and redirects to the dashboard. Real Supabase Auth integration is in the backend domain.

---

## Auth & Access Control

### Flow
1. Public routes: Floating nav pill shows **Login / Join** button → opens auth modal.
2. Modals: **Sign In** tab (email + password), **Sign Up** tab (name, phone, email, password with live strength checklist, MFA opt-in), and **Developer Demo Login** cards.
3. Authentication: `/dashboard` layout wraps content in `DashboardGuard`. Unauthenticated users are redirected to `/`.
4. Logout: Clears all client-side storage and redirects to `/` via `router.replace()`.

### Password policy (Sign Up)
Client-side validation enforces: 12+ characters, uppercase + lowercase + digit + special character, and blocks commonly used passwords.

---

## Team

| Name | Role | Domain |
|---|---|---|
| **Thaw Ye Zaw** | Full Stack Engineer | Supabase schema, API routes, backend logic, Python matching engine |
| **Thinzar Kyaw** | Full Stack Engineer | Next.js components, Tailwind UI, Mapbox integration, frontend state |
| **Zay Lynn Htet** | UI/UX Designer | Figma designs, design system, visual assets |

---

## License

MIT — Built with ❤️ for the hackathon.
