import { z } from "zod";

export const applyDriverSchema = z.object({
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleColor: z.string().min(1, "Vehicle color is required"),
  vehiclePlate: z.string().min(1, "Vehicle plate is required"),
  licenseNumber: z.string().min(1, "License number is required"),
});

export type ApplyDriverDto = z.infer<typeof applyDriverSchema>;
