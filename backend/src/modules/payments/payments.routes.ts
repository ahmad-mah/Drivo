import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { payForRideSchema } from "./payments.validation.js";
import * as paymentsController from "./payments.controller.js";
import { getConnectAccountStatus } from "../drivers/connect/connect.service.js";

const router = Router();

router.post(
  "/pay-for-ride",
  requireAuth,
  validate(payForRideSchema),
  paymentsController.payForRide,
);
router.get(
  "/payment-status/:rideId",
  requireAuth,
  paymentsController.getPaymentStatus,
);
router.get(
  "/connect/:accountId",
  requireAuth,
  async (req, res) => {
    const accountId = Array.isArray(req.params.accountId) ? req.params.accountId[0] : req.params.accountId;
    const status = await getConnectAccountStatus(accountId);
    res.json({ success: true, data: status });
  },
);

export default router;
