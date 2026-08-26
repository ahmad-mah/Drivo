# Day 10 — Ratings & Full History

## Ratings (rider → driver)

- `POST /rides/:id/rate` `{ stars 1–5, comment? }` — rider-only, on `COMPLETED` rides, one per ride (guarded server-side).
- Stored on the ride (`riderRating`, `riderComment`) **and** folded into denormalized aggregates on `DriverProfile` (`ratingSum`, `ratingCount`) in one transaction — matching-time averages are a division, never an aggregation query.
- Real averages now flow into: dispatch offer payloads, the accept-time assigned-driver payload, and every ride response (`driverRating`).
- Driver app has no rating UI by design — completing a trip returns them straight to online mode.

## Full history

`GET /rides/recent` returns `COMPLETED + CANCELLED` rides (EXPIRED excluded by product decision), newest first. Each item carries status, cancellation reason, fare, seats, driver average, and whether the rider already rated.

History card layout (per design spec): white card → map medallion + pickup/destination route column → tinted summary block with divider-separated rows (Date & Time · Driver · Car Seats · Payment) → status chip + Rate chip for unrated completions.

## Car seats

Captured as a mandatory field in the driver application (`DriverProfile.seats`, 1–8), snapshotted onto the ride at accept time (`Ride.seats`). Legacy profiles were backfilled to 4 via migration default; new/updated applications always carry explicit values.

## Tests

- Existing FSM suite untouched and green.
- Radius-ladder tests added with Day 9; no DB-bound rating tests yet (needs a test database harness).
