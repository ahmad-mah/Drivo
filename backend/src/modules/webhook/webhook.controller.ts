import type { Request, Response, NextFunction } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { Prisma } from "@prisma/client";
import type { WebhookEvent } from "@clerk/backend";
import { processWebhook } from "./webhook.service.js";

export async function handleClerkWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const event = (await verifyWebhook(req)) as WebhookEvent;
    const svixId = req.headers["svix-id"] as string;

    await processWebhook(svixId, event);

    return res.sendStatus(200);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.sendStatus(200);
    }

    if (error instanceof Error && error.message.includes("Invalid webhook")) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    next(error);
  }
}
