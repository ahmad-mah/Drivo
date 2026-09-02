import type { WebhookEvent } from "@clerk/backend";
import type { Prisma } from "@prisma/client";
import { handleUserUpsert } from "./user-upsert.js";
import { handleUserDeleted } from "./user-deleted.js";

type Handler = (event: WebhookEvent, tx: Prisma.TransactionClient) => Promise<void>;

export const handlers: Record<string, Handler> = {
  "user.created": handleUserUpsert as Handler,
  "user.updated": handleUserUpsert as Handler,
  "user.deleted": handleUserDeleted as Handler,
};