import { withTimeout } from "@/shared/utils/withTimeout";

type TokenGetter = () => Promise<string | null>;

let getToken: TokenGetter = () => Promise.resolve(null);

// Clerk can block indefinitely refreshing an expired session while offline,
// which would hang the request interceptor before axios's own timeout starts.
// Bounding the fetch lets offline requests proceed unauthenticated and fail
// fast instead of leaving callers (e.g. the Go Online button) spinning.
const TOKEN_TIMEOUT_MS = 5_000;

export function registerTokenGetter(fn: TokenGetter) {
  getToken = fn;
}

export async function getAccessToken() {
  try {
    return await withTimeout(getToken(), TOKEN_TIMEOUT_MS);
  } catch (err) {
    if (__DEV__) {
      console.warn("[api] getAccessToken failed — request will proceed unauthenticated", err);
    }
    return null;
  }
}
