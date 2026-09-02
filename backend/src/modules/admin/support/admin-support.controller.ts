import type { Request, Response } from "express";
import type { TicketStatus } from "@prisma/client";
import { asyncHandler } from "../../../middleware/async-handler.js";
import * as svc from "./admin-support.service.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await svc.listTickets({
    status: req.query.status as TicketStatus | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  res.json({ success: true, data: result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await svc.getTicketDetail(req.params.id as string);
  res.json({ success: true, data: ticket });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const adminId = (req as any).adminUser?.id;
  const ticket = await svc.updateTicketStatus(req.params.id as string, status, adminId);
  res.json({ success: true, data: ticket });
});
