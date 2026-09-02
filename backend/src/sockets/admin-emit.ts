import { getSocketServer } from "./ride.js";
import {
  ADMINS_ROOM,
  EVENTS,
  type AdminRideUpdatedPayload,
  type AdminDriverStatusPayload,
  type AdminAlertPayload,
} from "./types.js";

export function emitRideUpdated(payload: AdminRideUpdatedPayload) {
  const io = getSocketServer();
  if (!io) return;
  io.to(ADMINS_ROOM).emit(EVENTS.adminRideUpdated, payload);
}

export function emitDriverStatus(payload: AdminDriverStatusPayload) {
  const io = getSocketServer();
  if (!io) return;
  io.to(ADMINS_ROOM).emit(EVENTS.adminDriverStatus, payload);
}

export function emitAdminAlert(payload: AdminAlertPayload) {
  const io = getSocketServer();
  if (!io) return;
  io.to(ADMINS_ROOM).emit(EVENTS.adminAlert, payload);
}
