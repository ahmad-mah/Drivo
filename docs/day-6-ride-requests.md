# Day 6 — Ride Requests: Socket-Based Nearby Drivers & Fake Driver Matching

## Goal
Use socket.io to stream nearby driver locations to the rider app, and simulate driver acceptance with fake drivers for testing. The rider sees "I'm requesting a ride" during the search phase, then gets matched with a fake driver.

---

## Current State
- Ride request/create/cancel/expire: ✅ Done
- Nearby drivers: HTTP only, falls back to `fakeDrivers.ts`
- Socket.io: driver online/offline/location only; no mobile client
- Driver matching: ❌ Missing — rides always expire

---

## Key Decisions

### 1. Socket Strategy
- Mobile connects to Socket.io on app launch
- Backend broadcasts `drivers:nearby` to all connected rider sockets whenever driver locations change (reuses existing location + snapshot infrastructure)
- `useNearbyDrivers` on mobile subscribes to socket events; falls back to HTTP if socket disconnects
- Fake drivers stay as static data — no socket clients needed

### 2. Fake Driver Matching (Server-Side Simulation)
- When a ride becomes `PENDING`, backend waits 2–3 seconds, then auto-assigns a fake driver near the origin
- Ride transitions to `ACCEPTED`, driver info is stored in the ride record
- Rider receives `driver:assigned` via socket; UI transitions from searching → driver info card
- If no assignment within `RIDE_TTL_MS`, ride expires normally

### 3. New Socket Events
| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `ride:requested` | Server → Rider | `{ rideId, nearbyDriversCount }` | Confirm ride created |
| `driver:assigned` | Server → Rider | `{ rideId, driver, etaMinutes, fare }` | Fake driver accepted |
| `drivers:nearby` | Server → Rider | `NearbyDriver[]` | Real-time driver locations |

---

## Implementation Tasks

### Backend
1. **`backend/src/modules/rides/ride.types.ts`** — Add `AssignDriverDto` (driver fields)
2. **`backend/src/modules/rides/ride.repository.ts`** — Add `assignDriver(rideId, driverInfo)` atomic update
3. **`backend/src/modules/rides/ride.service.ts`** — Add `assignDriver()`, emit socket events on create/assign
4. **`backend/src/modules/rides/ride.socket.ts`** (new) — `notifyRideRequested`, `notifyDriverAssigned`
5. **`backend/src/modules/rides/fake-driver.simulator.ts`** (new) — Watches PENDING rides, assigns fake driver after 2–3s
6. **`backend/src/sockets/index.ts`** — Add ride socket handlers; broadcast `drivers:nearby` to rider sockets

### Mobile
7. **`mobile/package.json`** — Add `socket.io-client`
8. **`mobile/src/shared/services/socket.ts`** (new) — Socket singleton, auth with Clerk token, auto-reconnect
9. **`mobile/src/features/rides/hooks/useRideSocket.ts`** (new) — Listen for ride events, update local state
10. **`mobile/src/features/rides/hooks/useNearbyDrivers.ts`** — Subscribe to `drivers:nearby` socket events
11. **`mobile/src/features/rides/screens/ride-status-screen.tsx`** — Integrate `useRideSocket`, add `ACCEPTED` UI
12. **`mobile/src/features/rides/components/RideDriverAssignedCard.tsx`** (new) — Driver info, ETA, fare, "Driver is on the way"

---

## Validation
1. Start backend + mobile
2. Request ride → see searching card
3. Verify fake driver assigned after ~3s
4. Verify driver info card + map marker
5. Test cancel during searching and after assignment
6. Test expiration (short TTL)

---

## Risks
- Socket auth: mobile sends Clerk token in handshake
- Race condition: ride cancelled before fake assignment — atomic DB update guards this
- Memory leaks: clean up socket listeners on unmount
