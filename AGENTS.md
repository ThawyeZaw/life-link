# AGENTS.md — AI Code Generation Rules for LifeLink

> These are the **mandatory system instructions** for any AI assistant (GitHub Copilot, Cursor, Gemini, Claude, etc.) generating code in this repository. All rules are **non-negotiable** and apply to every code generation request unless the user explicitly overrides a specific rule in their prompt.

---

## 🏗️ Project Context

**LifeLink** is a real-time emergency platform connecting blood donors, hospitals, and urgent medical needs across Myanmar. It is built with:
- **Next.js** (App Router) — frontend framework
- **Tailwind CSS** — all styling (utility-first, mobile-first)
- **Lucide React** — icon library
- **Supabase** — PostgreSQL database, real-time subscriptions, and auth
- **Mapbox GL JS** — interactive maps
- **Python (FastAPI)** — external matching engine microservice

---

## 👥 Team Domain Map

| Team Member | Domain | Allowed Directories |
|---|---|---|
| **Thaw Ye Zaw** | Backend / Database | `/lib/supabase/`, `/api/`, `/utils/` |
| **Thinzar Kyaw** | Frontend / UI | `/app/`, `/components/`, `/styles/` |
| **Zyy Lin Htet** | UI/UX Design | `/public/` (assets only) |

---

## 📋 Mandatory Rules

### Rule 1 — No External CSS Files
**Styling MUST use Tailwind CSS utility classes exclusively.**

