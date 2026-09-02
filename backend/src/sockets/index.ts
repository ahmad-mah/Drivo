import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { Role } from "@prisma/client";
import { env } from "../config/index.js";
import {
  DRIVER_STALE_MS,
  STALE_CHECK_INTERVAL_MS,
  NEARBY_DRIVERS_BROADCAST_MS,
} from "../config/index.js";
import * as driverRepository from "../modules/drivers/driver.repository.js";
import * as driverService from "../modules/drivers/driver.service.js";
import { assertValidCoordinates } from "../shared/validation/coordinates.js";
import { authenticateSocket } from "./auth.js";
import { broadcastDriversSnapshot, sendSnapshotTo } from "./snapshot.js";
import { setSocketServer } from "./ride.js";
import {
  ADMINS_ROOM,
  EVENTS,
  type DriverLocationPayload,
} from "./types.js";

// Socket handlers run outside the Express error pipeline; a rejection here
// would crash the process, so every handler routes through this catch.
function safeSocketHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<void>,
): (...args: T) => void {
  return (...args) => {
    handler(...args).catch((err) => {
      console.error("[socket] handler error", err);
    });
  };
}

/**
 * Attaches Socket.io to the HTTP server and registers the realtime protocol:
 * driver availability + location streaming, admin live-map snapshots, and the
 * staleness sweep that flips silent drivers offline.
 */
export function initSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  setSocketServer(io);

  // Handshake auth: sockets are not HTTP requests, so Clerk's express
  // middleware does not run here — we verify the session token directly.
  io.use(async (socket, next) => {
    const user = await authenticateSocket(socket);
    if (!user) {
      return next(new Error("Unauthorized"));
    }
    socket.data.user = user;
    next();
  });

  io.on("connection", (socket) => {
    const { clerkId, role } = socket.data.user;

    socket.join(clerkId);

    // Connect-time snapshot: broadcasts only fire on driver changes, so a
    // freshly opened rider app would otherwise stare at an empty map until
    // the next driver movement.
    void buildNearbyDriversPayload().then((payload) => {
      if (socket.connected) socket.emit("drivers:nearby", payload);
    });

    socket.on(
      EVENTS.driverOnline,
      safeSocketHandler(async () => {
        const payload = await driverService.goOnline(clerkId);
        socket.emit(EVENTS.driverStatus, payload);
        if (payload.isOnline) {
          broadcastDriversSnapshot(io);
          // Instant reflection: waiting riders see the car appear right away.
          await flushNearbyDriversNow();
        }
      }),
    );

    socket.on(
      EVENTS.driverOffline,
      safeSocketHandler(async () => {
        const payload = await driverService.goOffline(clerkId);
        socket.emit(EVENTS.driverStatus, payload);
        broadcastDriversSnapshot(io);
        broadcastNearbyDrivers(io);
      }),
    );

    socket.on(
      EVENTS.driverLocation,
      safeSocketHandler(async (location: DriverLocationPayload) => {
        if (
          !location ||
          typeof location.latitude !== "number" ||
          typeof location.longitude !== "number"
        ) {
          return;
        }
        try {
          assertValidCoordinates(location.latitude, location.longitude);
        } catch {
          return;
        }
        const heading =
          typeof location.heading === "number" &&
          location.heading >= 0 &&
          location.heading <= 360
            ? location.heading
            : undefined;
        await driverService.updateLocation(clerkId, {
          latitude: location.latitude,
          longitude: location.longitude,
          ...(heading !== undefined && { heading }),
        });
        broadcastDriversSnapshot(io);
        broadcastNearbyDrivers(io);
      }),
    );

    socket.on(
      EVENTS.driverHeartbeat,
      safeSocketHandler(async () => {
        // Liveness only — no coordinate change, so no snapshot broadcast.
        await driverService.heartbeat(clerkId);
      }),
    );

    socket.on(
      EVENTS.adminJoin,
      safeSocketHandler(async () => {
        if (role !== Role.ADMIN) return;
        await socket.join(ADMINS_ROOM);
        await sendSnapshotTo(io);
      }),
    );
  });

  // Silence is treated as offline: drivers that stop pinging the server are
  // flipped offline so the map never shows ghosts. Broadcast so admins update.
  setInterval(async () => {
    const cutoff = new Date(Date.now() - DRIVER_STALE_MS);
    const result = await driverRepository.markStaleDriversOffline(cutoff);
    if (result.count > 0) {
      broadcastDriversSnapshot(io);
      broadcastNearbyDrivers(io);
    }
  }, STALE_CHECK_INTERVAL_MS);

  return io;
}

const NEARBY_DRIVERS_THROTTLE_MS = NEARBY_DRIVERS_BROADCAST_MS;

let nearbyDriversTimer: NodeJS.Timeout | null = null;
let nearbyDriversDirty = false;

async function buildNearbyDriversPayload() {
  // With the fleet disabled the rider map streams real online drivers
  // instead, so a real-device test still sees cars on the map.
  const drivers = env.DISABLE_FAKE_DRIVERS
    ? await driverRepository.findOnlineDrivers()
    : await driverRepository.findOnlineFakeDrivers(4);
  return drivers.map((driver) => ({
    id: driver.id,
    firstName: driver.firstName,
    lastName: driver.lastName,
    vehicleType: driver.vehicleType,
    vehicleModel: driver.vehicleModel ?? "",
    vehicleColor: driver.vehicleColor ?? "",
    latitude: driver.latitude,
    longitude: driver.longitude,
    heading: driver.heading ?? null,
    rating: null,
    fare: null,
    timeMinutes: null,
    seats: null,
    carPlate: null,
    imageUrl: driver.user?.imageUrl ?? null,
  }));
}

export function broadcastNearbyDrivers(io: Server) {
  nearbyDriversDirty = true;
  if (nearbyDriversTimer) return;

  nearbyDriversTimer = setTimeout(async () => {
    nearbyDriversTimer = null;
    if (!nearbyDriversDirty) return;
    nearbyDriversDirty = false;
    const payload = await buildNearbyDriversPayload();
    io.emit("drivers:nearby", payload);
  }, NEARBY_DRIVERS_THROTTLE_MS);
}

import { getSocketServer } from "./ride.js";

/**
 * Bypasses the throttle timer and emits the snapshot immediately — used when
 * a driver comes online so waiting riders see the car appear instantly.
 */
export async function flushNearbyDriversNow() {
  const io = getSocketServer();
  if (!io) return;
  if (nearbyDriversTimer) {
    clearTimeout(nearbyDriversTimer);
    nearbyDriversTimer = null;
  }
  nearbyDriversDirty = false;
  io.emit("drivers:nearby", await buildNearbyDriversPayload());
}

export function broadcastNearbyDriversToAll() {
  const io = getSocketServer();
  if (io) {
    broadcastNearbyDrivers(io);
  }
}