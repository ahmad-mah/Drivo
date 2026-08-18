import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { asyncHandler } from "../../middleware/async-handler";
import * as userService from "./user.service";
import { updateProfileSchema } from "./user.schema";

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