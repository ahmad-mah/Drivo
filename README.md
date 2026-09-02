<div align="center">

# Drivo

**Full-stack ride-hailing MVP — React Native + Express + PostgreSQL**

<p align="center">

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo) ![React_Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript) ![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite) ![Clerk](https://img.shields.io/badge/Clerk-000000?style=for-the-badge&logo=clerk) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql) ![Neon](https://img.shields.io/badge/Neon-000000?style=for-the-badge&logo=neon) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker) ![Railway](https://img.shields.io/badge/Railway-000000?style=for-the-badge&logo=railway) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)

</p>

Real-time ride matching, live GPS tracking, driver dispatch with offer/accept/timeout — an Uber-inspired ride-hailing MVP in a single repository.

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

### Mobile App — All Screens

<p align="center">
  <img src="demo/mobile/1-splash.png" width="160" alt="Splash">
  <img src="demo/mobile/2-onboarding.png" width="160" alt="Onboarding 1">
  <img src="demo/mobile/2-onboarding2.png" width="160" alt="Onboarding 2">
  <img src="demo/mobile/2-onboarding3.png" width="160" alt="Onboarding 3">
  <img src="demo/mobile/3-welcome.png" width="160" alt="Welcome">
  <img src="demo/mobile/4-auth-signin.png" width="160" alt="Sign In">
  <img src="demo/mobile/4-google-signin.png" width="160" alt="Google Sign In">
  <img src="demo/mobile/4-auth-signup.png" width="160" alt="Sign Up">
  <img src="demo/mobile/6-home.jpg" width="160" alt="Home">
  <img src="demo/mobile/rider-request-driver.jpg" width="160" alt="Ride Request">
  <img src="demo/mobile/rider-driver-waiting.jpg" width="160" alt="Finding Driver">
  <img src="demo/mobile/rider-driver-accepts.jpg" width="160" alt="Driver Matched">
  <img src="demo/mobile/rider-driver-starts-trip.jpg" width="160" alt="Live Trip">
  <img src="demo/mobile/rider-paying.jpg" width="160" alt="Payment">
  <img src="demo/mobile/rider-trip-end-payment.jpg" width="160" alt="Trip End">
  <img src="demo/mobile/apply-driver-form.png" width="160" alt="Apply Driver">
  <img src="demo/mobile/apply-driver-sent.jpg" width="160" alt="Application Sent">
  <img src="demo/mobile/driver-mode.jpg" width="160" alt="Driver Mode">
  <img src="demo/mobile/driver-request-sent.jpg" width="160" alt="Incoming Ride">
  <img src="demo/mobile/driver-waiting-rider.jpg" width="160" alt="Waiting Rider">
  <img src="demo/mobile/driver-inprogress.jpg" width="160" alt="Trip Progress">
  <img src="demo/mobile/driver-trip-end.jpg" width="160" alt="Driver Trip End">
  <img src="demo/mobile/driver-cancel-ride.jpg" width="160" alt="Cancel Ride">
  <img src="demo/mobile/history-rides.jpg" width="160" alt="History">
  <img src="demo/mobile/5-profile.jpg" width="160" alt="Profile">
  <img src="demo/mobile/5-profile-update.jpg" width="160" alt="Profile Update">
  <img src="demo/mobile/error-state.jpg" width="160" alt="Error State">
</p>

### Admin Dashboard — All Screens

<p align="center">
  <img src="demo/Dashboard/1-home.png" width="300" alt="Dashboard Dark">
  <img src="demo/Dashboard/home-light-theme.png" width="300" alt="Dashboard Light">
  <img src="demo/Dashboard/2-trips.png" width="300" alt="Trips List">
  <img src="demo/Dashboard/3-users.png" width="300" alt="Users List">
  <img src="demo/Dashboard/3-user-details.png" width="300" alt="User Detail">
  <img src="demo/Dashboard/4-drivers.png" width="300" alt="Drivers List">
  <img src="demo/Dashboard/4-driver-details.png" width="300" alt="Driver Detail">
  <img src="demo/Dashboard/5-statistics.png" width="300" alt="Statistics">
</p>

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

## Deployment

| Service | Platform | Details |
|---------|----------|---------|
| Backend | Railway | Docker container (multi-stage build), Prisma migrations, Neon Postgres |
| Admin Dashboard | Vercel | Static SPA build via Vite |
| Mobile App | EAS Build | Internal APK distribution |

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
