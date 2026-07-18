# 🩸 LifeLink

> **Hackathon Pitch:** A real-time emergency platform that connects blood donors, hospitals, and critical medical needs — like Grab, but for saving lives.

---
## 🚀 Core Features

### 🗂️ Real-time Request Board
A live-updating dashboard where hospitals and patients can post urgent blood and medical supply requests. Requests are color-coded by urgency level and blood type, updating instantly via Supabase real-time subscriptions — no refresh needed.

### 🗺️ Interactive Medical Map
A Mapbox-powered map (via `react-map-gl`) displaying hospital locations, active blood request pins colored by urgency, and available donor markers across Myanmar. Includes layer toggles, "Get Directions" integration, and real-time data from Supabase. Donors see nearby hospitals and requests; requesters see compatible donors.

### 🚨 Ping a Hero Alert
A one-tap emergency alert system that notifies compatible nearby donors via push notification or SMS when a critical request is posted. Powered by the Python matching engine, which ranks donors by blood type compatibility, proximity, last donation date, and township locality.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, Tailwind CSS v4, Lucide React |
| **Database / Realtime** | Supabase (PostgreSQL + Realtime subscriptions) |
| **Mapping** | react-map-gl + mapbox-gl |
| **Matching Engine** | Python FastAPI microservice (separate repo) |
| **Auth** | Supabase Auth |

---

## 📦 Local Setup

### Prerequisites
- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
cd lifelink
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase project URL and anon key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

> The Mapbox token is required for the interactive map — get a free token at [mapbox.com](https://www.mapbox.com/) (50,000 map loads/month, no credit card).

> The matching engine (`MATCHING_ENGINE_URL`) is optional for local dev — the `/api/match-donors` route falls back to a built-in SQL proximity function when the Python engine is unreachable.

### 3. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔗 Matching Engine Integration

The Python FastAPI matching engine is a **separate microservice** deployed on Render. The Next.js backend proxies all matching requests through `/api/match-donors` — **frontend components never call the Python engine directly**.

```
Frontend Component (Thinzar)
      ↓  fetch('/api/match-donors', { method: 'POST', body: ... })
/api/match-donors          ← Next.js API Route (Thaw Ye Zaw)
      ↓  HTTP POST (X-API-Key auth)
Python FastAPI (Render)    ← Scoring & ranking engine
```

### Connection settings

| Env Var | Where | Required? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel + local | Yes |
| `MATCHING_ENGINE_URL` | Vercel only | No (falls back to SQL) |
| `MATCHING_ENGINE_API_KEY` | Vercel only | No (only if engine is deployed) |

When **both** env vars are set, the Next.js API route calls the Python engine. Otherwise it uses the `find_nearby_donors` Postgres RPC (exact blood-type match + distance sort).

---

## 👥 Team

| Name | Role | Domain |
|---|---|---|
| **Thaw Ye Zaw** | Full Stack Engineer | Supabase schema, API routes, backend logic, Python matching engine |
| **Thinzar Kyaw** | Full Stack Engineer | Next.js components, Tailwind UI, Mapbox integration, frontend state |
| **Zyy Lin Htet** | UI/UX Designer | Figma designs, design system, visual assets |

---

## 📁 Project Structure

```
LifeLink/
├── src/
│   ├── app/                    # Next.js App Router pages & layouts (Thinzar)
│   │   ├── api/               # API routes & matching engine proxy (Thaw Ye Zaw)
│   │   │   ├── hospitals/     # GET — approved hospital list
│   │   │   ├── map-data/      # GET — hospitals, requests & donors for the map
│   │   │   ├── match-donors/  # POST — donor matching (Python engine proxy)
│   │   │   ├── profile/       # GET/PUT — user profile
│   │   │   └── requests/      # GET/POST — blood requests
│   │   ├── broadcast/         # Emergency broadcast page
│   │   ├── command/           # Command center dashboard
│   │   ├── inventory/         # Blood inventory page
│   │   ├── map/               # Medical map page
│   │   └── passport/          # Donor passport page
│   ├── components/            # Reusable React UI components (Thinzar)
│   │   └── map/               # Mapbox map, markers, legend, info windows
│   └── utils/supabase/        # DB types, queries, real-time subs (Thaw Ye Zaw)
├── supabase/migrations/       # Database migrations (Thaw Ye Zaw)
├── public/                    # Static assets & screenshots (Zyy Lin Htet)
├── .env.example               # Environment variable template
├── API.md                     # Full API reference for AI agents
└── AGENTS.md                  # Mandatory AI code-generation rules
```

---
## 📄 License

MIT — Built with ❤️ for the hackathon.
