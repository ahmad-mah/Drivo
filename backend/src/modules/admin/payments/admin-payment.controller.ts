import type { Request, Response } from "express";
import type { PayoutStatus } from "@prisma/client";
import { asyncHandler } from "../../../middleware/async-handler.js";
import * as svc from "./admin-payment.service.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await svc.listPayouts({
    status: req.query.status as PayoutStatus | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  res.json({ success: true, data: result });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, paymentRef } = req.body;
  const adminId = (req as any).adminUser?.id;
  const payout = await svc.updatePayoutStatus(req.params.id as string, status, adminId, paymentRef);
  res.json({ success: true, data: payout });
});
