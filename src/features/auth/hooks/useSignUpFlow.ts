import { useSignUp } from "@clerk/expo";
import { useState, useCallback } from "react";
import { mapClerkError, mapSignUpErrors } from "../data/clerk-error-mapper";
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
        const { error } = await signUp.password({
          emailAddress: params.email,
          password: params.password,
          firstName: params.firstName,
        });
        if (error) {
          setOperationError(mapClerkError(error));
          return false;
        }
        await signUp.verifications.sendEmailCode();
        return true;
      } catch (error) {
        setOperationError(mapClerkError(error));
        return false;
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
        const { error } =
          await signUp.verifications.verifyEmailCode({ code });
        if (error) {
          setOperationError(mapClerkError(error));
          return false;
        }
        if (signUp.status === "complete") {
          await signUp.finalize();
          return true;
        }
        return false;
      } catch (error) {
        setOperationError(mapClerkError(error));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [signUp],
  );

  const resendCode = useCallback(async () => {
    setOperationError(null);
    try {
      await signUp.verifications.sendEmailCode();
    } catch (error) {
      setOperationError(mapClerkError(error));
    }
  }, [signUp]);

  return {
    register,
    verifyEmail,
    resendCode,
    status,
    isLoading: isLoading || fetchStatus === "fetching",
    authError,
  };
}
