type TokenGetter = () => Promise<string | null>;

let getToken: TokenGetter = () => Promise.resolve(null);

export function registerTokenGetter(fn: TokenGetter) {
  getToken = fn;
}

export async function getAccessToken() {
  try {
    return await getToken();
  } catch {
    return null;
  }
}
