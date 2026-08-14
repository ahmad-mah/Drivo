import type { AuthError } from "../domain/auth-error";

/**
 * Flattens an AuthError into a single message string for snackbar display.
 * Field errors come first (longMessage preferred), then global errors,
 * joined by newlines. Returns null when there is nothing to show.
 */
export function formatAuthErrorMessages(
  authError: AuthError | null,
): string | null {
  if (!authError) return null;

  const messages = [
    ...authError.fieldErrors.map((fe) => fe.longMessage ?? fe.message),
    ...authError.globalErrors.map((ge) => ge.longMessage ?? ge.message),
  ];

  return messages.length > 0 ? messages.join("\n") : null;
}
