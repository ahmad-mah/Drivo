import type { Prisma } from '@prisma/client';

export async function markProcessed(tx: Prisma.TransactionClient, svixId: string): Promise<void> {
  await tx.processedWebhook.create({ data: { id: svixId } });
}
