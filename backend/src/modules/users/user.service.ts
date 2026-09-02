import { clerkClient } from "@clerk/express";
import type { Prisma } from "@prisma/client";
import type { CreateUserFromClerkDto } from "./user.types.js";
import type { UpdateProfileDto } from "./user.schema.js";
import { requireUserByClerkId } from "../../shared/require-user.js";
import * as userRepository from "./user.repository.js";

// Fields editable here that Clerk also stores. Extend when a new PATCH field is Clerk-eligible.
// imageUrl is excluded: Clerk stores image files (uploaded client-side via setProfileImage), not URLs.
// phone is excluded: unverified phone numbers can't be primary, so the webhook would revert Neon.
const clerkProfileFieldMap: Record<string, string> = {
  firstName: "firstName",
  lastName: "lastName",
};

async function pushProfileToClerk(clerkId: string, data: UpdateProfileDto) {
  const params: Record<string, string> = {};
  for (const [dtoKey, clerkParam] of Object.entries(clerkProfileFieldMap)) {
    if (data[dtoKey as keyof UpdateProfileDto] !== undefined) {
      params[clerkParam] = data[dtoKey as keyof UpdateProfileDto] as string;
    }
  }
  if (Object.keys(params).length > 0) {
    await clerkClient.users.updateUser(clerkId, params);
  }
}

export async function syncUserFromClerk(
  data: CreateUserFromClerkDto,
  tx?: Prisma.TransactionClient,
) {
  return userRepository.upsertFromClerk(data, tx);
}

export async function getProfileByClerkId(clerkId: string) {
  return requireUserByClerkId(clerkId);
}

export async function updateProfileByClerkId(clerkId: string, data: UpdateProfileDto) {
  // Clerk first so a Neon write failure is healed by the user.updated webhook re-sync
  await pushProfileToClerk(clerkId, data);

  // prisma.user.update throws P2025 when the user is missing, so no null check needed
  return userRepository.updateByClerkId(clerkId, data);
}

export async function deleteUserFromClerk(
  clerkId: string,
  tx?: Prisma.TransactionClient,
) {
  return userRepository.deleteByClerkId(clerkId, tx);
}
