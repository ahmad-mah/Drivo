import type { User } from "@prisma/client";

/** Payload attached to every authenticated socket. */
export interface SocketUser {
  userId: string;
  clerkId: string;
  role: User["role"];
}

export const DRIVERS_ROOM = "drivers";
export const ADMINS_ROOM = "admins";

export const EVENTS = {
  driverOnline: "driver:online",
  driverOffline: "driver:offline",
  driverLocation: "driver:location",
  driverStatus: "driver:status",
  adminJoin: "admin:join",
  driversLocations: "drivers:locations",
} as const;

export interface DriverLocationPayload {
  latitude: number;
  longitude: number;
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