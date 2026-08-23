import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/constants/env";
import { getAccessToken } from "@/api/token-provider";
import type {
  DriverAvailabilityResult,
  IncomingRideRequest,
} from "@/api/drivers/drivers.api";

const DRIVER_SOCKET_EVENTS = {
  online: "driver:online",
  offline: "driver:offline",
  location: "driver:location",
  status: "driver:status",
  heartbeat: "driver:heartbeat",
  newRideRequest: "ride:new-request",
} as const;

type StatusListener = (status: DriverAvailabilityResult) => void;
type ConnectionListener = (connected: boolean) => void;
type IncomingRideListener = (request: IncomingRideRequest) => void;
/** Fires on every successful (re)connect — the hook uses it to re-assert an
 *  online state that a connectivity drop may have let the server sweep. */
type ConnectListener = () => void;

let socket: Socket | null = null;
let statusListener: StatusListener | null = null;
let connectionListener: ConnectionListener | null = null;
let connectListener: ConnectListener | null = null;
let incomingRideListener: IncomingRideListener | null = null;

/**
 * Connects the driver's realtime socket. Socket.io re-auths the handshake on
 * every (re)connect attempt, so we pass `auth` as a function that pulls a
 * fresh Clerk token each time instead of caching a stale one.
 */
export async function connectDriverSocket(
  onStatus: StatusListener,
  onConnected?: ConnectListener,
) {
  connectListener = onConnected ?? null;

  if (socket?.connected) {
    statusListener = onStatus;
    return socket;
  }

  statusListener = onStatus;

  socket = io(API_URL, {
    transports: ["websocket"],
    auth: async (cb) => {
      const token = await getAccessToken();
      cb({ token });
    },
  });

  socket.on(DRIVER_SOCKET_EVENTS.status, (payload: DriverAvailabilityResult) => {
    statusListener?.(payload);
  });

  socket.on(DRIVER_SOCKET_EVENTS.newRideRequest, (payload: IncomingRideRequest) => {
    incomingRideListener?.(payload);
  });

  socket.on("connect", () => {
    connectionListener?.(true);
    connectListener?.();
  });
  socket.on("disconnect", () => connectionListener?.(false));

  return socket;
}

export function setConnectionListener(listener: ConnectionListener | null) {
  connectionListener = listener;
  // Surface the current state immediately so callers don't miss a transition
  // that already happened (e.g. screen focused after the socket connected).
  listener?.(socket?.connected ?? false);
}

/**
 * Registers the handler for dispatched ride requests. Only one screen shows
 * the incoming-request card at a time, so a single slot (like the status
 * listener) is enough — re-mounts simply overwrite it.
 */
export function setIncomingRideListener(listener: IncomingRideListener | null) {
  incomingRideListener = listener;
}

export function emitGoOnline() {
  socket?.emit(DRIVER_SOCKET_EVENTS.online);
}

export function emitGoOffline() {
  socket?.emit(DRIVER_SOCKET_EVENTS.offline);
}

export function emitLocation(latitude: number, longitude: number, heading?: number) {
  if (socket?.connected) {
    socket.emit(DRIVER_SOCKET_EVENTS.location, { latitude, longitude, heading });
  }
}

export function emitHeartbeat() {
  if (socket?.connected) {
    socket.emit(DRIVER_SOCKET_EVENTS.heartbeat);
  }
}

export function isDriverSocketConnected() {
  return socket?.connected ?? false;
}

export function disposeDriverSocket() {
  statusListener = null;
  connectionListener = null;
  connectListener = null;
  incomingRideListener = null;
  socket?.disconnect();
  socket = null;
}