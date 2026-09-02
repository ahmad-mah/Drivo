import { Role } from "@prisma/client";
import { prisma } from "../../../config/database.js";
import { NotFoundError } from "../../../errors/NotFoundError.js";
import { ConflictError } from "../../../errors/ConflictError.js";
import { logAdminAction } from "../../../shared/rbac.js";

export interface ListUsersParams {
  role?: Role;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listUsers(params: ListUsersParams) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 25, 100);
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.role) {
    where.role = params.role;
  }

  if (params.search) {
    const s = params.search;
    where.OR = [
      { email: { contains: s, mode: "insensitive" } },
      { firstName: { contains: s, mode: "insensitive" } },
      { lastName: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { rides: true, supportTickets: true } },
        driverProfile: { select: { id: true, approvalStatus: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const data = users.map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    imageUrl: u.imageUrl,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    tripCount: u._count.rides,
    ticketCount: u._count.supportTickets,
    hasDriverProfile: !!u.driverProfile,
    driverApprovalStatus: u.driverProfile?.approvalStatus ?? null,
  }));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUserDetail(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      rides: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          status: true,
          originAddress: true,
          destinationAddress: true,
          fare: true,
          currency: true,
          createdAt: true,
          driver: { select: { firstName: true, lastName: true } },
        },
      },
      supportTickets: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,
        },
      },
      _count: { select: { rides: true, supportTickets: true } },
    },
  });

  if (!user) throw new NotFoundError("User not found");

  const [completedRides, totalSpent] = await Promise.all([
    prisma.ride.count({
      where: { userId: id, status: "COMPLETED" as any },
    }),
    prisma.ride.aggregate({
      where: { userId: id, status: "COMPLETED" as any },
      _sum: { fare: true },
    }),
  ]);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    imageUrl: user.imageUrl,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    stats: {
      totalTrips: user._count.rides,
      completedTrips: completedRides,
      totalSpent: Number(totalSpent._sum.fare ?? 0),
      ticketCount: user._count.supportTickets,
    },
    recentTrips: user.rides.map((r) => ({
      id: r.id,
      status: r.status,
      originAddress: r.originAddress,
      destinationAddress: r.destinationAddress,
      fare: Number(r.fare),
      currency: r.currency,
      createdAt: r.createdAt.toISOString(),
      driverName: r.driver
        ? `${r.driver.firstName} ${r.driver.lastName}`
        : null,
    })),
    recentTickets: user.supportTickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt.toISOString(),
    })),
  };
}
