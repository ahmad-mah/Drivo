import { env } from "../../config/env";
import { decodePolyline } from "../../shared/polyline";
import type { RouteCoordinate } from "./directions.types";

const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

async function callRoutesApi(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  fieldMask: string,
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
