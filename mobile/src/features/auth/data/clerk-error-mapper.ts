import type {
  ClerkAPIResponseError,
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

function fieldToFieldError(
  field: string,
  err: { code: string; message: string; longMessage?: string } | null,
): AuthFieldError | null {
  if (!err) return null;
  return {
    field,
    code: err.code,
    message: err.message,
    longMessage: err.longMessage,
  };
}

export function mapSignInErrors(
  errors: SignInErrors | undefined | null,
): AuthError | null {
  if (!errors) return null;

  const fieldErrors: AuthFieldError[] = [];
  const globalErrors: AuthGlobalError[] = [];

  const identifier = fieldToFieldError("identifier", errors.fields.identifier);
  if (identifier) fieldErrors.push(identifier);

  const password = fieldToFieldError("password", errors.fields.password);
  if (password) fieldErrors.push(password);

  const code = fieldToFieldError("code", errors.fields.code);
  if (code) fieldErrors.push(code);

  if (errors.global) {
    for (const err of errors.global) {
      globalErrors.push({
        code: (err as { code?: string }).code ?? "unknown",
        message: err.message,
      });
    }
  }

  if (fieldErrors.length === 0 && globalErrors.length === 0) return null;

  return {
    fieldErrors,
    globalErrors,
    rawErrors: errors.raw ?? [],
  };
}

export function mapSignUpErrors(
  errors: SignUpErrors | undefined | null,
): AuthError | null {
  if (!errors) return null;

  const fieldErrors: AuthFieldError[] = [];
  const globalErrors: AuthGlobalError[] = [];

  const firstName = fieldToFieldError("firstName", errors.fields.firstName);
  if (firstName) fieldErrors.push(firstName);

  const lastName = fieldToFieldError("lastName", errors.fields.lastName);
  if (lastName) fieldErrors.push(lastName);

  const emailAddress = fieldToFieldError(
    "emailAddress",
    errors.fields.emailAddress,
  );
  if (emailAddress) fieldErrors.push(emailAddress);

  const phoneNumber = fieldToFieldError(
    "phoneNumber",
    errors.fields.phoneNumber,
  );
  if (phoneNumber) fieldErrors.push(phoneNumber);

  const password = fieldToFieldError("password", errors.fields.password);
  if (password) fieldErrors.push(password);

  const username = fieldToFieldError("username", errors.fields.username);
  if (username) fieldErrors.push(username);

  const code = fieldToFieldError("code", errors.fields.code);
  if (code) fieldErrors.push(code);

  const captcha = fieldToFieldError("captcha", errors.fields.captcha);
  if (captcha) fieldErrors.push(captcha);

  const legalAccepted = fieldToFieldError(
    "legalAccepted",
    errors.fields.legalAccepted,
  );
  if (legalAccepted) fieldErrors.push(legalAccepted);

  if (errors.global) {
    for (const err of errors.global) {
      globalErrors.push({
        code: (err as { code?: string }).code ?? "unknown",
        message: err.message,
      });
    }
  }

  if (fieldErrors.length === 0 && globalErrors.length === 0) return null;

  return {
    fieldErrors,
    globalErrors,
    rawErrors: errors.raw ?? [],
  };
}
