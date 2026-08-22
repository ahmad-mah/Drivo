/** Sheet stack for the ride request flow, in forward order. */
export type SheetStep = "form" | "drivers" | "rideInfo";

export const SHEET_TITLES: Record<SheetStep, string> = {
  form: "Ride",
  drivers: "Choose Driver",
  rideInfo: "Ride Information",
};