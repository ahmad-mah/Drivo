import { ApiError } from "./ApiError";

export class ValidationError extends ApiError {
  constructor(
    public readonly errors: Record<string, string[]>,
    message = "Validation failed",
  ) {
    super(422, message);
    this.name = "ValidationError";
  }
}
