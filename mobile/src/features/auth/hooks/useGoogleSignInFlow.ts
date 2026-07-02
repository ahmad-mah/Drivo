import { useSignInWithGoogle } from "@clerk/expo/google";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { mapClerkError } from "../data/clerk-error-mapper";
import { createAuthError } from "../domain/auth-error";
import type { AuthError } from "../domain/auth-error";

export function useGoogleSignInFlow() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const router = useRouter();

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await startGoogleAuthenticationFlow();
      const { createdSessionId, setActive } = result;

      if (!createdSessionId || !setActive) {
        setAuthError(
          createAuthError({
            globalErrors: [
              {
                code: "google_signin_failed",
                message:
                  "Google sign-in could not complete. Make sure Google SSO is configured in the Clerk Dashboard.",
              },
            ],
          }),
        );
        return false;
      }

      await setActive({ session: createdSessionId });
      router.replace("/(app)/(root)/(tabs)/home");
      return true;
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "SIGN_IN_CANCELLED" || err.code === "-5") {
        return false;
      }
      setAuthError(mapClerkError(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [startGoogleAuthenticationFlow, router]);

  return { signInWithGoogle, isLoading, authError };
}
