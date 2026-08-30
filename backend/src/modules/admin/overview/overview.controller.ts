import type { Request, Response } from "express";
import { asyncHandler } from "../../../middleware/async-handler";
import * as overviewService from "./overview.service";

export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const overview = await overviewService.getOverview();
  res.json({ success: true, data: overview });
});
