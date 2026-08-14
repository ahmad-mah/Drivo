import { LiveDriversMap, type VehicleMapper } from "./LiveDriversMap";
import { useLiveDrivers } from "../hooks/useLiveDrivers";

/** Filters out drivers with no fix and adapts snapshot rows for the map. */
function toVehicleMarkers(
  drivers: { id: string; firstName: string; lastName: string; latitude: number | null; longitude: number | null; lastSeenAt: string | null; vehicleType: string }[],
): VehicleMapper[] {
  const markers: VehicleMapper[] = [];
  for (const driver of drivers) {
    if (driver.latitude !== null && driver.longitude !== null) {
      markers.push({
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        latitude: driver.latitude,
        longitude: driver.longitude,
        lastSeenAt: driver.lastSeenAt,
        vehicleType: driver.vehicleType,
      });
    }
  }
  return markers;
}

export function LiveMapSection() {
  const { drivers, connected } = useLiveDrivers();
  const markers = toVehicleMarkers(drivers);

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Live Drivers</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <span
            className={`size-1.5 rounded-full ${connected ? "bg-green-500" : "bg-amber-400"}`}
          />
          {markers.length} online
        </span>
      </div>
      <LiveDriversMap drivers={markers} />
    </section>
  );
}