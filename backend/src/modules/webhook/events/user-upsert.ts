import type { Prisma } from "@prisma/client";
import type { UserCreatedOrUpdatedEvent } from "../webhook.types.js";
import { mapClerkUser } from "../webhook.mapper.js";
import { syncUserFromClerk } from "../../users/user.service.js";

export async function handleUserUpsert(
  event: UserCreatedOrUpdatedEvent,
  tx: Prisma.TransactionClient,
) {
  await syncUserFromClerk(mapClerkUser(event), tx);
}