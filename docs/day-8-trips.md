# Day 8 — Trips: Pickup Flow, Trip States & History

## Goal
Complete the post-match lifecycle: driver arrives → starts → completes the trip, with a live rider view, driver-side trip panel, and natural history flow.

---

## Ride Lifecycle

```
PENDING ──accept──▶ ACCEPTED ──arrive──▶ ARRIVED ──start──▶ IN_PROGRESS ──complete──▶ COMPLETED
   │                  │ cancel            │ cancel
   ├──expire──────────┤                   ▼
   ▼                  ▼               CANCELLED (rider)
EXPIRED           CANCELLED
   ▲                  
   └────driver-cancel (pre-IN_PROGRESS): ride re-enters PENDING with the
        driver snapshot cleared; dispatcher escalates to the next candidate
```

### Cancellation rules
| Actor | When | Effect |
|-------|------|--------|
| Rider | PENDING / ACCEPTED / ARRIVED | ride → CANCELLED, assigned driver notified via `ride:updated` |
| Rider | IN_PROGRESS | **blocked** (409 "Cannot cancel while on the trip") |
| Driver | ACCEPTED / ARRIVED | **re-dispatch**: ride → PENDING, snapshot cleared, offer REJECTED, rider returns to searching |
| Driver | IN_PROGRESS | blocked (cancel button hidden + server guard) |

### Connectivity answers
- **Rider drops:** poll + socket resync on reconnect; server state is truth.
- **Driver drops mid-trip:** trip unaffected server-side; `GET /rides/driver/active` restores the panel on return. Going offline via toggle is **blocked** while a trip is active ("Finish your active trip before going offline").
- **Dispatcher** never offers to a driver holding an active trip (`rides: none: {status in [ACCEPTED, ARRIVED, IN_PROGRESS]}` filter).

---

## Backend

| Endpoint | Transition |
|----------|------------|
| `GET  /rides/driver/active` | restore path for restarts/reconnects |
| `POST /rides/:id/arrive`    | ACCEPTED → ARRIVED (+ arrivedAt) |
| `POST /rides/:id/start`     | ARRIVED → IN_PROGRESS (+ startedAt) |
| `POST /rides/:id/complete`  | IN_PROGRESS → COMPLETED (+ completedAt) |
| `POST /rides/:id/driver-cancel` | ACCEPTED/ARRIVED → PENDING (re-dispatch) |

All transitions are atomic `updateMany` guards on `{rideId, driverId, status[]}` — double taps and races lose cleanly with 0 rows → 409.

**Events:** every transition emits generic `ride:updated {rideId}` to both rider and driver rooms; clients refetch their active ride. Accept additionally nudges the accepting driver's own room so the trip panel appears immediately.

---

## Mobile

### Driver
- `useDriverTrip` — restores/refetches the active trip, follows `ride:updated`, exposes arrive/start/complete/cancel with conflict reconciliation.
- `TripPanel` replaces the availability footer while a trip is active: pickup/dropoff/fare, primary button following the state machine (**I've arrived → Start trip → Complete trip**), cancel hidden once `IN_PROGRESS`.

### Rider
- Polling continues through the whole lifecycle (`useActiveRide` stops only on terminal states).
- `RideTripCard` renders per status: "Driver is on the way" / "Your driver has arrived" (cancel ✅) → "You're on your trip" (no cancel) → "Trip completed · fare" + Done.
- History needs no changes: completions flow into the existing recent-rides list.

---

## Validation
1. Full loop on two devices: request → accept → Arrived → Start → Complete; rider card tracks each step; completed ride shows in home history.
2. Driver cancels pre-trip → rider returns to searching, new driver (or same after cooldown exclusion) gets the next offer.
3. Rider cancels while ARRIVED → driver's trip panel clears via `ride:updated`.
4. Try to toggle offline during a trip → blocked with message.
5. Kill/reopen driver app mid-trip → panel restored from `/rides/driver/active`.
