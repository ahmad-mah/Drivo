import { handlePaymentIntentSucceeded } from "./payment-intent.succeeded.js";
import { handlePaymentIntentPaymentFailed } from "./payment-intent.payment_failed.js";
import { handleAccountUpdated } from "./account.updated.js";

export const handlers: Record<string, (event: any) => Promise<void>> = {
  "payment_intent.succeeded": handlePaymentIntentSucceeded,
  "payment_intent.payment_failed": handlePaymentIntentPaymentFailed,
  "account.updated": handleAccountUpdated,
};