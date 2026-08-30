import type { Request, Response } from "express";
import { asyncHandler } from "../../../middleware/async-handler";
import * as adminStatsService from "./admin-stats.service";

export const get = asyncHandler(async (req: Request, res: Response) => {
  const stats = await adminStatsService.getStats({
    dateFrom: req.query.dateFrom as string | undefined,
    dateTo: req.query.dateTo as string | undefined,
  });
  res.json({ success: true, data: stats });
});
