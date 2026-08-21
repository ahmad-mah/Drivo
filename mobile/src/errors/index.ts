export { ApiError } from "./ApiError";
export { UnauthorizedError } from "./UnauthorizedError";
export { ForbiddenError } from "./ForbiddenError";
export { NotFoundError } from "./NotFoundError";
export { ValidationError } from "./ValidationError";

export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function toError(err: unknown, fallback: string): Error {
  return err instanceof Error ? err : new Error(fallback);
}
