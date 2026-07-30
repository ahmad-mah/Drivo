import { z } from "zod";

export const applyDriverSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(7, "Phone number is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleColor: z.string().min(1, "Vehicle color is required"),
  vehiclePlate: z.string().min(1, "Vehicle plate is required"),
  licenseNumber: z.string().min(1, "License number is required"),
});

export type ApplyDriverDto = z.infer<typeof applyDriverSchema>;
