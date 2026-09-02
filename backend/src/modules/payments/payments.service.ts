import Stripe from "stripe";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { NotFoundError } from "../../errors/NotFoundError.js";
import { BadRequestError } from "../../errors/BadRequestError.js";
import {
  getOrCreateStripeCustomer,
  savePaymentMethodId,
  getSavedPaymentMethodId,
} from "./customer.service.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-08-26.dahlia",
});

/**
 * Creates a PaymentIntent for a ride that has reached TRIP_ENDED.
 * If the rider has a saved payment method, it returns a clientSecret for the
 * payment sheet with cvvRecollection enabled. If not, it creates a new PI
 * with setup_future_usage to save the card.
 *
 * Called when the driver taps "Arrived at Destination".
 */
export async function createPaymentForRide(
  rideId: string,
  userId: string,
  email: string,
) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) throw new NotFoundError("Ride not found");
  if (ride.userId !== userId) throw new BadRequestError("Ride does not belong to this user");
  if (ride.status !== "TRIP_ENDED") throw new BadRequestError("Ride is not in TRIP_ENDED state");

  const grossAmount = Math.round(Number(ride.fare) * 100);
  const platformFee = Math.round(grossAmount * (env.PLATFORM_FEE_BPS / 10000));
  const driverShare = grossAmount - platformFee;

  // Ensure Stripe Customer exists
  const { stripeCustomerId } = await getOrCreateStripeCustomer(userId, email);

  // Get the driver's Stripe Connect account
  const connectAccounts = ride.driverId
    ? await prisma.stripeConnectAccount.findMany({
        where: { driverId: ride.driverId },
        select: { accountId: true },
      })
    : [];

  const driverAccountId = connectAccounts[0]?.accountId ?? null;

  // Check for existing PaymentIntent for this ride
  const existing = await prisma.paymentIntentRecord.findUnique({ where: { rideId } });

  if (existing) {
    // Already has a PI — retrieve its client secret
    const pi = await stripe.paymentIntents.retrieve(existing.stripePiId);
    if (pi.status === "succeeded") {
      return { alreadyPaid: true, clientSecret: null, stripeCustomerId };
    }
    return { clientSecret: pi.client_secret, alreadyPaid: false, stripeCustomerId };
  }

  // Check if rider has a saved payment method
  const savedPmId = await getSavedPaymentMethodId(userId);

  let pi: Stripe.PaymentIntent;

  if (savedPmId) {
    // Returning rider — use saved card with cvvRecollection
    try {
      pi = await stripe.paymentIntents.create({
        amount: grossAmount,
        currency: ride.currency.toLowerCase(),
        customer: stripeCustomerId,
        payment_method: savedPmId,
        metadata: { rideId, userId },
        ...(driverAccountId
          ? {
              application_fee_amount: platformFee,
              transfer_data: { destination: driverAccountId },
            }
          : {}),
      });
    } catch (err) {
      // PaymentMethod was previously used without Customer attachment
      // Clear the invalid saved payment method and retry as first ride
      if (
        err instanceof Stripe.errors.StripeInvalidRequestError &&
        err.message.includes("previously used with a PaymentIntent without Customer attachment")
      ) {
        await prisma.user.update({
          where: { id: userId },
          data: { savedPaymentMethodId: null },
        });
        // Retry without saved payment method (will have setup_future_usage)
        pi = await stripe.paymentIntents.create({
          amount: grossAmount,
          currency: ride.currency.toLowerCase(),
          customer: stripeCustomerId,
          setup_future_usage: "off_session",
          metadata: { rideId, userId },
          ...(driverAccountId
            ? {
                application_fee_amount: platformFee,
                transfer_data: { destination: driverAccountId },
              }
            : {}),
        });
      } else {
        throw err;
      }
    }
  } else {
    // First ride — save card for future use
    pi = await stripe.paymentIntents.create({
      amount: grossAmount,
      currency: ride.currency.toLowerCase(),
      customer: stripeCustomerId,
      setup_future_usage: "off_session",
      metadata: { rideId, userId },
      ...(driverAccountId
        ? {
            application_fee_amount: platformFee,
            transfer_data: { destination: driverAccountId },
          }
        : {}),
    });
  }

  // Save the PaymentIntent record
  await prisma.paymentIntentRecord.create({
    data: {
      rideId,
      userId,
      stripePiId: pi.id,
      grossAmount,
      platformFee,
      driverShare,
      currency: ride.currency,
      status: "REQUIRES_PAYMENT",
      driverId: ride.driverId,
    },
  });

  return { clientSecret: pi.client_secret, alreadyPaid: false, stripeCustomerId };
}

