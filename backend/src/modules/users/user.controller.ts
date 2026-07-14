import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import * as userService from "./user.service";

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = getAuth(req);

    const user = await userService.getProfileByClerkId(userId!);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
