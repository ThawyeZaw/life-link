# LifeLink — Design System

> **Single Source of Truth** for the visual identity, UI components, and UX principles of LifeLink — the real-time emergency blood donation platform for Myanmar.
>
> Maintained by **Zay Lynn Htet** (UI/UX Design) & **Thinzar Kyaw** (Frontend / UI).
> Every token in this document maps directly to **Tailwind CSS utility classes**. No custom CSS, no raw hex values in components.

---

## 1. Brand Identity & Design Principles

### Core Visual Ethos

| Principle | Meaning | Design Expression |
|---|---|---|
| **Trust** | Users hand us life-or-death moments | Verified badges, clean whites, generous whitespace, consistent geometry (`rounded-2xl`) |
| **Urgency** | Seconds matter in blood dispatch | High-contrast red CTAs, pulsing LIVE indicators, color-coded urgency chips |
| **Clarity** | Panicked users must never be confused | One primary action per screen, `text-base`+ body copy, explicit labels over icons alone |
| **Modernity** | World-class feel earns credibility | Apple Liquid Glass, editorial typography, staggered overlapping cards |

### The Apple Liquid Glass Aesthetic

LifeLink uses a three-tier Apple-inspired glassmorphism system with water-softened blue undertones — evoking cleanliness, calm, and a premium healthcare feel.

**Depth layering system:**

| Tier | Class | Blur | Opacity | Usage |
|---|---|---|---|---|
| Surface | `.glass-surface` | 20px | 72% | Base translucent backgrounds, tab panels |
| Elevated | `.glass-elevated` | 24px | 78% | Raised cards, feature section overlays |
| Overlay | `.glass-overlay` | 28px | 88% | Stat cards over imagery, highest depth |

```tsx
// Canonical glass overlay (stat cards, hero overlays)
<div className="glass-overlay rounded-2xl p-6">
  <p className="text-4xl font-extrabold text-gray-900">97%</p>
  {/* light-refraction highlight */}
  <div className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
</div>
```

**Rules of use:**
- Glass surfaces ONLY over imagery, gradients, or colored backgrounds — never glass-on-white.
- Inner pills on glass use `.glass-pill` (`bg-white/55 backdrop-blur saturate`).
- Each glass tier includes an inner highlight box-shadow (`inset 0 0 0 1px rgba(255,255,255,0.5)`) simulating light refraction.
- Overlap anchors: offset glass cards with negative positioning (`absolute -bottom-8 -left-8`) to create depth.
- All `backdrop-filter` declarations have `-webkit-` prefixed fallbacks for Safari compatibility.

### Water-Inspired Background Palette

| Class | Usage |
|---|---|
| `bg-water-gradient` | Full-page: multi-radial blue gradients with linear falloff |
| `bg-water-subtle` | Section: softer radial + linear blue/indigo blend |
| `.water-ripple` | Decorative `::before` pseudo-element with 3 radial gradient "ripples" |

```css
/* water-inspired soft blue undertones (globals.css) */
--water-gradient-start: #eef6ff;
--water-gradient-mid: #f0f9ff;
--water-gradient-end: #f8fafc;
```

---

## 2. Color System (Tailwind Mapped)

### 2.1 Primary Brand — LifeLink Red

| Intent | Tailwind Class | Usage |
|---|---|---|
| Primary CTA | `bg-red-600` | All primary buttons ("I Need Blood Now", "Login / Join") |
| CTA hover | `hover:bg-red-700` | Hover state on primary CTAs |
| CTA glow shadow | `shadow-md shadow-red-500/25` | Floating pill CTAs, hero CTAs |
| Accent text / links | `text-red-600` | Active tabs, inline links, highlighted labels |
| Soft brand surface | `bg-red-50` | Pill badges, icon backgrounds, hover tints |
| Icon chip | `bg-red-100 text-red-600` | Feature card icon containers |
| Focus ring | `focus:ring-2 focus:ring-red-500` | Universal interactive focus state |

### 2.2 Surfaces & Backgrounds

| Intent | Tailwind Class | Usage |
|---|---|---|
| App background | `bg-water-gradient` / `bg-gray-50` | Full page background |
| Card surface | `.glass-elevated` / `bg-white` | Standard and glass cards |
| Glass overlay | `.glass-overlay` | Stat cards over imagery |
| Glass inner pill | `.glass-pill` | Tags/pills inside glass cards |
| Nav pill | `.glass-overlay rounded-full` | Curved floating bottom navigation |
| Nav pill (mobile dropdown) | `bg-white/92 backdrop-blur-2xl border-white/50 rounded-2xl` | Upward-opening mobile menu |
| Modal scrim | `bg-black/50` | Auth modal backdrop |

### 2.3 Semantic / Status Colors — Request Board Urgency

| Urgency Level | Badge Classes | Icon |
|---|---|---|
| `CRITICAL` | `bg-red-100 text-red-700 border border-red-200` | `AlertTriangle` |
| `URGENT` | `bg-amber-100 text-amber-700 border border-amber-200` | `Clock` |
| `STANDARD` | `bg-green-100 text-green-700 border border-green-200` | `Activity` |

