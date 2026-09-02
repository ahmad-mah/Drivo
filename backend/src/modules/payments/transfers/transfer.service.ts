import { getStripe } from "../payments.service.js";
import { prisma } from "../../../config/database.js";

export async function createTransfer(
  rideId: string,
  stripePiId: string,
  driverId: string,
  driverShare: number,
  currency = "USD",
): Promise<{ transfer: any; record: any }> {
  const stripe = getStripe();
  const idempotencyKey = `ride:${rideId}:driver-transfer`;

  const transfer = await stripe.transfers.create(
    {
      amount: driverShare,
      currency,
      destination: driverId,
      source_transaction: stripePiId,
      metadata: { rideId },
    },
    { idempotencyKey },
  );

  const record = await prisma.paymentIntentRecord.update({
    where: { stripePiId },
    data: {
      stripeTransferId: transfer.id,
      transferStatus: "PENDING" as const,
    },
  });

  return { transfer, record };
}

export async function retrieveTransfer(transferId: string): Promise<any> {
  const stripe = getStripe();
  return stripe.transfers.retrieve(transferId);
}

export async function updateTransferStatus(
  stripeTransferId: string,
  status: string,
  error?: string,
) {
  const record = await prisma.paymentIntentRecord.findFirst({
    where: { stripeTransferId },
  });
  if (!record) return null;

  const updated = await prisma.paymentIntentRecord.update({
    where: { id: record.id },
    data: {
      transferStatus: status as any,
      transferAttempts: { increment: 1 },
      transferLastError: error ?? null,
    },
  });

  return updated;
}

export async function markTransferCompleted(stripeTransferId: string) {
  await prisma.paymentIntentRecord.updateMany({
    where: { stripeTransferId },
    data: {
      transferStatus: "COMPLETED" as const,
    },
  });
}

export async function markTransferFailed(
  stripeTransferId: string,
  error: string,
) {
  await prisma.paymentIntentRecord.updateMany({
    where: { stripeTransferId },
    data: {
      transferStatus: "FAILED" as const,
      transferLastError: error,
      transferAttempts: { increment: 1 },
    },
  });
}

export async function getPendingTransfers() {
  return prisma.paymentIntentRecord.findMany({
    where: {
      transferStatus: {
        in: ["PENDING", "PROCESSING"],
      },
    },
    take: 50,
  });
}

export async function processPendingTransfers() {
  const pending = await getPendingTransfers();
  for (const record of pending) {
    if (!record.stripeTransferId) continue;
    try {
      const transfer = await retrieveTransfer(record.stripeTransferId);
      const status = (transfer as any).status ?? (transfer as any).data?.status;
      if (status === "paid") {
        await markTransferCompleted(record.stripeTransferId);
      } else if (status === "failed") {
        await markTransferFailed(
          record.stripeTransferId,
          (transfer as any).data?.failure_reason ?? (transfer as any).failure_reason ?? "Transfer failed",
        );
      }
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "error",
          message: "Failed to retrieve transfer",
          stripeTransferId: record.stripeTransferId,
          error: (err as Error).message,
        }),
      );
    }
  }
}