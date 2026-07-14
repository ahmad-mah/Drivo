import { prisma } from "../../config/database";
import { markProcessed } from "./webhook.repository";
import { handlers } from "./events";
import type { WebhookEvent } from "@clerk/backend";

export async function processWebhook(
  svixId: string,
  event: WebhookEvent,
): Promise<void> {
  const handler = handlers[event.type];

  if (!handler) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "Unhandled Clerk webhook",
        eventType: event.type,
        webhookId: svixId,
      }),
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    await markProcessed(tx, svixId);

    console.log(
      JSON.stringify({
        level: "info",
        message: "Webhook received",
        eventType: event.type,
        webhookId: svixId,
        userId: "data" in event ? (event.data as any)?.id : undefined,
      }),
    );

    await handler(event, tx);
  });
}
