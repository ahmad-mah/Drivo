import type {
  ClerkAPIError,
} from "@clerk/shared/error";
import { isClerkAPIResponseError } from "@clerk/shared/error";
import type {
  AuthError,
  AuthFieldError,
  AuthGlobalError,
} from "../domain/auth-error";
import type { SignInErrors, SignUpErrors } from "@clerk/shared/types";

function clerkErrorToFieldError(
  err: ClerkAPIError,
): AuthFieldError | null {
  const paramName = err.meta?.paramName;
  if (!paramName) return null;
  return {
    field: paramName,
    code: err.code,
    message: err.message,
    longMessage: err.longMessage,
    meta: err.meta as Record<string, unknown> | undefined,
  };
}

function clerkErrorToGlobalError(err: ClerkAPIError): AuthGlobalError {
  return {
    code: err.code,
    message: err.message,
    longMessage: err.longMessage,
    meta: err.meta as Record<string, unknown> | undefined,
  };
}

export function mapClerkError(error: unknown): AuthError {
  const rawErrors: unknown[] = [error];

  if (!isClerkAPIResponseError(error)) {
    return {
      fieldErrors: [],
      globalErrors: [
        {
          code: "unknown",
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
      ],
      rawErrors,
    };
  }

  const fieldErrors: AuthFieldError[] = [];
  const globalErrors: AuthGlobalError[] = [];

  for (const clerkErr of error.errors) {
    const fieldError = clerkErrorToFieldError(clerkErr);
    if (fieldError) {
      fieldErrors.push(fieldError);
    } else {
      globalErrors.push(clerkErrorToGlobalError(clerkErr));
    }
  }

  return { fieldErrors, globalErrors, rawErrors };
}

type FieldErrorLike = { code: string; message: string; longMessage?: string };

type SignalErrorsLike<F extends string> = {
  fields: Partial<Record<F, FieldErrorLike | null>>;
  global?: { code?: string; message: string }[] | null;
  raw?: unknown[] | null;
};

function fieldToFieldError(
  field: string,
  err: FieldErrorLike | null,
): AuthFieldError | null {
  if (!err) return null;
  return {
    field,
    code: err.code,
    message: err.message,
    longMessage: err.longMessage,
  };
}

function mapSignalErrors<F extends string>(
  errors: SignalErrorsLike<F> | null | undefined,
  fieldNames: readonly F[],
): AuthError | null {
  if (!errors) return null;

  const fieldErrors: AuthFieldError[] = [];
  for (const name of fieldNames) {
    const fieldError = fieldToFieldError(name, errors.fields[name] ?? null);
    if (fieldError) fieldErrors.push(fieldError);
  }

  const globalErrors: AuthGlobalError[] = (errors.global ?? []).map((err) => ({
    code: err.code ?? "unknown",
    message: err.message,
  }));

  if (fieldErrors.length === 0 && globalErrors.length === 0) return null;

  return {
    fieldErrors,
    globalErrors,
    rawErrors: errors.raw ?? [],
  };
}

export const mapSignInErrors = (
  errors: SignInErrors | undefined | null,
): AuthError | null =>
  mapSignalErrors(errors, ["identifier", "password", "code"]);

export const mapSignUpErrors = (
  errors: SignUpErrors | undefined | null,
): AuthError | null =>
  mapSignalErrors(errors, [
    "firstName",
    "lastName",
    "emailAddress",
    "phoneNumber",
    "password",
    "username",
    "code",
    "captcha",
    "legalAccepted",
  ]);
