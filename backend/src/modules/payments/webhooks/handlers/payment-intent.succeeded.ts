import Stripe from "stripe";
import { handlePaymentSucceeded } from "../../payments.service";

export async function handlePaymentIntentSucceeded(
  event: any,
) {
  const data = event.data.object as Stripe.PaymentIntent;
  const stripePiId = data.id;

  await handlePaymentSucceeded(stripePiId);
}
