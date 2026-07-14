import type { Prisma } from "@prisma/client";
import type { UserWebhookEvent, UserCreatedOrUpdatedEvent } from "../webhook.types";
import { mapClerkUser } from "../webhook.mapper";
import { syncUserFromClerk } from "../../users/user.service";

export async function handleUserUpdated(
  event: UserWebhookEvent,
  tx: Prisma.TransactionClient,
) {
  await syncUserFromClerk(mapClerkUser(event as UserCreatedOrUpdatedEvent), tx);
}
