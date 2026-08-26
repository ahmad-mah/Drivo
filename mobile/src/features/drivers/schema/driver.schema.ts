import { z } from "zod";
import { VehicleType } from "@/features/drivers/enums/VehicleType";

export const applyDriverSchema = z.object({
  vehicleType: z.enum(VehicleType, { message: "Please select a vehicle type" }),
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
