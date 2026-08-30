import { Role, type Prisma } from "@prisma/client";
import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { ForbiddenError } from "../errors/ForbiddenError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { prisma } from "../config/database";
import * as userRepository from "../modules/users/user.repository";

// ── Permissions ──────────────────────────────────────────────────────
export const AdminPermission = {
  DASHBOARD_READ: "dashboard.read",
  TRIPS_READ: "trips.read",
  TRIPS_CANCEL: "trips.cancel",
  TRIPS_REASSIGN: "trips.reassign",
  DRIVERS_READ: "drivers.read",
  DRIVERS_APPROVE: "drivers.approve",
  DRIVERS_SUSPEND: "drivers.suspend",
  DRIVERS_VIEW_EARNINGS: "drivers.view_earnings",
  USERS_READ: "users.read",
  USERS_BLOCK: "users.block",
  USERS_ROLE_CHANGE: "users.role_change",
  STATISTICS_READ: "statistics.read",
  PAYMENTS_READ: "payments.read",
  PAYMENTS_REFUND: "payments.refund",
  PAYOUTS_MANAGE: "payouts.manage",
  PROMOS_MANAGE: "promos.manage",
  SETTINGS_MANAGE: "settings.manage",
  SUPPORT_TICKETS_READ: "support.read",
  SUPPORT_TICKETS_MANAGE: "support.manage",
  AUDIT_LOGS_READ: "audit.read",
} as const;

export type AdminPermissionValue =
  (typeof AdminPermission)[keyof typeof AdminPermission];

// ── Role → Permission map (extendable to DB later) ──────────────────
const ROLE_PERMISSIONS: Record<string, AdminPermissionValue[]> = {
  [Role.ADMIN]: [
    AdminPermission.DASHBOARD_READ,
    AdminPermission.TRIPS_READ,
    AdminPermission.TRIPS_CANCEL,
    AdminPermission.TRIPS_REASSIGN,
    AdminPermission.DRIVERS_READ,
    AdminPermission.DRIVERS_APPROVE,
    AdminPermission.DRIVERS_SUSPEND,
    AdminPermission.DRIVERS_VIEW_EARNINGS,
    AdminPermission.USERS_READ,
    AdminPermission.USERS_BLOCK,
    AdminPermission.USERS_ROLE_CHANGE,
    AdminPermission.STATISTICS_READ,
    AdminPermission.PAYMENTS_READ,
    AdminPermission.PAYMENTS_REFUND,
    AdminPermission.PAYOUTS_MANAGE,
    AdminPermission.PROMOS_MANAGE,
    AdminPermission.SETTINGS_MANAGE,
    AdminPermission.SUPPORT_TICKETS_READ,
    AdminPermission.SUPPORT_TICKETS_MANAGE,
    AdminPermission.AUDIT_LOGS_READ,
  ],
};

function getPermissionsForRole(role: Role): AdminPermissionValue[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

// ── Middleware factory ───────────────────────────────────────────────
export function requireAdminPermission(permission: AdminPermissionValue) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return next(new UnauthorizedError("Authentication required"));
      }

      const user = await userRepository.findByClerkId(userId);
      if (!user || user.role !== Role.ADMIN) {
        return next(new ForbiddenError("Admin access required"));
      }

      const permissions = getPermissionsForRole(user.role);
      if (!permissions.includes(permission)) {
        return next(
          new ForbiddenError(`Permission denied: ${permission}`),
        );
      }

      // Attach user to request for downstream handlers
      (req as any).adminUser = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

// ── Audit logging ───────────────────────────────────────────────────
export interface AuditLogParams {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  previousState?: Prisma.InputJsonValue | null;
  newState?: Prisma.InputJsonValue | null;
  reason?: string;
  metadata?: Prisma.InputJsonValue;
}

export async function logAdminAction(params: AuditLogParams) {
  const data: Prisma.AdminAuditLogCreateInput = {
    admin: { connect: { id: params.adminId } },
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    previousState: params.previousState ?? undefined,
    newState: params.newState ?? undefined,
    reason: params.reason ?? undefined,
    metadata: params.metadata ?? undefined,
  };

  return prisma.adminAuditLog.create({ data });
}

export async function getAuditLogs(filters: {
  adminId?: string;
  targetType?: string;
  targetId?: string;
  action?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}) {
  const where: Prisma.AdminAuditLogWhereInput = {};
  if (filters.adminId) where.adminId = filters.adminId;
  if (filters.targetType) where.targetType = filters.targetType;
  if (filters.targetId) where.targetId = filters.targetId;
  if (filters.action) where.action = { contains: filters.action };
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = filters.from;
    if (filters.to) where.createdAt.lte = filters.to;
  }

  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 50, 200);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { admin: { select: { id: true, firstName: true, lastName: true, email: true } } },
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
