import { z } from "zod";
import { coordinatesShape } from "../../shared/validation/coordinates";

const pointSchema = z.object({
  address: z.string().min(1, "Address is required"),
  ...coordinatesShape,
});

export const requestRideSchema = z.object({
  origin: pointSchema,
  destination: pointSchema,
});

export type RequestRideDto = z.infer<typeof requestRideSchema>;