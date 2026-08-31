import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { asyncHandler } from "../../middleware/async-handler";
import * as paymentsService from "./payments.service";
import { requireUserByClerkId } from "../../shared/require-user";
import { payForRideSchema } from "./payments.validation";

export const payForRide = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId: clerkId } = getAuth(req);
    const { rideId } = payForRideSchema.parse(req.body);

    // Resolve Clerk ID → database user
    const user = await requireUserByClerkId(clerkId!);
    if (!user.email) {
      throw Object.assign(new Error("User email is required for payment"), { statusCode: 400 });
    }

    const result = await paymentsService.createPaymentForRide(
      rideId,
      user.id,
      user.email,
    );

    res.json({ success: true, data: result });
  },
);

export const getPaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { rideId } = req.params as { rideId: string };
    const ride = await paymentsService.getRidePaymentStatus(rideId);
    res.json({ success: true, data: ride });
  },
);
