export interface AuthFieldError {
  field: string;
  code: string;
  message: string;
  longMessage?: string;
  meta?: Record<string, unknown>;
}

export interface AuthGlobalError {
  code: string;
  message: string;
  longMessage?: string;
  meta?: Record<string, unknown>;
}

export interface AuthError {
  fieldErrors: AuthFieldError[];
  globalErrors: AuthGlobalError[];
  rawErrors: unknown[];
}

export function createAuthError(
  overrides?: Partial<AuthError>,
): AuthError {
  return {
    fieldErrors: [],
    globalErrors: [],
    rawErrors: [],
    ...overrides,
  };
}
