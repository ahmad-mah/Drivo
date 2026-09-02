import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { asyncHandler } from "../../middleware/async-handler.js";
import * as userService from "./user.service.js";
import { updateProfileSchema } from "./user.schema.js";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const user = await userService.getProfileByClerkId(userId!);
  res.json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const data = updateProfileSchema.parse(req.body);
  const user = await userService.updateProfileByClerkId(userId!, data);
  res.json({ success: true, data: user });
});