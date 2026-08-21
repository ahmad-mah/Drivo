import { mapClerkError } from "./clerk-error-mapper";
import type { AuthError } from "../domain/auth-error";

/**
 * Runs a Clerk operation and normalizes both thrown errors and the
 * `{ error }` result shape into a single AuthError. Returns null on success.
 */
export async function runClerk(
  op: () => Promise<unknown>,
): Promise<AuthError | null> {
  try {
    const result = await op();
    const error = (result as { error?: unknown } | undefined)?.error;
    return error ? mapClerkError(error) : null;
  } catch (error) {
    return mapClerkError(error);
  }
}