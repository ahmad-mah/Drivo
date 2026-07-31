import { clerkClient } from "@clerk/express";
import type { Prisma } from "@prisma/client";
import type { CreateUserFromClerkDto } from "./user.types";
import type { UpdateProfileDto } from "./user.schema";
import { NotFoundError } from "../../errors/NotFoundError";
import * as userRepository from "./user.repository";

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
  const user = await userRepository.findByClerkId(clerkId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function updateProfileByClerkId(clerkId: string, data: UpdateProfileDto) {
  // Clerk first so a Neon write failure is healed by the user.updated webhook re-sync
  await pushProfileToClerk(clerkId, data);

  const user = await userRepository.updateByClerkId(clerkId, data);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function deleteUserFromClerk(
  clerkId: string,
  tx?: Prisma.TransactionClient,
) {
  return userRepository.deleteByClerkId(clerkId, tx);
}
