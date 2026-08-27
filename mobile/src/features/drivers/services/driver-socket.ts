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
  rideUpdated: "ride:updated",
} as const;

type StatusListener = (status: DriverAvailabilityResult) => void;
type ConnectionListener = (connected: boolean) => void;
type IncomingRideListener = (request: IncomingRideRequest) => void;
/** Receives the rideId so subscribers can filter for their own ride. */
type RideUpdateListener = (rideId: string) => void;
/** Fires on every successful (re)connect — the hook uses it to re-assert an
 *  online state that a connectivity drop may have let the server sweep. */
type ConnectListener = () => void;

/**
 * Listener registry: single slots for screen-owned events, a Set for
 * ride:updated which several hooks subscribe to at once.
 */
const listeners = {
  status: null as StatusListener | null,
  connection: null as ConnectionListener | null,
  connect: null as ConnectListener | null,
  incomingRide: null as IncomingRideListener | null,
  rideUpdate: new Set<RideUpdateListener>(),
};

let socket: Socket | null = null;

/**
 * Connects the driver's realtime socket. Socket.io re-auths the handshake on
 * every (re)connect attempt, so we pass `auth` as a function that pulls a
 * fresh Clerk token each time instead of caching a stale one.
 */
export async function connectDriverSocket(
  onStatus: StatusListener,
  onConnected?: ConnectListener,
) {
  listeners.connect = onConnected ?? null;

  if (socket?.connected) {
    listeners.status = onStatus;
    return socket;
  }

  listeners.status = onStatus;

  socket = io(API_URL, {
    transports: ["websocket"],
    auth: async (cb) => {
      const token = await getAccessToken();
      cb({ token });
    },
  });

  socket.on(DRIVER_SOCKET_EVENTS.status, (payload: DriverAvailabilityResult) => {
    listeners.status?.(payload);
  });

  socket.on(DRIVER_SOCKET_EVENTS.newRideRequest, (payload: IncomingRideRequest) => {
    listeners.incomingRide?.(payload);
  });

  socket.on(DRIVER_SOCKET_EVENTS.rideUpdated, (payload: { rideId: string }) => {
    // Payload carries the rideId so subscribers filter for their own ride.
    listeners.rideUpdate.forEach((listener) => listener(payload?.rideId));
  });

  socket.on("connect", () => {
    listeners.connection?.(true);
    listeners.connect?.();
  });
  socket.on("disconnect", () => listeners.connection?.(false));

  return socket;
}

export function setConnectionListener(listener: ConnectionListener | null) {
  listeners.connection = listener;
  // Surface the current state immediately so callers don't miss a transition
  // that already happened (e.g. screen focused after the socket connected).
  listener?.(socket?.connected ?? false);
}

/**
 * Registers the handler for dispatched ride requests. Only one screen shows
 * the incoming-request card at a time, so a single slot is enough —
 * re-mounts simply overwrite it.
 */
export function setIncomingRideListener(listener: IncomingRideListener | null) {
  listeners.incomingRide = listener;
}

/** Registers a trip-lifecycle handler; returns its unsubscribe function. */
export function setRideUpdateListener(listener: RideUpdateListener | null) {
  if (!listener) return () => {};
  listeners.rideUpdate.add(listener);
  return () => {
    listeners.rideUpdate.delete(listener);
  };
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
  listeners.status = null;
  listeners.connection = null;
  listeners.connect = null;
  listeners.incomingRide = null;
  listeners.rideUpdate.clear();
  socket?.disconnect();
  socket = null;
}
