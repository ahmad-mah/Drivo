import { useSignUp } from "@clerk/expo";
import { useState, useCallback } from "react";
import { mapSignUpErrors } from "../data/clerk-error-mapper";
import { runClerk } from "../data/runClerk";
import type { AuthError } from "../domain/auth-error";

type RegisterParams = {
  email: string;
  password: string;
  firstName: string;
};

export function useSignUpFlow() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [operationError, setOperationError] = useState<AuthError | null>(null);

  const status = signUp?.status ?? null;
  const signalErrors = mapSignUpErrors(errors);
  const authError = operationError ?? signalErrors;

  const register = useCallback(
    async (params: RegisterParams): Promise<boolean> => {
      setIsLoading(true);
      setOperationError(null);
      try {
        const error = await runClerk(() =>
          signUp.password({
            emailAddress: params.email,
            password: params.password,
            firstName: params.firstName,
          }),
        );
        if (error) {
          setOperationError(error);
          return false;
        }
        return (await runClerk(() => signUp.verifications.sendEmailCode())) === null;
      } finally {
        setIsLoading(false);
      }
    },
    [signUp],
  );

  const verifyEmail = useCallback(
    async (code: string): Promise<boolean> => {
      setIsLoading(true);
      setOperationError(null);
      try {
        const error = await runClerk(() =>
          signUp.verifications.verifyEmailCode({ code }),
        );
        if (error) {
          setOperationError(error);
          return false;
        }
        return signUp.status === "complete";
      } finally {
        setIsLoading(false);
      }
    },
    [signUp],
  );

  const finalize = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const error = await runClerk(() => signUp.finalize());
      if (error) {
        setOperationError(error);
        return false;
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [signUp]);

  const resendCode = useCallback(async () => {
    setOperationError(null);
    const error = await runClerk(() => signUp.verifications.sendEmailCode());
    if (error) setOperationError(error);
  }, [signUp]);

  return {
    register,
    verifyEmail,
    resendCode,
    finalize,
    status,
    isLoading: isLoading || fetchStatus === "fetching",
    authError,
  };
}