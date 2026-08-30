import { prisma } from "../../../config/database";
import { NotFoundError } from "../../../errors/NotFoundError";
import { logAdminAction } from "../../../shared/rbac";

export async function listPromos(params: { page?: number; limit?: number }) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 25, 100);
  const skip = (page - 1) * limit;

  const [promos, total] = await Promise.all([
    prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.promoCode.count(),
  ]);

  const data = promos.map((p) => ({
    id: p.id,
    code: p.code,
    discountType: p.discountType,
    discountValue: Number(p.discountValue),
    usageLimit: p.usageLimit,
    usageCount: p.usageCount,
    validUntil: p.validUntil?.toISOString() ?? null,
    isActive: p.isActive,
    createdByName: p.createdBy
      ? `${p.createdBy.firstName ?? ""} ${p.createdBy.lastName ?? ""}`.trim()
      : "System",
    createdAt: p.createdAt.toISOString(),
  }));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function togglePromoActive(id: string, active: boolean, adminId: string) {
  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo) throw new NotFoundError("Promo code not found");

  const previousState = { isActive: promo.isActive };

  const updated = await prisma.promoCode.update({
    where: { id },
    data: { isActive: active },
  });

  await logAdminAction({
    adminId,
    action: active ? "promos.activate" : "promos.deactivate",
    targetType: "promo",
    targetId: id,
    previousState,
    newState: { isActive: updated.isActive },
  });

  return updated;
}
