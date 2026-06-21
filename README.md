# Drivo — Uber Clone

Built with React Native (Expo), Google Maps, Stripe, PostgreSQL, Clerk, Zustand, and Tailwind CSS.

## Tech Stack

- **React Native / Expo** — cross-platform mobile UI
- **Google Maps** — live location, directions, place autocomplete
- **Stripe** — payment processing (cards, wallets)
- **PostgreSQL** — serverless database (rides, users, payments)
- **Clerk** — authentication (email + password, Google OAuth)
- **Zustand** — client-side state management
- **Tailwind CSS** — styling via NativeWind
- **TypeScript** — type safety

## Features

- Onboarding flow with registration & email verification
- Google OAuth + email/password authentication
- Home screen with live location & Google Map markers
- Recent rides list
- Google Places autocomplete
- Ride search with "From" / "To" locations
- Car selection from map
- Ride confirmation with time & fare details
- Stripe payment (cards, wallets, etc.)
- Ride creation after successful payment
- Role-based authorization

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
EXPO_PUBLIC_DATABASE_URL=
```

### Run

```bash
npx expo start
```

Press `i` for iOS, `a` for Android, or `w` for web.

## Project Structure

```
src/
  app/          — Expo Router screens (file-based routing)
  features/     — Feature modules (auth, rides, payments)
  shared/       — Reusable UI, hooks, utils
  services/     — API clients, Stripe, Maps helpers
  config/       — Environment & app config
  types/        — Shared TypeScript types
```

## Tutorial

This project follows the [JavaScript Mastery](https://youtube.com/@javascriptmastery) tutorial on YouTube.
