const _apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!_apiUrl) {
  throw new Error("Missing EXPO_PUBLIC_API_URL env variable");
}
export const API_URL: string = _apiUrl;
