import { SheetStep } from "../enums/SheetStep";

/** Sheet stack for the ride flow, in forward order. */
export { SheetStep };

export const SHEET_TITLES: Record<SheetStep, string> = {
  [SheetStep.FORM]: "Ride",
  [SheetStep.DRIVERS]: "Choose Driver",
  [SheetStep.RIDE_INFO]: "Ride Information",
  [SheetStep.SEARCHING]: "Finding a Driver",
  [SheetStep.TRIP]: "Trip",
};
