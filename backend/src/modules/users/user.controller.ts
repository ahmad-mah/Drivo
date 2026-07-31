import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import * as userService from "./user.service";
import { updateProfileSchema } from "./user.schema";

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = getAuth(req);

    const user = await userService.getProfileByClerkId(userId!);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = getAuth(req);

    const data = updateProfileSchema.parse(req.body);

    const user = await userService.updateProfileByClerkId(userId!, data);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
