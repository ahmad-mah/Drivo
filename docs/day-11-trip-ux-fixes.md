# Day 11 — Decline UX, Live Timers & History Tab

## Driver decline = instant, visible bounce-back

When the offered driver taps **Reject**, the ride itself cancels with reason
`driver_declined`. The rider is pushed `ride:updated` and their status screen
shows *"Driver cancelled your request"* then navigates back to the drivers list
to re-pick. The 30s cooldown guarantees the same driver is not re-offered.
Silent timeouts still escalate automatically — only an explicit reject bounces.

## Rider cancel dismisses the driver's card instantly

Rider cancel now expires every open offer and pushes `ride:updated {rideId}` to
each holding driver; the incoming-request card compares ids and dismisses
itself immediately (no more ghost Accept buttons).

## Live timers

| State | Driver panel | Rider card |
|-------|--------------|------------|
| ARRIVED | Bold **"Waiting for the rider · m:ss"** + draining progress bar | Same countdown in the waiting hint |
| IN_PROGRESS | Bold **"On trip · m:ss"** counting up | — |

Both run off server-relative seconds (`noShowInSeconds`, `tripElapsedSeconds`)
captured locally at receipt — device-clock skew can't distort them. Payments
later read the authoritative `startedAt` → `completedAt` timestamps already
persisted on the ride.

## Completion rendered correctly

`GET /rides/me/active` gained a grace fallback: when nothing is active but a
ride of the user ended within the last ~3 minutes (`RIDE_ENDED_GRACE_MS`), it
returns that ride with its true status. The completion card therefore renders
as completed — never mislabelled as "cancelled" or "no driver found".

## Home preview vs History tab

- **Home**: max 3 recent rides + "See all" link (`GET /rides/recent?limit=3`)
- **History tab**: full paginated list via new `GET /rides/history?offset&limit`
  (`features/history/` hook + screen), infinite scroll at page bottom

Reason labels for cancelled entries reuse the Day 9 catalog, plus
`driver_declined → "Driver declined"`.
