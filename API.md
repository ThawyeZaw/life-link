# Vertex Red — Backend API Reference

> **For frontend AI agents (Thinzar's domain).** Every endpoint, type, and database
> function available to build the UI against. All endpoints require authentication.
> Base URL: `/api`

---

## Quick Start for AI Agents

```ts
// Import everything you need from one place:
import {
  // Types
  type RequestWithDetails,
  type Hospital,
  type MatchDonorsRequest,
  type MatchDonorsResponse,
  type CreateRequestRequest,
  
  // Client-side query helpers (call directly from components)
  getActiveRequests,
  getApprovedHospitals,
  getMyMatches,
  getMyProfile,
  subscribeToRequests,    // real-time
  subscribeToMessages,    // real-time
} from '@/utils/supabase';
```

---

## Database Schema

### `profiles` — Donor/Requester profiles (extends `auth.users`)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Linked to auth.users |
| `full_name` | TEXT | Required |
| `phone` | TEXT | Nullable |
| `blood_type` | BloodType | One of 8 types |
| `township` | TEXT | Yangon/Mandalay township |
| `is_available` | BOOL | Default false, donor toggles |
| `hide_medical_info` | BOOL | Masks sensitive fields in public_profiles view |
| `lat`, `lng` | DOUBLE | GPS coordinates |
| `date_of_birth` | DATE | Nullable |
| `weight_kg` | NUMERIC | Nullable |
| `medical_conditions` | TEXT[] | Nullable |

### `hospitals` — Verified medical facilities (202 hospitals seeded)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `name` | TEXT | English name |
| `name_mya` | TEXT | Myanmar name |
| `township` | TEXT | Township |
| `address` | TEXT | Full address |
| `phone` | TEXT | Hospital phone |
| `lat`, `lng` | DOUBLE | GPS (required) |
| `verification_status` | VerificationStatus | PENDING / APPROVED / REJECTED |

### `requests` — Blood & medical supply emergency requests
| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `requester_id` | UUID FK | → profiles |
| `hospital_id` | UUID FK | → hospitals (nullable) |
| `request_type` | RequestType | BLOOD / MEDICAL_SUPPLY |
| `blood_type` | BloodType | Required if type=BLOOD |
| `supply_details` | TEXT | Required if type=MEDICAL_SUPPLY |
| `units_needed` | INT | Default 1, positive |
| `urgency` | Urgency | CRITICAL / URGENT / STANDARD |
| `status` | RequestStatus | OPEN → IN_PROGRESS → FULFILLED / EXPIRED |
| `township`, `lat`, `lng` | Various | Location (nullable) |
| `expires_at` | TIMESTAMPTZ | Default +24h |

### `matches` — Donor-to-request matching records
### `messages` — In-app chat between matched parties
### `notifications` — In-app alert system (auto-created by DB triggers)

---

## Enums

```ts
type BloodType      = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
type Urgency        = 'CRITICAL' | 'URGENT' | 'STANDARD';
type RequestStatus  = 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'EXPIRED';
type RequestType    = 'BLOOD' | 'MEDICAL_SUPPLY';
type MatchStatus    = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
type NotificationType = 'MATCH_FOUND' | 'REQUEST_UPDATE' | 'NEW_REQUEST' | 'CHAT_MESSAGE';
```

---

## API Endpoints

All endpoints return JSON. Auth errors return `{ error: string }` with status 401.

### `GET /api/hospitals`
Returns all approved hospitals (202 total across Yangon & Mandalay).

**Auth:** Required  
**Response 200:**
```json
{
  "hospitals": [
    {
      "id": "uuid",
      "name": "Yangon General Hospital (YGH)",
      "name_mya": "ရန်ကုန်ပြည်သူ့ဆေးရုံကြီး",
      "township": "Mingalar Taung Nyunt",
      "address": "Yangon, Yangon (West) District",
      "phone": "01-256112",
      "lat": 16.7789,
      "lng": 96.1617,
      "verification_status": "APPROVED",
      "created_at": "2026-07-16T00:00:00Z",
      "updated_at": "2026-07-16T00:00:00Z"
    }
  ]
}
```

---

### `POST /api/match-donors`
Finds compatible donors near a request location. Proxies to Python matching engine (prod) or uses `find_nearby_donors` RPC (dev fallback).

**Auth:** Required  
**Request Body:**
```json
{
  "requestId": "uuid-of-request",
  "bloodType": "O+",
  "location": { "lat": 16.7789, "lng": 96.1617 }
}
```
**Response 200:**
```json
{
  "donors": [
    {
      "id": "uuid",
      "full_name": "Ko Aung",
      "phone": "09123456789",
      "blood_type": "O+",
      "township": "Sanchaung",
      "distance_km": 3.2,
      "lat": 16.8147,
      "lng": 96.1345
    }
  ]
}
```

---

### `GET /api/profile`
Returns the authenticated user's full profile.

**Auth:** Required  
**Response 200:**
```json
{
  "profile": {
    "id": "uuid",
    "full_name": "Ko Aung",
    "phone": "09123456789",
    "blood_type": "O+",
    "township": "Sanchaung",
    "is_available": true,
    "lat": 16.8147,
    "lng": 96.1345,
    "medical_conditions": [],
    "hide_medical_info": false
  }
}
```

---

### `PUT /api/profile`
Update the authenticated user's profile. Send only the fields to change.

**Auth:** Required  
**Request Body (partial):**
```json
{
  "phone": "09123456780",
  "township": "Bahan",
  "is_available": false
}
```
**Response 200:** `{ "profile": { ... } }` (full updated profile)

---

### `GET /api/requests?urgency=CRITICAL`
Returns active (OPEN/IN_PROGRESS, not expired) requests. Optional `urgency` filter.

**Auth:** Required  
**Query Params:** `urgency` (optional) — CRITICAL | URGENT | STANDARD  
**Response 200:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "requester_id": "uuid",
      "hospital_id": "uuid|null",
      "request_type": "BLOOD",
      "blood_type": "O+",
      "units_needed": 3,
      "urgency": "CRITICAL",
      "status": "OPEN",
      "township": "Mingalar Taung Nyunt",
      "expires_at": "2026-07-17T00:00:00Z",
      "created_at": "2026-07-16T00:00:00Z",
      "requester": {
        "id": "uuid",
        "full_name": "Daw Hnin",
        "phone": "09123456782",
        "blood_type": "AB+"
      },
      "hospital": {
        "id": "uuid",
        "name": "Yangon General Hospital (YGH)",
        "township": "Mingalar Taung Nyunt",
        "phone": "01-256112"
      }
    }
  ]
}
```

---

### `POST /api/requests`
Create a new blood or medical supply request.

**Auth:** Required  
**Request Body:**
```json
{
  "requestType": "BLOOD",
  "bloodType": "O+",
  "unitsNeeded": 3,
  "urgency": "CRITICAL",
  "township": "Mingalar Taung Nyunt",
  "lat": 16.7789,
  "lng": 96.1617,
  "hospitalId": "uuid-or-null"
}
```
**Response 201:** `{ "request": { ... } }` (full request object)

---

## Client-Side Query Helpers

Available directly in components (import from `@/utils/supabase`). No need to call the API routes for these — they talk to Supabase directly.

```ts
// Profiles
getMyProfile()                         => Profile
updateMyProfile(updates)              => Profile
getAvailableDonors(bloodType?)        => Profile[]

