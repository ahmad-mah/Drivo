import type { Prisma } from "@prisma/client";
import type { UserWebhookEvent } from "../webhook.types.js";
import { deleteUserFromClerk } from "../../users/user.service.js";

export async function handleUserDeleted(
  event: UserWebhookEvent,
  tx: Prisma.TransactionClient,
) {
  const { id } = event.data;

  if (!id) {
    return;
  }

  await deleteUserFromClerk(id, tx);
}
