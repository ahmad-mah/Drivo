import * as Location from "expo-location";

function formatAddress(address: Location.LocationGeocodedAddress): string {
  const street = [address.streetNumber, address.street]
    .filter(Boolean)
    .join(" ");
  const parts = [street || address.name, address.city, address.region, address.country].filter(
    Boolean,
  );
  return parts.join(", ");
}

/** Best-effort reverse geocoding; null when the provider has no address. */
export async function reverseGeocodeAddress(
  location: Location.LocationObject,
): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    const first = results?.[0];
    if (!first) return null;
    return formatAddress(first);
  } catch {
    return null;
  }
}