| Other Semantic Intent | Tailwind Classes |
|---|---|
| Success / Verified / LIVE | `bg-emerald-100 text-emerald-700` + `animate-pulse` dot (`bg-emerald-500`) |
| Donor identity accent | `text-emerald-600` / `bg-emerald-100` |
| Info / neutral metadata | `text-gray-500` |
| Disabled | `disabled:opacity-50` or `disabled:opacity-60` |

**Text hierarchy:**

| Role | Class |
|---|---|
| Headings | `text-gray-900` |
| Body (on glass) | `text-slate-600` |
| Body (on white) | `text-gray-600` |
| Secondary / captions | `text-gray-500` |
| Placeholder / disabled | `text-gray-400` |

---

## 3. Typography

### 3.1 Font Stack

| Layer | Font | Tailwind Setup |
|---|---|---|
| Primary UI | **Inter** (400–800) | Loaded via `next/font/google`, exposed as `--font-inter` |
| Myanmar script fallback | **Noto Sans Myanmar** | Recommended addition for Burmese copy legibility |
| System fallback | `system-ui, -apple-system, sans-serif` | Declared in `globals.css` body rule |

> **Burmese legibility rules:** Myanmar script has taller glyphs and stacked diacritics. For any Burmese copy: use `leading-relaxed` minimum (never `leading-tight`), avoid `text-xs`, and never apply `tracking-tight` to Burmese strings.

### 3.2 Heading Hierarchy

| Level | Tailwind Classes | Usage |
|---|---|---|
| Display / `h1` (marketing) | `text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900` | Hero headlines |
| `h1` (app pages) | `text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900` | Page titles |
| `h1` (dashboard) | `text-xl md:text-2xl font-black text-vr-navy` | Operational page headers |
| `h2` | `text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900` | Section headers |
| `h3` | `text-lg font-bold text-gray-900` | Card titles |
| `h4` | `text-base font-bold text-vr-navy` | Widget/list item titles |

### 3.3 Body & Support Text

| Role | Tailwind Classes |
|---|---|
| Lead paragraph | `text-base md:text-lg leading-relaxed text-slate-600` |
| Body | `text-base leading-relaxed text-slate-600` |
| Secondary | `text-sm text-gray-500` |
| Caption / meta | `text-xs text-gray-400` |
| Badge text | `text-xs font-semibold` |

**A11y minimum:** primary content is never below `text-base` on mobile; `text-sm` is reserved for secondary metadata only.

---

## 4. Navigation System

### 4.1 Curved Floating Navigation Pill (Site-Wide)

The `Navbar` component is rendered once in `src/app/layout.tsx` after `{children}`, making it available on **every page**. It is a fixed bottom-positioned glass capsule with `rounded-full` styling.

**States:**

| State | Class | Behavior |
|---|---|---|
| Default | `fixed bottom-5 left-1/2 -translate-x-1/2 z-50` | Centered floating pill |
| Scroll down | `translate-y-24 opacity-0` | Hides to save vertical space |
| Scroll up | `translate-y-0 opacity-100` | Reappears for quick access |

**Route-aware link sets:**

| Route Context | Links Shown | CTA |
|---|---|---|
| Public (`/`, `/about`, `/services`, `/team`, `/contact`) | About, Services, Our Team, Contact | Login / Join (red pill button) |
| App (`/dashboard`, `/passport`, `/broadcast`, `/inventory`, `/map`, `/command`) | Request Board, Donor Passport, Broadcast, Inventory, Live Map | Dashboard + Logout |

**Mobile:** hamburger icon opens menu upward from the pill (`bottom-full mb-3`), with glass dropdown styling.

```tsx
// The canonical floating nav pill inner capsule
<div className="glass-overlay flex items-center gap-1 rounded-full px-3 py-2 shadow-2xl shadow-slate-900/10 sm:gap-2 sm:px-4 sm:py-2.5">
  {/* nav links + divider + CTA/actions + hamburger */}
</div>
```

### 4.2 No Sidebar

The dashboard sidebar has been removed. The floating pill serves as the exclusive site-wide navigation. All dashboard-related links appear in the pill when on any app route.

### 4.3 Per-Section Top Bars

| Component | Usage | Routes |
|---|---|---|
| `DonorTopBar` | Donor-facing header with title | `/passport`, `/map` |
| `HospitalTopBar` | Hospital-facing header | `/broadcast`, `/inventory`, `/command` |

These are page-context headers only — they do not participate in site-wide navigation.

---

## 5. UI Component Library (Code-Ready Specs)

### 5.1 Buttons

All buttons enforce `min-h-[44px]` and the universal focus ring.

**Primary — Pill CTA (with floating animation):**

```tsx
<button className="animate-float-cta group flex min-h-[44px] items-center gap-2 rounded-full bg-red-600 px-8 py-4 font-semibold text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500 active:scale-95">
  I Need Blood Now
  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
</button>
```

