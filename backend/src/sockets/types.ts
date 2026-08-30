import type { User } from "@prisma/client";

/** Payload attached to every authenticated socket. */
export interface SocketUser {
  userId: string;
  clerkId: string;
  role: User["role"];
}

export const ADMINS_ROOM = "admins";

export const EVENTS = {
  driverOnline: "driver:online",
  driverOffline: "driver:offline",
  driverLocation: "driver:location",
  driverHeartbeat: "driver:heartbeat",
  driverStatus: "driver:status",
  adminJoin: "admin:join",
  driversLocations: "drivers:locations",
  adminRideUpdated: "admin:ride:updated",
  adminDriverStatus: "admin:driver:status",
  adminOverviewUpdate: "admin:overview:update",
  adminAlert: "admin:alert",
} as const;

export interface DriverLocationPayload {
  latitude: number;
  longitude: number;
  heading?: number;
}

export interface AdminDriversSnapshotMember {
  id: string;
  firstName: string;
  lastName: string;
  latitude: number | null;
  longitude: number | null;
  lastSeenAt: string | null;
  vehicleType: string;
  email: string;
}

// ── Admin socket payloads ────────────────────────────────────────────
export interface AdminRideUpdatedPayload {
  rideId: string;
  newStatus: string;
  driverId?: string;
  timestamp: string;
}

export interface AdminDriverStatusPayload {
  driverId: string;
  isOnline: boolean;
  approvalStatus: string;
  timestamp: string;
}

export interface AdminAlertPayload {
  type: "long_wait" | "stuck_trip" | "pending_approval" | "driver_offline";
  count: number;
  severity: "info" | "warning" | "critical";
  data?: unknown;
}