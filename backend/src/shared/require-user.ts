import { NotFoundError } from "../errors/NotFoundError";
import * as userRepository from "../modules/users/user.repository";
import type { User } from "@prisma/client";

/** Resolves the authenticated user by Clerk ID, or throws. */
export async function requireUserByClerkId(clerkId: string): Promise<User> {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) throw new NotFoundError("User not found");
  return user;
}