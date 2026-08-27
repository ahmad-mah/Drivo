import { describe, expect, it } from "vitest";
import { RideStatus } from "@prisma/client";
import {
  ACTIVE_RIDE_STATUSES,
  TERMINAL_RIDE_STATUSES,
  TRIP_TRANSITIONS,
  canTransition,
  transitionSources,
} from "./trip-state-machine";

describe("trip state machine", () => {
  it("covers every status in the transition table", () => {
    for (const status of Object.values(RideStatus)) {
      expect(TRIP_TRANSITIONS[status]).toBeDefined();
    }
  });

  it("defines the happy path", () => {
    expect(canTransition(RideStatus.PENDING, RideStatus.ACCEPTED)).toBe(true);
    expect(canTransition(RideStatus.ACCEPTED, RideStatus.ARRIVED)).toBe(true);
    expect(canTransition(RideStatus.ARRIVED, RideStatus.IN_PROGRESS)).toBe(true);
    expect(canTransition(RideStatus.IN_PROGRESS, RideStatus.COMPLETED)).toBe(true);
  });

  it("allows rider/driver cancellation from every pre-trip state", () => {
    expect(canTransition(RideStatus.PENDING, RideStatus.CANCELLED)).toBe(true);
    expect(canTransition(RideStatus.ACCEPTED, RideStatus.CANCELLED)).toBe(true);
    expect(canTransition(RideStatus.ARRIVED, RideStatus.CANCELLED)).toBe(true);
  });

  it("supports driver-cancel re-dispatch only before the trip starts", () => {
    expect(canTransition(RideStatus.ACCEPTED, RideStatus.PENDING)).toBe(true);
    expect(canTransition(RideStatus.ARRIVED, RideStatus.PENDING)).toBe(true);
    expect(canTransition(RideStatus.IN_PROGRESS, RideStatus.PENDING)).toBe(false);
  });

  it("allows driver abort mid-trip, terminating as cancelled", () => {
    expect(canTransition(RideStatus.IN_PROGRESS, RideStatus.CANCELLED)).toBe(true);
  });

  it("makes terminal states immutable", () => {
    for (const terminal of TERMINAL_RIDE_STATUSES) {
      expect(TRIP_TRANSITIONS[terminal]).toHaveLength(0);
      for (const to of Object.values(RideStatus)) {
        expect(canTransition(terminal, to)).toBe(false);
      }
    }
  });

  it("never allows skipping the arrival step or reversing the flow", () => {
    expect(canTransition(RideStatus.ACCEPTED, RideStatus.IN_PROGRESS)).toBe(false);
    expect(canTransition(RideStatus.PENDING, RideStatus.IN_PROGRESS)).toBe(false);
    expect(canTransition(RideStatus.IN_PROGRESS, RideStatus.ACCEPTED)).toBe(false);
    expect(canTransition(RideStatus.COMPLETED, RideStatus.PENDING)).toBe(false);
  });

  it("derives consistent source sets and partitions statuses", () => {
    // Every declared transition is discoverable through its target's sources.
    for (const [from, targets] of Object.entries(TRIP_TRANSITIONS)) {
      for (const to of targets) {
        expect(transitionSources(to)).toContain(from as RideStatus);
      }
    }

    const all = new Set(Object.values(RideStatus));
    for (const status of all) {
      // Exactly one bucket each — no status is both active and terminal.
      expect(ACTIVE_RIDE_STATUSES.includes(status)).not.toBe(
        TERMINAL_RIDE_STATUSES.includes(status),
      );
    }
  });
});
