import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import * as driverRepository from "../modules/drivers/driver.repository";
import * as driverService from "../modules/drivers/driver.service";
import { authenticateSocket } from "./auth";
import { broadcastDriversSnapshot, sendSnapshotTo } from "./snapshot";
import {
  ADMINS_ROOM,
  EVENTS,
  type DriverLocationPayload,
} from "./types";

const STALE_MS = 15_000;
const STALE_CHECK_INTERVAL_MS = 5_000;

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
    const { userId, clerkId, role } = socket.data.user;

    // Drivers get their own room for targeted broadcasts later (ride matching).
    if (role === "USER") socket.join(`driver:${userId}`);

    socket.on(EVENTS.driverOnline, async () => {
      const payload = await driverService.goOnline(clerkId);
      socket.emit(EVENTS.driverStatus, payload);
      if (payload.isOnline) broadcastDriversSnapshot(io);
    });

    socket.on(EVENTS.driverOffline, async () => {
      const payload = await driverService.goOffline(clerkId);
      socket.emit(EVENTS.driverStatus, payload);
      broadcastDriversSnapshot(io);
    });

    socket.on(
      EVENTS.driverLocation,
      async (location: DriverLocationPayload) => {
        if (
          !location ||
          typeof location.latitude !== "number" ||
          typeof location.longitude !== "number" ||
          Number.isFinite(location.latitude) === false ||
          Number.isFinite(location.longitude) === false ||
          location.latitude < -90 ||
          location.latitude > 90 ||
          location.longitude < -180 ||
          location.longitude > 180
        ) {
          return;
        }
        await driverService.updateLocation(clerkId, {
          latitude: location.latitude,
          longitude: location.longitude,
        });
        broadcastDriversSnapshot(io);
      },
    );

    socket.on(
      EVENTS.driverHeartbeat,
      async () => {
        // Liveness only — no coordinate change, so no snapshot broadcast.
        await driverService.heartbeat(clerkId);
      },
    );

    socket.on(EVENTS.adminJoin, async () => {
      if (role !== "ADMIN") return;
      await socket.join(ADMINS_ROOM);
      await sendSnapshotTo(io);
    });

    socket.on("disconnect", () => {
      // The stale sweep handles the actual offline flip; disconnecting is just
      // a hint that the driver may be gone.
    });
  });

  // Silence is treated as offline: drivers that stop pinging the server are
  // flipped offline so the map never shows ghosts. Broadcast so admins update.
  setInterval(async () => {
    const cutoff = new Date(Date.now() - STALE_MS);
    const result = await driverRepository.markStaleDriversOffline(cutoff);
    if (result.count > 0) broadcastDriversSnapshot(io);
  }, STALE_CHECK_INTERVAL_MS);

  return io;
}