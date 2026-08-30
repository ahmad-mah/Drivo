import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "../env";
import { getAccessToken } from "./token-provider";

const EVENTS = {
  adminJoin: "admin:join",
  driversLocations: "drivers:locations",
  adminRideUpdated: "admin:ride:updated",
  adminDriverStatus: "admin:driver:status",
  adminAlert: "admin:alert",
} as const;

export interface AdminSocketHandlers {
  onRideUpdated?: (payload: {
    rideId: string;
    newStatus: string;
    timestamp: string;
  }) => void;
  onDriverStatus?: (payload: {
    driverId: string;
    isOnline: boolean;
    approvalStatus: string;
    timestamp: string;
  }) => void;
  onAlert?: (payload: {
    type: string;
    count: number;
    severity: string;
    data?: unknown;
  }) => void;
}

let globalSocket: Socket | null = null;

function getSocket(): Socket | null {
  return globalSocket;
}

export function useAdminSocket(handlers: AdminSocketHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (globalSocket?.connected) return;

    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: async (cb) => {
        const token = await getAccessToken();
        cb({ token });
      },
    });

    socket.on("connect", () => {
      socket.emit(EVENTS.adminJoin);
    });

    socket.on(EVENTS.adminRideUpdated, (payload) => {
      handlersRef.current.onRideUpdated?.(payload);
    });

    socket.on(EVENTS.adminDriverStatus, (payload) => {
      handlersRef.current.onDriverStatus?.(payload);
    });

    socket.on(EVENTS.adminAlert, (payload) => {
      handlersRef.current.onAlert?.(payload);
    });

    globalSocket = socket;

    return () => {
      socket.disconnect();
      globalSocket = null;
    };
  }, []);
}

export function useDriversLocations(
  listener: (drivers: unknown[]) => void,
) {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (snapshot: unknown[]) => listenerRef.current(snapshot);
    socket.on(EVENTS.driversLocations, handler);
    return () => {
      socket.off(EVENTS.driversLocations, handler);
    };
  }, []);
}

export { getSocket };
