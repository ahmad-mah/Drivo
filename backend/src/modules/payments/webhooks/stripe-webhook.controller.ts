import type { Request, Response, NextFunction } from "express";
import { getStripe } from "../payments.service.js";
import { env } from "../../../config/env.js";
import { processStripeWebhook } from "./stripe-webhook.service.js";

export async function handleStripeWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sig = req.headers["stripe-signature"] as string;
    if (!sig) {
      res.status(400).json({ message: "Missing stripe-signature" });
      return;
    }

    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
    );

    await processStripeWebhook(event);

    res.json({ received: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Webhook")) {
      res.status(400).json({ message: "Invalid webhook signature" });
      return;
    }
    next(error);
  }
}