import { handlePaymentIntentSucceeded } from "./payment-intent.succeeded";
import { handlePaymentIntentPaymentFailed } from "./payment-intent.payment_failed";
import { handleAccountUpdated } from "./account.updated";

export const handlers: Record<string, (event: any) => Promise<void>> = {
  "payment_intent.succeeded": handlePaymentIntentSucceeded,
  "payment_intent.payment_failed": handlePaymentIntentPaymentFailed,
  "account.updated": handleAccountUpdated,
};