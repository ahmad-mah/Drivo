import { env } from "../../config/env.js";
import { decodePolyline } from "../../shared/polyline.js";
import type { RouteCoordinate } from "./directions.types.js";

const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

async function callRoutesApi(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  fieldMask: string,
  extra?: Record<string, unknown>,
) {
  if (!env.GOOGLE_ROUTES_API_KEY) {
    throw new Error("GOOGLE_ROUTES_API_KEY is not configured");
  }

  const body = {
    origin: { location: { latLng: { latitude: fromLat, longitude: fromLng } } },
    destination: {
      location: { latLng: { latitude: toLat, longitude: toLng } },
    },
    travelMode: "DRIVE",
    polylineEncoding: "ENCODED_POLYLINE",
    ...extra,
  };

  const response = await fetch(ROUTES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_ROUTES_API_KEY,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Routes API error: ${response.status}`);
  }

  return (await response.json()) as {
    routes?: Array<{
      distanceMeters?: number;
      duration?: string;
      polyline?: { encodedPolyline?: string };
    }>;
  };
}

/**
 * Proxies a driving-route request to the Google Routes API so the key never
 * ships in the mobile bundle. Returns the decoded overview polyline of the
 * best route (no alternatives requested).
 */
export async function getRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<RouteCoordinate[]> {
  const data = await callRoutesApi(
    fromLat,
    fromLng,
    toLat,
    toLng,
    "routes.polyline.encodedPolyline",
  );

  const encoded = data.routes?.[0]?.polyline?.encodedPolyline;
  return encoded ? decodePolyline(encoded) : [];
}

/**
 * The best-route driving distance in meters. Used for server-side fare
 * computation so riders pay for the real route, not a straight line.
 */
export async function getRouteDistanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<number> {
  const data = await callRoutesApi(
    fromLat,
    fromLng,
    toLat,
    toLng,
    "routes.distanceMeters",
  );

  const distance = data.routes?.[0]?.distanceMeters;
  if (distance === undefined || distance <= 0) {
    throw new Error("Routes API returned no distance");
  }
  return distance;
}

/**
 * Returns the driving duration in minutes between two points. Used for
 * real-time ETA calculations during an active trip.
 */
export async function getRouteDuration(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<number> {
  const data = await callRoutesApi(
    fromLat,
    fromLng,
    toLat,
    toLng,
    "routes.duration",
  );

  const duration = data.routes?.[0]?.duration;
  if (!duration) {
    throw new Error("Routes API returned no duration");
  }

  // Google Returns duration as "123s" (ISO 8601 duration format)
  const seconds = parseInt(duration.replace("s", ""), 10);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error("Routes API returned invalid duration");
  }

  return Math.max(1, Math.round(seconds / 60));
}
