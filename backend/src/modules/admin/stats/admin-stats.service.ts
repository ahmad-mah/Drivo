import { RideStatus, ApprovalStatus } from "@prisma/client";
import { prisma } from "../../../config/database.js";

export interface StatsParams {
  dateFrom?: string;
  dateTo?: string;
}

export async function getStats(params: StatsParams) {
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const dateFrom = params.dateFrom ? new Date(params.dateFrom) : defaultFrom;
  const dateTo = params.dateTo ? new Date(params.dateTo) : now;

  const [
    totalUsers,
    totalDrivers,
    pendingApprovals,
    onlineDrivers,
    rideCounts,
    dailyStats,
    topDrivers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.driverProfile.count(),
    prisma.driverProfile.count({
      where: { approvalStatus: ApprovalStatus.PENDING },
    }),
    prisma.driverProfile.count({ where: { isOnline: true } }),

    prisma.ride.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: dateFrom, lte: dateTo },
      },
      _count: true,
    }),

    prisma.$queryRaw<
      { date: string; rides: number; revenue: number; completed: number }[]
    >`
      SELECT
        TO_CHAR("created_at", 'YYYY-MM-DD') AS date,
        COUNT(*)::int AS rides,
        COALESCE(SUM(CASE WHEN "status" = 'COMPLETED' THEN "fare" ELSE 0 END), 0)::numeric AS revenue,
        COUNT(CASE WHEN "status" = 'COMPLETED' THEN 1 END)::int AS completed
      FROM "rides"
      WHERE "created_at" >= ${dateFrom} AND "created_at" <= ${dateTo}
      GROUP BY TO_CHAR("created_at", 'YYYY-MM-DD')
      ORDER BY date
    `,

    prisma.$queryRaw<
      {
        driverId: string;
        firstName: string;
        lastName: string;
        trips: number;
        earnings: number;
      }[]
    >`
      SELECT
        dp."id" AS "driverId",
        dp."first_name" AS "firstName",
        dp."last_name" AS "lastName",
        COUNT(r."id")::int AS trips,
        COALESCE(SUM(r."fare"), 0)::numeric AS earnings
      FROM "driver_profiles" dp
      JOIN "rides" r ON r."driver_id" = dp."id"
      WHERE r."status" = 'COMPLETED'
        AND r."created_at" >= ${dateFrom} AND r."created_at" <= ${dateTo}
      GROUP BY dp."id", dp."first_name", dp."last_name"
      ORDER BY trips DESC
      LIMIT 10
    `,
  ]);

  const statusMap = new Map<string, number>();
  for (const r of rideCounts) {
    statusMap.set(r.status, r._count);
  }

  const totalRides = rideCounts.reduce((sum, r) => sum + r._count, 0);
  const completedRides = statusMap.get(RideStatus.COMPLETED) ?? 0;
  const cancelledRides = statusMap.get(RideStatus.CANCELLED) ?? 0;

  const totalRevenue = dailyStats.reduce(
    (sum, d) => sum + Number(d.revenue),
    0,
  );

  return {
    summary: {
      totalUsers,
      totalDrivers,
      pendingApprovals,
      onlineDrivers,
      totalRides,
      completedRides,
      cancelledRides,
      completionRate:
        totalRides > 0
          ? Math.round((completedRides / totalRides) * 1000) / 10
          : 0,
      totalRevenue,
    },
    daily: dailyStats.map((d) => ({
      date: d.date,
      rides: d.rides,
      revenue: Number(d.revenue),
      completed: d.completed,
    })),
    topDrivers: topDrivers.map((d) => ({
      id: d.driverId,
      name: `${d.firstName} ${d.lastName}`,
      trips: d.trips,
      earnings: Number(d.earnings),
    })),
    statusDistribution: Object.values(RideStatus).map((status) => ({
      status,
      count: statusMap.get(status) ?? 0,
    })),
  };
}