- ❌ Do NOT create or modify `.css` files (except `/styles/globals.css` for Tailwind's base directives `@tailwind base/components/utilities` only).
- ❌ Do NOT use inline `style={{}}` props unless for values that Tailwind cannot express (e.g., dynamic pixel values from JavaScript variables).
- ❌ Do NOT import any third-party CSS library (e.g., Bootstrap, Bulma).
- ✅ Use Tailwind utility classes directly on JSX elements.
- ✅ Use `cn()` or `clsx()` for conditional class composition.

```tsx
// ✅ Correct
<div className="flex items-center gap-4 rounded-xl bg-red-600 px-4 py-2 text-white">

// ❌ Wrong
<div style={{ display: 'flex', backgroundColor: 'red' }}>
```

---

### Rule 2 — Strict Domain Boundary Enforcement

AI MUST respect the team's domain split at all times.

#### Frontend Prompts (UI, components, pages, layout, styling):
- ✅ **Only edit files in:** `/app/`, `/components/`, `/styles/`
- ❌ Do NOT touch `/lib/supabase/`, `/api/`, `/utils/`, or any Python files.

#### Backend / Database Prompts (schema, queries, API routes, server logic):
- ✅ **Only edit files in:** `/lib/supabase/`, `/api/`, `/utils/`
- ❌ Do NOT touch `/app/`, `/components/`, or `/styles/`.

#### Cross-Boundary Tasks:
If a task unavoidably touches **both** frontend and backend domains (e.g., wiring up a new full-stack feature):
1. Complete both sides of the implementation.
2. Add a `// ⚠️ CROSS-BOUNDARY:` comment at the top of every file that crosses its domain.
3. Include a warning note in your response flagging which files belong to which domain owner.

```tsx
// ⚠️ CROSS-BOUNDARY: This file is in Thinzar's domain but references a Supabase
// query defined by Thaw Ye Zaw. Review with both owners before merging.
```

---

### Rule 3 — Never Overwrite Database Initialization Files Without Explicit Permission

The following files are **protected** and MUST NOT be modified without the user typing an explicit override phrase (e.g., `"override db init"`):

- `/lib/supabase/schema.sql`
- `/lib/supabase/seed.sql`
- `/lib/supabase/migrations/*.sql`
- `/lib/supabase/client.ts`

If a prompt implies changes to these files, **stop and ask for confirmation** before proceeding.

---

### Rule 4 — Modular, Functional React Components

- ✅ Every component MUST be a **functional component** using arrow function syntax.
- ✅ Keep each component file **under 150 lines**. If it exceeds this, split into sub-components.
- ✅ One component per file. Name the file identically to the component (e.g., `DonorCard.tsx` exports `DonorCard`).
- ✅ Use **named exports** for all components (not default exports, unless required by Next.js page conventions).
- ❌ Do NOT use class-based React components.
- ❌ Do NOT write logic-heavy components. Extract business logic into custom hooks (`/hooks/`) or utility functions (`/utils/`).

```tsx
// ✅ Correct — small, focused, named export
export const DonorCard = ({ donor }: DonorCardProps) => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      {/* ... */}
    </div>
  );
};
```

---

### Rule 5 — Mobile-First Design Philosophy

All UI components MUST be designed **mobile-first** using Tailwind's responsive prefixes.

- ✅ Start with mobile styles (no prefix), then layer up: `sm:`, `md:`, `lg:`, `xl:`.
- ✅ Default to single-column layouts on mobile; use grid/flex expansion at `md:` and above.
- ✅ Minimum touch target size: **44×44px** for all interactive elements (buttons, links, map pins).
- ✅ Prefer `text-base` or larger for body text on mobile (never below `text-sm` for primary content).
- ❌ Do NOT design desktop-first and then try to shrink down.

```tsx
// ✅ Correct — mobile-first grid
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

// ❌ Wrong — desktop-first
<div className="grid grid-cols-3 gap-4">
```

---

### Rule 6 — Localized, Realistic Placeholder Data

When generating mock data, seed data, or placeholder content, ALWAYS use realistic, Myanmar-localized data.

#### Blood Types (use realistic distribution):
`O+`, `A+`, `B+`, `AB+`, `O-`, `A-`, `B-`, `AB-`

#### Example Hospitals (Yangon):
- Yangon General Hospital (YGH), Mingalar Taung Nyunt
- Thukha Yeik Mon Specialist Hospital, Sanchaung
- Asia Royal Hospital, Bahan
- Pun Hlaing Siloam Hospital, Hlaing Tharyar
- Parami Hospital, Mayangone
- No. 2 Military Hospital, North Okkalapa

#### Example Donor Names:
Use common Myanmar names (e.g., Ko Aung, Ma Thida, U Kyaw Zin, Daw Hnin).

#### Example Locations:
Use real Yangon townships (e.g., Sanchaung, Bahan, Tamwe, Hlaing, Kamayut, Insein).

#### Example Request Urgencies:
`CRITICAL`, `URGENT`, `STANDARD`

```ts
// ✅ Correct placeholder
const mockRequest = {
  id: "req-001",
  hospital: "Yangon General Hospital",
  bloodType: "O+",
  urgency: "CRITICAL",
  township: "Mingalar Taung Nyunt",
  unitsNeeded: 3,
  postedAt: new Date().toISOString(),
};
```

---

### Rule 7 — Python Matching Engine Interface Contract

The Python matching engine is an **external microservice**. The following constraints are absolute:

- ❌ **NEVER call the Python matching engine directly from frontend components or client-side code.**
- ✅ All matching engine calls MUST be proxied through a **Next.js API route** in `/api/`.
- ✅ The API route acts as the single gateway between the frontend and the Python service.
- ✅ The matching engine accepts and returns JSON. Document the expected request/response shapes in the API route file using JSDoc or TypeScript interfaces.

```
Frontend Component
      ↓  (fetch)
/api/match-donors      ← Next.js API Route (Thaw Ye Zaw's domain)
      ↓  (HTTP POST)
Python FastAPI Service  ← External microservice
```

```ts
// /api/match-donors/route.ts
// Request body: { requestId: string; bloodType: string; location: { lat: number; lng: number } }
// Response:     { donors: Array<{ id: string; name: string; distanceKm: number; bloodType: string }> }
```

---

## ⚡ Quick Reference Checklist

Before submitting any generated code, verify:

- [ ] Styling uses only Tailwind utility classes
- [ ] File is within the correct domain boundary
- [ ] Component is functional and under 150 lines
- [ ] Layout starts mobile-first (no unprefixed desktop-only classes)
- [ ] Placeholder data uses Myanmar-localized, realistic values
- [ ] No direct calls to the Python matching engine from the frontend
- [ ] Database init files were not modified without explicit permission

---

*Last updated: July 2026 — LifeLink Hackathon Team*
