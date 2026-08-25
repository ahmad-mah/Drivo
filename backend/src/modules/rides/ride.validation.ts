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

/** Rider rates the driver on a completed ride. */
export const rateRideSchema = z.object({
  stars: z.number().int().min(1, "Pick 1–5 stars").max(5, "Pick 1–5 stars"),
  comment: z.string().max(500).optional(),
});
