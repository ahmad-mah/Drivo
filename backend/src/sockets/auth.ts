import { verifyToken } from "@clerk/backend";
import type { Socket } from "socket.io";
import { env } from "../config/env.js";
import * as userRepository from "../modules/users/user.repository.js";
import type { SocketUser } from "./types.js";

/**
 * Authenticates a socket handshake using a Clerk session token supplied in
 * `auth.token`. Sockets are not Express requests, so Clerk's express
 * middleware cannot be used here — we verify the JWT directly instead.
 */
export async function authenticateSocket(
  socket: Socket,
): Promise<SocketUser | null> {
  const token = socket.handshake.auth?.token;
  if (typeof token !== "string" || token.length === 0) return null;

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    const clerkId = typeof payload.sub === "string" ? payload.sub : null;
    if (!clerkId) return null;

    const user = await userRepository.findByClerkId(clerkId);
    return user
      ? { userId: user.id, clerkId: user.clerkId, role: user.role }
      : null;
  } catch {
    return null;
  }
}