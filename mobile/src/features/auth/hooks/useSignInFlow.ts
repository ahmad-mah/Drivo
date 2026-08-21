import { useSignIn } from "@clerk/expo";
import { useState, useCallback } from "react";
import { router } from "expo-router";
import { mapSignInErrors } from "../data/clerk-error-mapper";
import { runClerk } from "../data/runClerk";
import type { AuthError } from "../domain/auth-error";

type SignInParams = {
  email: string;
  password: string;
};

export function useSignInFlow() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [operationError, setOperationError] = useState<AuthError | null>(null);

  const signalErrors = mapSignInErrors(errors);
  const authError = operationError ?? signalErrors;

  const signInAction = useCallback(
    async (params: SignInParams): Promise<boolean> => {
      setIsLoading(true);
      setOperationError(null);
      try {
        const passwordError = await runClerk(() =>
          signIn.password({
            emailAddress: params.email,
            password: params.password,
          }),
        );
        if (passwordError) {
          setOperationError(passwordError);
          return false;
        }

        if (signIn.status !== "complete") return false;

        const finalizeError = await runClerk(() =>
          signIn.finalize({
            navigate: ({ session, decorateUrl }) => {
              if (session?.currentTask) return;
              router.replace(decorateUrl("/") as any);
            },
          }),
        );
        if (finalizeError) {
          setOperationError(finalizeError);
          return false;
        }

        return true;
      } finally {
        setIsLoading(false);
      }
    },
    [signIn],
  );

  return {
    signIn: signInAction,
    isLoading: isLoading || fetchStatus === "fetching",
    authError,
  };
}