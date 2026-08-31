import { prisma } from "../../../config/database";
import { handlers } from "./handlers";

export async function processStripeWebhook(event: any) {
  const handler = handlers[event.type];

  if (!handler) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "Unhandled Stripe webhook",
        eventType: event.type,
        webhookId: event.id,
      }),
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    await markEventProcessed(tx, event.id, event.type, event);
    await handler(event);
  });
}

async function markEventProcessed(
  tx: any,
  eventId: string,
  type: string,
  payload: any,
) {
  const existing = await tx.stripeWebhookEvent.findUnique({
    where: { id: eventId },
  });

  if (existing?.processedAt) {
    return;
  }

  await tx.stripeWebhookEvent.upsert({
    where: { id: eventId },
    create: {
      id: eventId,
      type,
      payload,
      processedAt: new Date(),
    },
    update: { processedAt: new Date() },
  });
}