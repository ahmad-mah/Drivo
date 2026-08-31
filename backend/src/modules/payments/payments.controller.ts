import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { asyncHandler } from "../../middleware/async-handler";
import * as paymentsService from "./payments.service";
import { requireUserByClerkId } from "../../shared/require-user";
import { payForRideSchema } from "./payments.validation";
import { env } from "../../config/env";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-08-26.dahlia",
});

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

    // Create ephemeral key for PaymentSheet to save payment method to customer
    let ephemeralKeySecret: string | null = null;
    if (result.stripeCustomerId) {
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: result.stripeCustomerId },
        { apiVersion: "2026-08-26.dahlia" },
      );
      ephemeralKeySecret = ephemeralKey.secret ?? null;
    }

    res.json({
      success: true,
      data: {
        ...result,
        ephemeralKeySecret,
      },
    });
  },
);

export const getPaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { rideId } = req.params as { rideId: string };
    const ride = await paymentsService.getRidePaymentStatus(rideId);
    res.json({ success: true, data: ride });
  },
);
