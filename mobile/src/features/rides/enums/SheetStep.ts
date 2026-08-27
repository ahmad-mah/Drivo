/**
 * Sheet steps in the unified ride-request flow.
 * Forward order: FORM → DRIVERS → RIDE_INFO → SEARCHING → TRIP.
 */
export enum SheetStep {
  FORM = "form",
  DRIVERS = "drivers",
  RIDE_INFO = "rideInfo",
  SEARCHING = "searching",
  TRIP = "trip",
}
