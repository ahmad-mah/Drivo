import type { Request, Response } from "express";
import { asyncHandler } from "../../../middleware/async-handler.js";
import * as svc from "./admin-promo.service.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await svc.listPromos({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  res.json({ success: true, data: result });
});

export const toggleActive = asyncHandler(async (req: Request, res: Response) => {
  const { active } = req.body;
  const adminId = (req as any).adminUser?.id;
  const promo = await svc.togglePromoActive(req.params.id as string, active, adminId);
  res.json({ success: true, data: promo });
});
