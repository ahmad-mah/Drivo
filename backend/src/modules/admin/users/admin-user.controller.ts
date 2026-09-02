import type { Request, Response } from "express";
import type { Role } from "@prisma/client";
import { asyncHandler } from "../../../middleware/async-handler.js";
import * as adminUserService from "./admin-user.service.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminUserService.listUsers({
    role: req.query.role as Role | undefined,
    search: req.query.search as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  res.json({ success: true, data: result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminUserService.getUserDetail(req.params.id as string);
  res.json({ success: true, data: user });
});
