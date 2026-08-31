import Stripe from "stripe";
import { prisma } from "../../config/database";
import { env } from "../../config/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-08-26.dahlia",
});

/**
 * Retrieves or creates a Stripe Customer for the given user.
 * The customer is used to save payment methods for future rides.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
): Promise<{ stripeCustomerId: string; isNew: boolean }> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (existing?.stripeCustomerId) {
    return { stripeCustomerId: existing.stripeCustomerId, isNew: false };
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return { stripeCustomerId: customer.id, isNew: true };
}

/**
 * Saves a payment method to the user's Stripe Customer.
 * Called after the first successful payment with setup_future_usage.
 */
export async function savePaymentMethodId(
  userId: string,
  paymentMethodId: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { savedPaymentMethodId: paymentMethodId },
  });
}

/**
 * Retrieves the saved payment method ID for a user.
 */
export async function getSavedPaymentMethodId(
  userId: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { savedPaymentMethodId: true },
  });
  return user?.savedPaymentMethodId ?? null;
}
