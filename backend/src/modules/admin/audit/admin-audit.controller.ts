import type { Request, Response } from "express";
import { asyncHandler } from "../../../middleware/async-handler.js";
import { getAuditLogs } from "../../../shared/rbac.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 25;

  const result = await getAuditLogs({
    adminId: req.query.adminId as string | undefined,
    action: req.query.action as string | undefined,
    targetType: req.query.targetType as string | undefined,
    page,
    limit,
  });

  res.json({ success: true, data: result });
});
