export enum RideStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  ARRIVED = "ARRIVED",
  IN_PROGRESS = "IN_PROGRESS",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  COMPLETED = "COMPLETED",
}

/** Statuses where the ride still occupies the flow (mirrors the backend FSM). */
export const ACTIVE_RIDE_STATUSES: RideStatus[] = [
  RideStatus.PENDING,
  RideStatus.ACCEPTED,
  RideStatus.ARRIVED,
  RideStatus.IN_PROGRESS,
];

/** The post-match card handles all of these. */
export const TRIP_RIDE_STATUSES: RideStatus[] = [
  RideStatus.ACCEPTED,
  RideStatus.ARRIVED,
  RideStatus.IN_PROGRESS,
  RideStatus.COMPLETED,
];

/** Polling and the status screen stop here. */
export const TERMINAL_RIDE_STATUSES: RideStatus[] = [
  RideStatus.COMPLETED,
  RideStatus.CANCELLED,
  RideStatus.EXPIRED,
];
