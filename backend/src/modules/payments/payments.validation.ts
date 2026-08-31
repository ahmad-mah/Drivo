import { z } from "zod";

export const payForRideSchema = z.object({
  rideId: z.string().min(1, "rideId is required"),
});
export type PayForRideDto = z.infer<typeof payForRideSchema>;

export const connectOnboardSchema = z.object({
  returnUrl: z.string().url("returnUrl must be a valid URL"),
});
export type ConnectOnboardDto = z.infer<typeof connectOnboardSchema>;

export const stripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.unknown(),
  }),
  id: z.string(),
});
export type StripeWebhookEvent = z.infer<typeof stripeWebhookSchema>;
