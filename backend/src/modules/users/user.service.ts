import type { Prisma } from "@prisma/client";
import type { CreateUserFromClerkDto } from "./user.types";
import * as userRepository from "./user.repository";

export async function syncUserFromClerk(
  data: CreateUserFromClerkDto,
  tx?: Prisma.TransactionClient,
) {
  return userRepository.upsertFromClerk(data, tx);
}

export async function deleteUserFromClerk(
  clerkId: string,
  tx?: Prisma.TransactionClient,
) {
  return userRepository.deleteByClerkId(clerkId, tx);
}
