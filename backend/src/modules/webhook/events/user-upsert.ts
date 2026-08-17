import type { Prisma } from "@prisma/client";
import type { UserCreatedOrUpdatedEvent } from "../webhook.types";
import { mapClerkUser } from "../webhook.mapper";
import { syncUserFromClerk } from "../../users/user.service";

export async function handleUserUpsert(
  event: UserCreatedOrUpdatedEvent,
  tx: Prisma.TransactionClient,
) {
  await syncUserFromClerk(mapClerkUser(event), tx);
}