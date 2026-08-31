import { useCallback, useState } from "react";
import { usePaymentSheet } from "@stripe/stripe-react-native";

export function useStripePayment() {
  const { loading, initPaymentSheet, presentPaymentSheet } =
    usePaymentSheet();
  const [error, setError] = useState<string | null>(null);

  /**
   * Initializes and presents the Stripe PaymentSheet.
   * @param clientSecret - The PI or SI client secret
   * @param cvvRecollection - When true, indicates returning rider with saved card (PaymentSheet handles CVC natively)
   */
  const initAndPresentPayment = useCallback(
    async (clientSecret: string, cvvRecollection = false): Promise<any> => {
      setError(null);
      const publishableKey =
        process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
      if (
        !/^pk_(test|live)_/.test(publishableKey) ||
        /KEY$/i.test(publishableKey)
      ) {
        setError(
          "Stripe publishable key is missing or invalid. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in mobile/.env to the pk_test_ key from https://dashboard.stripe.com/apikeys (same account as the backend), then restart Metro.",
        );
        return null;
      }
      try {
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: "Drivo",
        });

        if (initError) {
          setError(initError.message ?? "Failed to initialize payment sheet");
          return null;
        }

        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          if (presentError.code === "Canceled") {
            setError("Payment canceled");
            return null;
          }
          setError(presentError.message ?? "Payment failed");
          return null;
        }

        return { success: true };
      } catch (err) {
        setError((err as Error).message);
        return null;
      }
    },
    [initPaymentSheet, presentPaymentSheet],
  );

  return { initAndPresentPayment, loading, error, setError };
}
