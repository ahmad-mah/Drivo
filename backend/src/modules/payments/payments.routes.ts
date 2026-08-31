import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { payForRideSchema } from "./payments.validation";
import * as paymentsController from "./payments.controller";
import { getConnectAccountStatus } from "../drivers/connect/connect.service";

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
