import type { Prisma } from "@prisma/client";
import type { UserWebhookEvent } from "../webhook.types";
import { deleteUserFromClerk } from "../../users/user.service";

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
