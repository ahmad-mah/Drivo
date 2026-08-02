import { z } from "zod";
import { VehicleType } from "@/features/drivers/enums/VehicleType";

export const applyDriverSchema = z.object({
  vehicleType: z.enum(VehicleType, { message: "Please select a vehicle type" }),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleColor: z.string().min(1, "Vehicle color is required"),
  vehiclePlate: z.string().min(1, "Vehicle plate is required"),
  licenseNumber: z.string().min(1, "License number is required"),
});
