import { getStripe } from "../../payments/payments.service";
import { prisma } from "../../../config/database";
import { NotFoundError } from "../../../errors/NotFoundError";
import type { StripeConnectAccount } from "@prisma/client";
import Stripe from "stripe";

export async function createConnectAccount(driverId: string) {
  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    metadata: { driverId },
  });

  const existing = await prisma.stripeConnectAccount.findUnique({
    where: { driverId },
  });

  if (existing) {
    return await prisma.stripeConnectAccount.update({
      where: { driverId },
      data: { accountId: account.id },
    });
  }

  return await prisma.stripeConnectAccount.create({
    data: {
      driverId,
      accountId: account.id,
    },
  });
}

export async function generateAccountLink(
  accountId: string,
  returnUrl: string,
) {
  const stripe = getStripe();
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: returnUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return link.url;
}

export async function getConnectAccountStatus(
  accountId: string,
): Promise<StripeConnectAccount & { stripeAccount: Stripe.Account }> {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);

  const dbRecord = await prisma.stripeConnectAccount.findFirst({
    where: { accountId },
  });

  if (!dbRecord) {
    throw new NotFoundError("Connect account not found");
  }

  return { ...dbRecord, stripeAccount: account as Stripe.Account };
}