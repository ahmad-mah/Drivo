# Day 9 — Cancellations, No-Show & Search Widening

## Cancellation reasons (required)

| Actor | Phase | Reasons |
|-------|-------|---------|
| Rider | PENDING / ACCEPTED / ARRIVED | change_of_plans · booked_by_accident · driver_taking_too_long · wrong_pickup · other |
| Driver | pre-trip cancel (re-dispatch) | too_far_away · cannot_reach_pickup · vehicle_issue · other |
| Driver | mid-trip abort | fixed: `driver_cancelled_trip` |
| Driver | no-show | fixed: `rider_no_show` |

Stored on `Ride.cancelReason`; surfaced in ride responses. Rider mid-trip cancel stays blocked.

## Rider no-show flow

1. Driver taps **Arrived** → rider card shows *"Your driver is waiting · m:ss"* counting down from 3 min (`NO_SHOW_WAIT_MS`, relative `noShowInSeconds` — skew-proof).
2. Timer hits zero → driver's panel shows **"Rider didn't show up"**.
3. `POST /rides/:id/no-show` → ARRIVED → CANCELLED (`rider_no_show`), terminal by design.
4. Rider sees *"You weren't at the pickup point"* terminal card.

## Progressive search radius

| Failed offers | Radius |
|---|---|
| 0–1 | 3 km |
| 2–3 | 6 km |
| 4+ | 12 km |

`dispatchRadiusForAttempts(n)` (pure, unit-tested). Rejected drivers re-enter the pool after `REOFFER_COOLDOWN_MS` (30s) — a rejection is a cooldown, not a ban.

## Duplicate-request guard

409 on `POST /rides/request` → snackbar *"You already have an active ride"* → auto-navigate to the existing ride's status screen.

## Tests

- FSM suite extended for mid-trip driver abort (`IN_PROGRESS → CANCELLED`)
- Radius ladder edge cases (base rung, widening steps, cap)
