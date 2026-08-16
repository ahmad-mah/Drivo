import { useSignInWithGoogle } from "@clerk/expo/google";
import { useState, useCallback } from "react";
import { goToHome } from "@/shared/services/navigation";
import { mapClerkError } from "../data/clerk-error-mapper";
import { createAuthError } from "../domain/auth-error";
import type { AuthError } from "../domain/auth-error";

const GOOGLE_SIGN_IN_TIMEOUT_MS = 20_000;
const GOOGLE_SIGN_IN_TIMEOUT = Symbol("google_sign_in_timeout");

export function useGoogleSignInFlow() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    // NOTE: the native flow can hang forever when Play Services is in a
    // transient frozen state, so never let the spinner wait on it indefinitely.
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(GOOGLE_SIGN_IN_TIMEOUT),
        GOOGLE_SIGN_IN_TIMEOUT_MS,
      );
    });

    try {
      const result = await Promise.race([
        startGoogleAuthenticationFlow(),
        timeoutPromise,
      ]);
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
      goToHome();
      return true;
    } catch (error: unknown) {
      if (error === GOOGLE_SIGN_IN_TIMEOUT) {
        setAuthError(
          createAuthError({
            globalErrors: [
              {
                code: "google_signin_timeout",
                message: "Google sign-in timed out. Please try again.",
              },
            ],
          }),
        );
        return false;
      }
      const err = error as { code?: string };
      if (err.code === "SIGN_IN_CANCELLED" || err.code === "-5") {
        return false;
      }
      setAuthError(mapClerkError(error));
      return false;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [startGoogleAuthenticationFlow]);

  return { signInWithGoogle, isLoading, authError };
}
