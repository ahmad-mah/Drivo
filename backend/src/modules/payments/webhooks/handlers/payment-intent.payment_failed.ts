import Stripe from "stripe";
import { handlePaymentFailed } from "../../payments.service";

export async function handlePaymentIntentPaymentFailed(
  event: any,
) {
  const data = event.data.object as Stripe.PaymentIntent;
  const stripePiId = data.id;

  await handlePaymentFailed(stripePiId);
}
