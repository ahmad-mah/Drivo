import { z } from "zod";
import { coordinatesShape } from "../../shared/validation/coordinates";

export const applyDriverSchema = z.object({
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleColor: z.string().min(1, "Vehicle color is required"),
  seats: z.coerce
    .number()
    .int("Seats must be a whole number")
    .min(1, "At least 1 seat")
    .max(8, "At most 8 seats"),
  vehiclePlate: z.string().min(1, "Vehicle plate is required"),
  licenseNumber: z.string().min(1, "License number is required"),
});

export type ApplyDriverDto = z.infer<typeof applyDriverSchema>;

/** REST fallback for background location pings (Lat/Lng/Heading from expo-location). */
export const updateLocationSchema = z.object({
  ...coordinatesShape,
  heading: z.number().min(0).max(360).optional(),
});
export type UpdateLocationDto = z.infer<typeof updateLocationSchema>;

/** REST fallback for go online/offline (same contract as the socket event). */
export const updateAvailabilitySchema = z.object({
  isOnline: z.boolean(),
});
export type UpdateAvailabilityDto = z.infer<typeof updateAvailabilitySchema>;
