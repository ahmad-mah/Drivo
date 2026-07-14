import type { WebhookEvent } from "@clerk/backend";
import type { Prisma } from "@prisma/client";
import { handleUserCreated } from "./user-created";
import { handleUserUpdated } from "./user-updated";
import { handleUserDeleted } from "./user-deleted";

type Handler = (event: WebhookEvent, tx: Prisma.TransactionClient) => Promise<void>;

export const handlers: Record<string, Handler> = {
  "user.created": handleUserCreated as Handler,
  "user.updated": handleUserUpdated as Handler,
  "user.deleted": handleUserDeleted as Handler,
};
