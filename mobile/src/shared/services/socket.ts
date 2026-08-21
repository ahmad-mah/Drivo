import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/constants/env";
import { getAccessToken } from "@/api/token-provider";

const SOCKET_URL = API_URL.replace(/\/$/, "");

let socket: Socket | null = null;
let connectPromise: Promise<Socket | null> | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export async function connectSocket(): Promise<Socket | null> {
  if (socket?.connected) return socket;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const token = await getAccessToken();

    if (!socket) {
      socket = io(SOCKET_URL, {
        auth: { token: token ?? undefined },
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1_000,
        reconnectionDelayMax: 10_000,
      });
    } else {
      socket.auth = { token: token ?? undefined };
      if (!socket.connected) {
        socket.connect();
      }
    }

    return new Promise<Socket | null>((resolve) => {
      if (socket!.connected) {
        resolve(socket);
        return;
      }

      const timeout = setTimeout(() => resolve(socket), 5_000);
      socket!.once("connect", () => {
        clearTimeout(timeout);
        resolve(socket!);
      });
      socket!.once("connect_error", () => {
        clearTimeout(timeout);
        resolve(socket);
      });
    });
  })();

  try {
    return await connectPromise;
  } finally {
    connectPromise = null;
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  connectPromise = null;
}
