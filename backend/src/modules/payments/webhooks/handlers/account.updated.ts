import Stripe from "stripe";
import { prisma } from "../../../../config/database.js";

export async function handleAccountUpdated(event: any) {
  const data = event.data.object as Stripe.Account;
  const accountId = data.id;

  const driverId = data.metadata?.driverId;
  if (!driverId) return;

  await prisma.stripeConnectAccount.upsert({
    where: { driverId },
    create: {
      driverId,
      accountId,
      chargesEnabled: data.charges_enabled ?? false,
      payoutsEnabled: data.payouts_enabled ?? false,
       requirements: (data.requirements ?? null) as any,
    },
    update: {
      accountId,
      chargesEnabled: data.charges_enabled ?? false,
      payoutsEnabled: data.payouts_enabled ?? false,
       requirements: (data.requirements ?? null) as any,
      updatedAt: new Date(),
    },
  });
}