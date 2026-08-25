import { RideStatus } from "@prisma/client";

/**
 * The ride lifecycle as an explicit transition table — the single source of
 * truth for which status may follow which. Industry guidance for ride-hailing
 * systems is unambiguous: enforce transitions structurally (illegal states
 * impossible), not with scattered status checks across services.
 *
 *   PENDING ──accept──▶ ACCEPTED ──arrive──▶ ARRIVED ──start──▶ IN_PROGRESS
 *      │                  │ cancel            │ cancel                │
 *      ├──expire──────────┤                   ▼                   complete
 *      ▼                  ▼               CANCELLED                 ▼
 *   EXPIRED           CANCELLED        (rider/driver)          COMPLETED
 *                         ▲
 *                         └── driver-cancel re-dispatches ACCEPTED/ARRIVED
 *                             back to PENDING (snapshot cleared)
 */
export const TRIP_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  [RideStatus.PENDING]: [
    RideStatus.ACCEPTED,
    RideStatus.CANCELLED,
    RideStatus.EXPIRED,
  ],
  [RideStatus.ACCEPTED]: [
    RideStatus.ARRIVED,
    RideStatus.PENDING, // driver cancel → re-dispatch
    RideStatus.CANCELLED,
  ],
  [RideStatus.ARRIVED]: [
    RideStatus.IN_PROGRESS,
    RideStatus.PENDING, // driver cancel → re-dispatch
    RideStatus.CANCELLED,
  ],
  [RideStatus.IN_PROGRESS]: [
    RideStatus.COMPLETED,
    // Driver abort mid-trip: the ride terminates (no re-dispatch with the
    // rider in the car). Rider cancellation stays blocked at the service layer.
    RideStatus.CANCELLED,
  ],
  [RideStatus.COMPLETED]: [],
  [RideStatus.CANCELLED]: [],
  [RideStatus.EXPIRED]: [],
};

/** Statuses where the ride still occupies the rider/driver flow. */
export const ACTIVE_RIDE_STATUSES: RideStatus[] = [
  RideStatus.PENDING,
  RideStatus.ACCEPTED,
  RideStatus.ARRIVED,
  RideStatus.IN_PROGRESS,
];

/** Statuses that end the ride — polling/UI stops here. */
export const TERMINAL_RIDE_STATUSES: RideStatus[] = [
  RideStatus.COMPLETED,
  RideStatus.CANCELLED,
  RideStatus.EXPIRED,
];

export function canTransition(from: RideStatus, to: RideStatus): boolean {
  return TRIP_TRANSITIONS[from]?.includes(to) ?? false;
}

/** All statuses allowed to move into `to` — the repo guard's from-set. */
export function transitionSources(to: RideStatus): RideStatus[] {
  return (Object.keys(TRIP_TRANSITIONS) as RideStatus[]).filter((from) =>
    canTransition(from, to),
  );
}
