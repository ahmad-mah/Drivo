/** Vehicle-type → emoji icons shared by the driver-application picker and the rider driver list. */
export const VEHICLE_ICONS: Record<string, string> = {
  Sedan: "🚗",
  SUV: "🚙",
  Hatchback: "🚘",
  Van: "🚐",
  Truck: "🛻",
  Motorcycle: "🏍️",
  Other: "📦",
};

/** Falls back to the car emoji for types outside the enum (e.g. "Comfort", "Premier"). */
export function vehicleIconFor(type: string): string {
  return VEHICLE_ICONS[type] ?? "🚗";
}