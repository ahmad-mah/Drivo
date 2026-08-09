import type { Server } from "socket.io";
import * as driverRepository from "../modules/drivers/driver.repository";
import { ADMINS_ROOM, type AdminDriversSnapshotMember } from "./types";

const SNAPSHOT_THROTTLE_MS = 1000;

let snapshotTimer: NodeJS.Timeout | null = null;
let snapshotDirty = false;

/** Builds the payload the admin live map renders. */
async function buildSnapshot(): Promise<AdminDriversSnapshotMember[]> {
  const drivers = await driverRepository.findOnlineDrivers();
  return drivers.map((driver) => ({
    id: driver.id,
    firstName: driver.firstName,
    lastName: driver.lastName,
    latitude: driver.latitude,
    longitude: driver.longitude,
    lastSeenAt: driver.lastSeenAt?.toISOString() ?? null,
    vehicleType: driver.vehicleType,
    email: driver.user.email,
  }));
}

/**
 * Queues a broadcast of the online-drivers snapshot to the admin room, at most
 * once per second. Location updates can arrive rapidly (one per driver), so we
 * coalesce them into a single emit rather than spamming the socket bus.
 */
export function broadcastDriversSnapshot(io: Server) {
  snapshotDirty = true;
  if (snapshotTimer) return;

  snapshotTimer = setTimeout(async () => {
    snapshotTimer = null;
    if (!snapshotDirty) return;
    snapshotDirty = false;
    const snapshot = await buildSnapshot();
    io.to(ADMINS_ROOM).emit("drivers:locations", snapshot);
  }, SNAPSHOT_THROTTLE_MS);
}

/** Sends a fresh snapshot immediately (e.g. admin just logged in). */
export async function sendSnapshotTo(io: Server) {
  const snapshot = await buildSnapshot();
  io.to(ADMINS_ROOM).emit("drivers:locations", snapshot);
}