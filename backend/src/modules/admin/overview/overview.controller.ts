import type { Request, Response } from "express";
import { asyncHandler } from "../../../middleware/async-handler.js";
import * as overviewService from "./overview.service.js";

export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const overview = await overviewService.getOverview();
  res.json({ success: true, data: overview });
});
