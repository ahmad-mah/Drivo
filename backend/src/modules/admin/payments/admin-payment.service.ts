import { PayoutStatus } from "@prisma/client";
import { prisma } from "../../../config/database.js";
import { NotFoundError } from "../../../errors/NotFoundError.js";
import { logAdminAction } from "../../../shared/rbac.js";

export async function listPayouts(params: { status?: PayoutStatus; page?: number; limit?: number }) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 25, 100);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.status) where.status = params.status;

  const [payouts, total] = await Promise.all([
    prisma.driverPayout.findMany({
      where,
      orderBy: { periodEnd: "desc" },
      skip,
      take: limit,
      include: {
        driver: { select: { firstName: true, lastName: true, phone: true } },
      },
    }),
    prisma.driverPayout.count({ where }),
  ]);

  const data = payouts.map((p) => ({
    id: p.id,
    driverId: p.driverId,
    driverName: `${p.driver.firstName} ${p.driver.lastName}`,
    periodStart: p.periodStart.toISOString(),
    periodEnd: p.periodEnd.toISOString(),
    grossEarnings: Number(p.grossEarnings),
    commission: Number(p.commission),
    netAmount: Number(p.netAmount),
    status: p.status,
    paidAt: p.paidAt?.toISOString() ?? null,
    paymentRef: p.paymentRef,
    createdAt: p.createdAt.toISOString(),
  }));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updatePayoutStatus(
  id: string,
  status: PayoutStatus,
  adminId: string,
  paymentRef?: string,
) {
  const payout = await prisma.driverPayout.findUnique({ where: { id } });
  if (!payout) throw new NotFoundError("Payout not found");

  const previousState = { status: payout.status };

  const updated = await prisma.driverPayout.update({
    where: { id },
    data: {
      status,
      ...(status === PayoutStatus.PAID ? { paidAt: new Date(), paymentRef } : {}),
    },
  });

  await logAdminAction({
    adminId,
    action: `payouts.${status.toLowerCase()}`,
    targetType: "payout",
    targetId: id,
    previousState,
    newState: { status: updated.status },
  });

  return updated;
}