**Secondary (outline):**

```tsx
<button className="flex min-h-[44px] items-center gap-2 rounded-full border border-gray-200 px-5 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
  Logout
</button>
```

**Icon-only (hamburger, close):**

```tsx
<button aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-red-500">
  <X className="h-5 w-5" />
</button>
```

### 5.2 Cards & Containers

**Glass elevated card (features, testimonials):**

```tsx
<div className="glass-elevated rounded-2xl p-8 transition-all duration-300 hover:float-card">
  {/* content */}
</div>
```

**Glass overlay stat card (hero):**

```tsx
<div className="glass-overlay absolute -bottom-8 left-2 w-72 rounded-2xl p-6 sm:-left-8">
  <p className="text-4xl font-extrabold text-gray-900">97%</p>
  <p className="mt-1 text-sm font-medium text-gray-600">of urgent requests matched within the hour</p>
  <div className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
</div>
```

**Glass surface panel (tab groups):**

```tsx
<div className="glass-surface rounded-2xl p-1" role="tablist">
  {/* tab buttons */}
</div>
```

**Glass inner pill:**

```tsx
<span className="glass-pill rounded-full px-3 py-1 text-xs font-medium text-gray-700">O+</span>
```

### 5.3 Floating Animations

| Animation Class | Duration | Effect |
|---|---|---|
| `animate-float-subtle` | 4s infinite | Gentle 3px vertical float + shadow pulse |
| `animate-float-cta` | 3.5s infinite | 4px vertical float + scale(1.02) + red shadow glow |
| `hover:float-card` | 0.4s on hover | 6px lift + 32px shadow expansion |

All animations respect `prefers-reduced-motion: reduce` — disabled via `animation: none !important`.

### 5.4 Badges & Pills

**Blood type badge:**

```tsx
<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-base font-black text-red-600">O+</span>
```

**Urgency badge:**

```tsx
<span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200">CRITICAL</span>
```

**Marketing glass pill badge:**

```tsx
<span className="glass-pill inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-red-600">
  Trusted by 1,200+ Donors
</span>
```

---

## 6. UX & Interaction Guidelines

### 6.1 Mobile-First Layout System

**Breakpoint strategy:** design at 375px first; enhance upward. Never design desktop-first.

| Pattern | Mobile (default) | `md:` | `lg:` |
|---|---|---|---|
| Content grid | `grid-cols-1` | `md:grid-cols-2` / `md:grid-cols-3` | `lg:grid-cols-3` |
| Dashboard | single column | — | `lg:grid-cols-3` (board `lg:col-span-2` + rail) |
| Auth modal | bottom sheet | — | centered dialog |
| Nav pill links | hidden (hamburger) | — | visible inline |

**Spacing tokens:**

| Token | Usage |
|---|---|
| `px-5 md:px-8` | Page horizontal padding |
| `py-16` / `py-20 lg:py-32` | Section vertical rhythm |
| `gap-4` / `gap-8` | Card grid gaps |
| `max-w-6xl mx-auto` | Global content width |

**Touch targets:** every interactive element is `min-h-[44px]`. Full-width form CTAs use `min-h-[48px]`.

### 6.2 Loading & Empty States

**Spinner gate (auth checks):**

```tsx
<div className="flex min-h-[60vh] items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
</div>
```

**Empty state:**

```tsx
<div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
  <Droplets className="mx-auto h-8 w-8 text-gray-300" />
  <p className="mt-3 text-base font-semibold text-gray-500">No active requests right now</p>
  <p className="mt-1 text-sm text-gray-400">New urgent requests will appear here instantly.</p>
</div>
```

### 6.3 Authentication UX

1. **Trigger:** "I Need Blood Now" or Nav pill "Login / Join" → opens `AuthModal`. No public link ever routes directly to `/dashboard`.
2. **Modal anatomy:** Sign In / Sign Up tabs + Developer Demo Login cards. Bottom sheet on mobile, elevated dialog on `sm:`+.
3. **Guarding:** `/dashboard` content renders inside `DashboardGuard` — no session → `router.replace("/")`.
4. **Logout:** clear session artifacts, `router.replace("/")`.

### 6.4 Localized Content Rules

All mock/placeholder data must be realistic and Myanmar-localized (per `AGENTS.md` Rule 6):

- **Hospitals:** Yangon General Hospital, Asia Royal Hospital, Pun Hlaing Siloam Hospital, Parami Hospital.
- **Names:** Ko Aung, Ma Thida, U Kyaw Zin, Daw Hnin.
- **Townships:** Sanchaung, Mingalar Taung Nyunt, Bahan, Hlaing Tharyar, Mayangone.
- **Blood types:** O+, A+, B+, AB+, O-, A-, B-, AB-.
- **Urgencies:** `CRITICAL`, `URGENT`, `STANDARD` — always uppercase in badges.

---

*Last updated: July 2026 — LifeLink Hackathon Team (Zay Lynn Htet · Thinzar Kyaw)*