// Hospitals
getApprovedHospitals()                => Hospital[]
submitHospital(hospital)              => Hospital

// Requests
getActiveRequests()                   => RequestWithDetails[]
getRequestsByUrgency(urgency)        => RequestWithDetails[]
createRequest(req)                    => Request
updateRequestStatus(requestId, status) => Request

// Matches
getMyMatches()                        => MatchWithDetails[]
updateMatchStatus(matchId, status)    => Match

// Messages
getMatchMessages(matchId)             => MessageWithSender[]
sendMessage(matchId, content)         => Message

// Notifications
getMyNotifications()                  => Notification[]
markNotificationRead(notificationId)  => void

// Real-time Subscriptions (returns unsubscribe function)
subscribeToRequests(onInsert, onUpdate)    => RealtimeChannel
subscribeToMessages(matchId, onInsert)     => RealtimeChannel
subscribeToNotifications(userId, onInsert) => RealtimeChannel
```

---

## Real-Time Channels

Supabase real-time is enabled on 5 tables. The frontend can subscribe to:

| Table | Events | Use Case |
|---|---|---|
| `requests` | INSERT, UPDATE | Live request feed |
| `profiles` | UPDATE | Donor availability changes |
| `matches` | INSERT, UPDATE | New match alerts |
| `messages` | INSERT | In-app chat |
| `notifications` | INSERT | Push-style alerts |

---

## Auto-Notification Triggers (server-side)

These fire automatically in the database — no API calls needed:

| Trigger | When | Who Gets Notified |
|---|---|---|
| `notify_donor_on_match` | Match INSERT | The matched donor |
| `notify_requester_on_status_change` | Request status UPDATE | The requester |
| `notify_available_donors_on_request` | CRITICAL/URGENT blood request INSERT | Available donors with matching blood type in same township |

---

## Auth Flow

1. User signs up/in via Supabase Auth (client-side `supabase.auth.signInWithOtp` or `signUp`)
2. `auth.users` INSERT triggers `handle_new_user()` → auto-creates a `profiles` row
3. `src/middleware.ts` refreshes the auth session cookie on every request
4. All API routes call `supabase.auth.getUser()` — return 401 if not authenticated
5. RLS policies enforce row-level access (users see only their own data except public profiles)

---

## File Map for AI Agents

```
src/
├── middleware.ts                    # Auth session refresh
├── utils/supabase/
│   ├── index.ts                     # ⭐ BARREL EXPORT — import everything from here
│   ├── types.ts                     # All TypeScript types
│   ├── queries.ts                   # Client-side query helpers + real-time subs
│   ├── client.ts                    # Browser Supabase client
│   ├── server.ts                    # Server Supabase client
│   └── middleware.ts                # Middleware Supabase client helper
├── app/api/
│   ├── hospitals/route.ts           # GET — approved hospitals list
│   ├── match-donors/route.ts        # POST — donor matching proxy
│   ├── profile/route.ts             # GET/PUT — user profile
│   └── requests/route.ts            # GET/POST — blood requests
supabase/migrations/
├── 20260716000000_initial_schema.sql       # All tables, RLS, indexes, triggers (v00001)
├── 20260716000400_fix_myanmar_encoding.sql # 196 hospitals with bilingual names (v00005)
└── 20260716000500_notifications_and_*.sql  # Donor matching RPC + notification triggers (v00006)
```
