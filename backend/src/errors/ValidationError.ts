import { AppError } from "./AppError";

export class ValidationError extends AppError {
  public readonly errors: { field: string; message: string }[];

  constructor(errors: { field: string; message: string }[]) {
    super("Validation failed", 400);
    this.errors = errors;
  }
}
