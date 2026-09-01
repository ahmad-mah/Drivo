<div align="center">

# Drivo

**Full-stack ride-hailing MVP — React Native + Express + PostgreSQL**

<p align="center">

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo) ![React_Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript) ![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite) ![Clerk](https://img.shields.io/badge/Clerk-000000?style=for-the-badge&logo=clerk) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql) ![Neon](https://img.shields.io/badge/Neon-000000?style=for-the-badge&logo=neon) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io)

</p>

Real-time ride matching, live GPS tracking, driver dispatch with offer/accept/timeout — a complete Uber-like system in a single repository.

[Getting Started](#getting-started) · [Architecture](#architecture) · [API Reference](#api-reference) · [WebSocket Events](#websocket-events) · [Screenshots](#screenshots)

</div>

---

## Overview

Drivo is a ride-hailing MVP combining a driver mode (sign up → get approved → go online → stream location) with a rider flow (pick destination → see nearby cars → request ride → get matched). An admin dashboard provides a real-time overview — KPIs, alerts, and a ride queue — plus full CRUD for trips, drivers, users, payments, promos, support tickets, and audit logs. Supports English and Arabic (RTL).

**Mobile App (Expo React Native) — riders + drivers**

```
┌──────────────┐   HTTP + JWT   ┌──────────────┐   Prisma   ┌────────────┐
│  Mobile App  │ ────────────→  │              │ ─────────→ │ PostgreSQL │
│  (Expo RN)   │ ←────────────  │  Express API │ ←───────── │  (Neon)    │
│  rider +     │                │  (Backend)   │            └────────────┘
│  driver mode │                │              │
└──────┬───────┘                └──────┬───────┘
       │ socket.io                     │
       │ (ride offers, status,        │
       │  nearby drivers, ETA)         │
       └──────────────────────────────┘
```

**Admin Panel (React 19) — separate client, same backend**

```
┌──────────────┐   HTTP + JWT   ┌──────────────┐   Prisma   ┌────────────┐
│  Admin Panel │ ────────────→  │  Express API │ ─────────→ │ PostgreSQL │
│  (React 19)  │ ←────────────  │  (Backend)   │ ←───────── │  (Neon)    │
│  Vite SPA    │                │              │            └────────────┘
└──────┬───────┘                └──────┬───────┘
       │ socket.io                     │
       │ (drivers:locations snapshot,  │
       │  admin:overview:update,       │
       │  admin:ride:updated,          │
       │  admin:alert)                 │
       └──────────────────────────────┘
```

Both clients talk to the same Express API. Drivers stream location via socket.io → server throttles broadcasts → admin receives the 1s snapshot for the live map, KPIs, and alerts.

## Screenshots

### Mobile App — Rider & Driver Flow

| Step | Screen | Description |
|------|--------|-------------|
| **1** | ![Splash](demo/mobile/1-splash.png) | App entry point with brand logo |
| **2** | ![Onboarding 1](demo/mobile/2-onboarding.png) | 3-slide onboarding carousel |
|  | ![Onboarding 2](demo/mobile/2-onboarding2.png) | Feature highlights & permissions |
|  | ![Onboarding 3](demo/mobile/2-onboarding3.png) | Final slide → Welcome |
| **3** | ![Welcome](demo/mobile/3-welcome.png) | Role selection: Rider / Driver |
| **4** | ![Sign In](demo/mobile/4-auth_signin.png) | Clerk-powered email/password sign in |
|  | ![Google Sign In](demo/mobile/4-sign_in_with_google.png) | OAuth via Google |
|  | ![Sign Up](demo/mobile/4-auth_signup.png) | New account creation |
| **5** | ![Home](demo/mobile/6-home.jpg) | Map with nearby drivers, destination input, recent rides |
| **6** | ![Ride Request](demo/mobile/rider_request_driver.jpg) | Pick destination, fare estimate, confirm ride |
| **7** | ![Waiting](demo/mobile/rider_driver_waiting.jpg) | Real-time "finding driver" with nearby cars |
| **8** | ![Driver Accepts](demo/mobile/rider_driver_accepts.jpg) | Driver matched — shows driver info, ETA |
| **9** | ![Trip Starts](demo/mobile/rider_driver_starts_Trip.jpg) | Live tracking, ETA updates, ride controls |
| **10** | ![Payment](demo/mobile/rider_paying.jpg) | Stripe PaymentSheet after "Arrived at Destination" |
| **11** | ![Trip End](demo/mobile/rider_trip_end_and_payment.jpg) | Fare breakdown, rating, completion |

#### Driver Mode

| Step | Screen | Description |
|------|--------|-------------|
| **1** | ![Apply](demo/mobile/application_form_to_become_driver.png) | Driver application form (vehicle, license, docs) |
| **2** | ![Application Sent](demo/mobile/application_to_driver_sent.jpg) | Submitted — pending admin review |
| **3** | ![Driver Mode](demo/mobile/driver_mode.jpg) | Go online/offline, live location streaming |
| **4** | ![Incoming Ride](demo/mobile/driver_request_sent.jpg) | Ride offer with 20s countdown, pickup/dropoff, fare |
| **5** | ![Waiting Rider](demo/mobile/driver_waiting_rider.jpg) | Navigating to pickup, rider contact |
| **6** | ![Trip In Progress](demo/mobile/driver_inprogress.jpg) | Active trip with live map, arrive/start/complete |
| **7** | ![Trip End](demo/mobile/driver_trip_end.jpg) | Summary with earnings, distance, duration |
| **8** | ![Cancel](demo/mobile/driver_cancel_ride.jpg) | Cancel with reason (late, no show, vehicle issue) |

#### History & Profile

| Screen | Description |
|--------|-------------|
| ![History](demo/mobile/history_rides.jpg) | Paginated ride history with date grouping, filters |
| ![Profile](demo/mobile/5-profile.jpg) | User profile, settings, language toggle |
| ![Profile Update](demo/mobile/5-profile_update.jpg) | Edit profile, avatar, preferences |
| ![Error State](demo/mobile/error_state_when_server_is_down.jpg) | Offline/error handling with retry |

---

### Admin Dashboard (React 19 + Vite)

| Screen | Description |
|--------|-------------|
| ![Dashboard Dark](demo/Dashboard/1-home.png) | Overview KPIs, live alerts, ride queue, quick actions |
| ![Dashboard Light](demo/Dashboard/home-light-theme.png) | Same dashboard in light theme |
| ![Trips List](demo/Dashboard/2-trips.png) | Searchable, filterable, paginated trip table |
| ![Users List](demo/Dashboard/3-users.png) | All users by role (rider/driver/admin), search |
| ![User Detail](demo/Dashboard/3-user_details.png) | User profile, trip history, support tickets |
| ![Drivers List](demo/Dashboard/4-drivers.png) | Applications + live status, approve/reject/suspend |
| ![Driver Detail](demo/Dashboard/4-driver_details.png) | Full driver stats, documents, trip history |
| ![Statistics](demo/Dashboard/5-statistics.png) | Revenue charts, completion rate, daily stats, top drivers |

---

## Features

| Area | What it does |
|------|-------------|
| **Auth & Onboarding** | Clerk authentication, 3-slide onboarding, profile management |
| **Driver Mode** | Go online, background GPS streaming, 10s heartbeat, 15s stale sweep, connectivity-aware fallback |
| **Live Driver Map** | Admin sees every online driver in real time via throttled socket broadcasts |
| **Admin Dashboard** | Overview KPIs, live alerts (long wait, stuck trip, pending approval), ride queue |
| **Ride Requests** | Pick destination (Google Places autocomplete), fare estimate (Google Routes API), haversine fallback |
| **Real-Time Matching** | Nearest-driver dispatch, 20s offer timeout, accept/reject, automatic escalation to next candidate |
| **Driver Trip Panel** | Incoming ride card with pickup/dropoff/fare/ETA, accept/reject with countdown |
| **Ride Lifecycle** | Full state machine: PENDING → ACCEPTED → ARRIVED → IN_PROGRESS → TRIP_ENDED → COMPLETED, with arrive/start/complete transitions |
| **Post-Trip Payment** | Driver taps "Arrived at Destination" → rider receives Stripe PaymentSheet → payment captured → driver can complete trip |
| **Cancellation** | Rider can cancel pending rides, driver can cancel mid-trip with reason selection (late, no show, vehicle issue, etc.) |
| **Trip Summary** | Post-trip summary dialog with fare, distance, duration, rating |
| **Ride History** | Paginated history with date grouping, filter tabs, pull-to-refresh |
| **Ride Cards** | Redesigned cards with map thumbnails, origin/destination icons, fare, distance, rating |
| **Rating System** | 5-star rating with optional feedback — available on trip card and inline in history |
| **Real-Time ETA** | Live ETA updates during trip via Google Routes API polling (20s interval) |
| **Nearby Drivers** | Rider sees nearby online cars as map markers in real time |
| **Admin Trips** | List, filter, search, detail, and cancel trips from admin dashboard |
| **Admin Drivers** | Approve, reject, suspend, reinstate drivers; view details and live locations |
| **Admin Users** | List users by role, search, view details and trip/ticket history |
| **Admin Statistics** | Revenue, completion rate, daily stats, top drivers via charts |
| **Admin Payments** | Payout list with status filter and update-to-paid |
| **Admin Support** | Ticket list with status/priority filters, detail, status updates |
| **Admin Audit** | Full audit log of admin actions |
| **i18n** | English and Arabic (RTL) support across all three projects |

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env       # fill DATABASE_URL, Clerk keys, Stripe keys
npx prisma migrate dev
npm run dev                # → http://localhost:3000
```

### Mobile

```bash
cd mobile
npm install
cp .env.example .env       # fill EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
npx expo run:android       # dev build — required for background location
```

> Background location + live driver task require native modules. Rebuild after `npm install`.

### Admin

```bash
cd admin
npm install
cp .env.example .env.local
npm run dev                # → http://localhost:5173
```

## Architecture

### Backend

```
src/
├── server.ts                    # Entry point
├── config/                      # Env, database, ride config, realtime
├── modules/
│   ├── rides/                   # Ride CRUD, state machine, dispatch, notifications
│   │   ├── trip-state-machine.ts
│   │   ├── ride-dispatcher.ts
│   │   └── ride.service.ts
│   ├── drivers/                 # Applications, availability, location, Connect onboarding
│   ├── directions/              # Google Routes distance/duration proxy
│   ├── payments/                # Stripe payments, Connect transfers, webhooks
│   ├── users/                   # User CRUD
│   ├── places/                  # Google Places autocomplete proxy
│   └── admin/                   # Admin dashboard API
│       ├── drivers/             # Approve/reject/suspend/reinstate + live map
│       ├── trips/               # List, detail, cancel
│       ├── users/               # List, detail, roles
│       ├── overview/            # KPIs, alerts, ride queue
│       ├── stats/               # Charts, revenue, top drivers
│       ├── payments/            # Payout list, status updates
│       ├── support/             # Ticket list, detail, status
│       └── audit/               # Audit log
├── sockets/                     # Socket.io setup, auth, stale detection, admin emit
└── shared/                      # RBAC, errors, middleware, helpers
```

### Mobile

```
src/
├── app/                         # Expo Router (file-based)
├── features/
│   ├── auth/                    # Sign in, sign up, onboarding
│   ├── home/                    # Map, nearby cars, recent rides
│   ├── rides/                   # Ride request, trip, bottom sheet, markers, Stripe payments
│   ├── drivers/                 # Driver mode, trip panel, incoming rides
│   ├── history/                 # Ride history with filters
│   └── profile/                 # Profile + driver section
├── api/                         # Axios client + interceptors
├── shared/                      # Reusable components, navigation, utils
└── lib/                         # Context providers
```

### Admin

```
src/
├── components/
│   ├── Layout/                  # AdminLayout, AdminHeader, AdminSidebar
│   ├── LanguageSwitcher.tsx     # English/Arabic toggle via React Portal
│   ├── ThemeToggle.tsx          # Light/dark mode toggle
│   └── SignedOutScreen.tsx
├── contexts/                    # LocaleContext, ThemeContext, useLocale, useTheme
├── features/
│   ├── overview/                # KPIs, alerts, ride queue
│   ├── trips/                   # List, filter, search, detail, cancel
│   ├── drivers/                 # Dashboard, approve/reject/suspend, detail
│   ├── users/                   # List, search, detail, roles
│   ├── statistics/              # Charts, revenue, top drivers
│   ├── payments/                # Payout list, status updates
│   ├── support/                 # Ticket list, detail, status updates
│   ├── settings/                # Settings screen
│   └── audit/                   # Audit log
├── i18n/                        # i18next, English/Arabic locales, direction utils
├── lib/                         # Socket client, queryClient
└── types/admin.ts               # Shared TypeScript types
```

## API Reference

Base URL: `http://localhost:3000/api`

### Rides

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/rides` | Rider | Request a ride |
| GET | `/rides/me/active` | Either | Current active ride |
| DELETE | `/rides/:id/cancel` | Either | Cancel a ride |
| POST | `/rides/:id/arrive` | Driver | Mark arrived at pickup |
| POST | `/rides/:id/start` | Driver | Start the trip |
| POST | `/rides/:id/arrived-at-destination` | Driver | Signal arrival at destination (triggers payment) |
| POST | `/rides/:id/complete` | Driver | Complete the trip (requires payment) |
| POST | `/rides/:id/no-show` | Driver | Report rider no-show |
| POST | `/rides/:id/accept` | Driver | Accept dispatched offer |
| POST | `/rides/:id/reject` | Driver | Decline offer |
| GET | `/rides/history` | Rider | Paginated ride history |

### Drivers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/drivers/apply` | Clerk | Apply to become a driver |
| GET | `/drivers/my-application` | Clerk | Application + profile status |
| PUT | `/drivers/availability` | Clerk | Go online/offline |
| POST | `/drivers/location` | Clerk | REST fallback for live location |
| GET | `/drivers/nearby` | Clerk | Online drivers around a point |

### Directions & Places

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/directions` | Clerk | Route distance/duration |
| GET | `/directions/eta` | Clerk | Live ETA proxy |
| GET | `/places/autocomplete` | Clerk | Google Places autocomplete |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/overview` | Admin | KPIs, counts, alerts, ride queue |
| GET | `/admin/trips` | Admin | List trips with filters, search, pagination |
| GET | `/admin/trips/:id` | Admin | Trip detail with rider/driver/offers |
| PUT | `/admin/trips/:id/cancel` | Admin | Cancel a trip with reason |
| GET | `/admin/drivers` | Admin | All driver applications with filtering |
| GET | `/admin/drivers/live` | Admin | Online drivers with live coordinates |
| GET | `/admin/drivers/:id` | Admin | Driver detail |
| GET | `/admin/drivers/:id/detail` | Admin | Full driver detail with stats and trips |
| PUT | `/admin/drivers/:id/approve` | Admin | Approve application |
| PUT | `/admin/drivers/:id/reject` | Admin | Reject application |
| PUT | `/admin/drivers/:id/suspend` | Admin | Suspend driver |
| PUT | `/admin/drivers/:id/reinstate` | Admin | Reinstate driver |
| GET | `/admin/users` | Admin | List users by role with search and pagination |
| GET | `/admin/users/:id` | Admin | User detail with trips and tickets |
| GET | `/admin/stats` | Admin | Revenue, completion rate, daily stats, top drivers |
| GET | `/admin/payments` | Admin | Payout list with status filter and pagination |
| PUT | `/admin/payments/:id/status` | Admin | Update payout status |
| POST | `/payments/pay-for-ride` | Rider | Create PaymentIntent and confirm via PaymentSheet |
| GET | `/payments/payment-status/:rideId` | Rider | Get payment status for a ride |
| POST | `/webhooks/stripe` | Stripe | Stripe webhook handler (payment_intent.succeeded, payment_intent.payment_failed, account.updated) |
| GET | `/admin/support` | Admin | Ticket list with status/priority filter |
| GET | `/admin/support/:id` | Admin | Ticket detail |
| PUT | `/admin/support/:id/status` | Admin | Update ticket status |
| GET | `/admin/audit` | Admin | Audit log with filters and pagination |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `driver:online` | driver → server | Driver declares online (gated on APPROVED) |
| `driver:offline` | driver → server | Driver declares offline |
| `driver:location` | driver → server | Live position ping |
| `driver:status` | server → driver | ACK the online transition |
| `admin:join` | admin → server | Subscribe to driver locations |
| `drivers:locations` | server → admin | Full snapshot (1s throttle) |
| `drivers:nearby` | server → rider | Online cars around rider |
| `ride:new-request` | server → driver | Dispatched ride offer (20s window) |
| `ride:accepted` | server → rider | Driver accepted the ride |
| `ride:assigned` | server → rider | Driver info payload |
| `ride:updated` | bidirectional | Status changes (arrived, started, completed, payment confirmed) |
| `ride:expired` | server → rider | TTL expiry signal |
| `admin:ride:updated` | server → admin | Ride state change notification |
| `admin:driver:status` | server → admin | Driver online/offline/approval status |
| `admin:overview:update` | server → admin | Overview data refresh push |
| `admin:alert` | server → admin | Alert notification (long wait, stuck trip, pending approval) |

## Development Workflow

| Project | Command | Port |
|---------|---------|------|
| Backend | `cd backend && npm run dev` | `3000` |
| Mobile | `cd mobile && npx expo run:android` | `8081` |
| Admin | `cd admin && npm run dev` | `5173` |

## Architecture Diagram

```mermaid
graph TB
    subgraph "Mobile App (Expo RN)"
        M1[Splash/Onboarding]
        M2[Auth - Clerk]
        M3[Home - Map + Nearby]
        M4[Ride Request Flow]
        M5[Live Trip Tracking]
        M6[Stripe Payment]
        M7[Driver Mode]
        M8[History & Profile]
    end

    subgraph "Admin Panel (React 19)"
        A1[Overview KPIs]
        A2[Live Driver Map]
        A3[Ride Queue]
        A4[Trips/Drivers/Users CRUD]
        A5[Statistics & Charts]
    end

    subgraph "Backend (Express + Socket.io)"
        B1[REST API]
        B2[WebSocket Server]
        B3[Ride Dispatcher]
        B4[Driver Location Throttle]
        B5[Stripe Webhooks]
        B6[Prisma ORM]
    end

    subgraph "Database"
        D1[(PostgreSQL - Neon)]
    end

    M1 --> M2 --> M3
    M3 --> M4 --> M5 --> M6
    M3 --> M7
    M5 --> M8

    M3 -.->|HTTP + JWT| B1
    M4 -.->|HTTP + JWT| B1
    M5 -.->|HTTP + JWT| B1
    M7 -.->|Socket.io| B2
    M7 -.->|HTTP| B1

    A1 -.->|HTTP + JWT| B1
    A2 -.->|Socket.io| B2
    A3 -.->|Socket.io| B2
    A4 -.->|HTTP + JWT| B1
    A5 -.->|HTTP + JWT| B1

    B2 --> B4 --> B2
    B1 --> B3
    B1 --> B5
    B1 --> B6 --> D1
    B2 --> B6 --> D1
```

---

## License

MIT
