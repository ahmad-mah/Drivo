import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import L from "leaflet";

export function VehicleMarker({ driver }: { driver: VehicleMapper }) {
  return (
    <Marker position={[driver.latitude, driver.longitude]} icon={carIcon}>
      <Tooltip direction="top" offset={[0, -12]}>
        <div className="text-xs">
          <div className="font-semibold">
            {driver.firstName} {driver.lastName}
          </div>
          <div>
            {driver.vehicleType} ·{" "}
            {driver.lastSeenAt ? formatSeen(driver.lastSeenAt) : "just now"}
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}

function formatSeen(iso: string) {
  const seenAt = new Date(iso).getTime();
  const secondsAgo = Math.max(0, Math.floor((Date.now() - seenAt) / 1000));
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  return `${Math.floor(secondsAgo / 60)}m ago`;
}

export type VehicleMapper = {
  id: string;
  firstName: string;
  lastName: string;
  latitude: number;
  longitude: number;
  lastSeenAt: string | null;
  vehicleType: string;
};

const carIcon = L.divIcon({
  className: "",
  html: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h-2v-4l2.2-4.4A2 2 0 0 1 7 7.5h10a2 2 0 0 1 1.8 1.1L21 13v4h-2"/><path d="M3 13h18"/><circle cx="7.5" cy="17.5" r="1.5" fill="#1D4ED8"/><circle cx="16.5" cy="17.5" r="1.5" fill="#1D4ED8"/><path d="M7 13l1-2M17 13l-1-2"/></svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function LiveDriversMap({ drivers }: { drivers: VehicleMapper[] }) {
  return (
    <MapContainer
      center={[30.0444, 31.2357]}
      zoom={13}
      style={{ height: "420px", width: "100%", borderRadius: "0.75rem" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {drivers.map((driver) => (
        <VehicleMarker key={driver.id} driver={driver} />
      ))}
    </MapContainer>
  );
}