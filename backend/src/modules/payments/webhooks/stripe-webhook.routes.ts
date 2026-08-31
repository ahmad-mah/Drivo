import express from "express";
import { handleStripeWebhook } from "./stripe-webhook.controller";

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

export default router;