/**
 * Called by the webhook after payment succeeds.
 * Updates ride paymentStatus and saves the payment method if it was the first ride.
 */
export async function handlePaymentSucceeded(stripePiId: string) {
  const record = await prisma.paymentIntentRecord.findUnique({
    where: { stripePiId },
    include: { ride: true },
  });

  if (!record) return;

  // Update record status
  await prisma.paymentIntentRecord.update({
    where: { stripePiId },
    data: { status: "CAPTURED" },
  });

  // Update ride payment status
  await prisma.ride.update({
    where: { id: record.rideId },
    data: { paymentStatus: "PAID" },
  });

  // Broadcast to rider + driver so both UIs refetch the updated paymentStatus
  const ride = await prisma.ride.findUnique({
    where: { id: record.rideId },
    select: {
      user: { select: { clerkId: true } },
      driver: { select: { user: { select: { clerkId: true } } } },
    },
  });
  if (ride) {
    const { notifyRideUpdated } = await import("../rides/ride.notifications.js");
    const clerkIds = [
      ride.user?.clerkId,
      ride.driver?.user?.clerkId,
    ].filter(Boolean) as string[];
    if (clerkIds.length > 0) {
      await notifyRideUpdated(clerkIds, record.rideId);
    }
  }

  // Save payment method if it was the first ride
  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    select: { savedPaymentMethodId: true },
  });

  if (!user?.savedPaymentMethodId) {
    const pi = await stripe.paymentIntents.retrieve(stripePiId);
    const paymentMethodId = pi.payment_method as string | null;
    if (paymentMethodId) {
      await savePaymentMethodId(record.userId, paymentMethodId);
    }
  }

  // Create Connect transfer if applicable
  if (record.driverId && record.driverShare > 0 && record.stripeTransferId === null) {
    try {
      const { createTransfer } = await import("./transfers/transfer.service.js");
      await createTransfer(
        record.rideId,
        stripePiId,
        record.driverId,
        record.driverShare,
        record.currency,
      );

      // Upsert weekly DriverPayout record for the admin panel
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const periodStart = new Date(now);
      periodStart.setDate(now.getDate() + mondayOffset);
      periodStart.setHours(0, 0, 0, 0);
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);

      const platformFee = record.grossAmount - record.driverShare;
      await prisma.driverPayout.upsert({
        where: {
          driverId_periodStart_periodEnd: {
            driverId: record.driverId,
            periodStart,
            periodEnd,
          },
        },
        create: {
          driverId: record.driverId,
          periodStart,
          periodEnd,
          grossEarnings: record.grossAmount,
          commission: platformFee,
          netAmount: record.driverShare,
          status: "PENDING",
        },
        update: {
          grossEarnings: { increment: record.grossAmount },
          commission: { increment: platformFee },
          netAmount: { increment: record.driverShare },
        },
      });
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "error",
          message: "Transfer creation failed after payment",
          stripePiId,
          error: (err as Error).message,
        }),
      );
    }
  }
}

/**
 * Called by the webhook after payment fails.
 * Updates ride paymentStatus to FAILED.
 */
export async function handlePaymentFailed(stripePiId: string) {
  const record = await prisma.paymentIntentRecord.findUnique({
    where: { stripePiId },
  });

  if (!record) return;

  await prisma.paymentIntentRecord.update({
    where: { stripePiId },
    data: { status: "FAILED" },
  });

  await prisma.ride.update({
    where: { id: record.rideId },
    data: { paymentStatus: "FAILED" },
  });
}

export async function getPaymentIntentRecord(stripePiId: string) {
  const record = await prisma.paymentIntentRecord.findUnique({
    where: { stripePiId },
  });
  if (!record) {
    throw new NotFoundError("Payment intent record not found");
  }
  return record;
}

export async function getUserForPayment(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    select: { email: true, stripeCustomerId: true, savedPaymentMethodId: true },
  });
}

export async function getRidePaymentStatus(rideId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: { paymentStatus: true, status: true },
  });
  if (!ride) throw new NotFoundError("Ride not found");
  return ride;
}

export function getStripeClient(): Stripe {
  return stripe;
}

/** Alias used by connect.service.ts */
export const getStripe = getStripeClient;
