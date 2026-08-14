import { io, type Socket } from "socket.io-client";
import { API_URL } from "../../../env";
import { getAccessToken } from "../../../lib/token-provider";
import type { LiveDriver } from "../types/driver";

const EVENTS = {
  adminJoin: "admin:join",
  driversLocations: "drivers:locations",
} as const;

type SnapshotListener = (drivers: LiveDriver[]) => void;

let socket: Socket | null = null;
let snapshotListener: SnapshotListener | null = null;

/**
 * Connects the admin realtime listener. Emits `admin:join` so the backend puts
 * this socket in the admins room and pushes a fresh snapshot immediately;
 * `drivers:locations` then streams the throttled live map updates.
 */
export async function connectLiveMap(listener: SnapshotListener) {
  snapshotListener = listener;

  if (socket?.connected) return socket;

  socket = io(API_URL, {
    transports: ["websocket"],
    auth: async (cb) => {
      const token = await getAccessToken();
      cb({ token });
    },
  });

  socket.on(EVENTS.driversLocations, (snapshot: LiveDriver[]) => {
    snapshotListener?.(snapshot);
  });

  socket.on("connect", () => {
    socket?.emit(EVENTS.adminJoin);
  });

  return socket;
}

export function disconnectLiveMap() {
  snapshotListener = null;
  socket?.disconnect();
  socket = null;
}