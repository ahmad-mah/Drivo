import { RideStatus, ApprovalStatus } from "@prisma/client";
import { prisma } from "../../../config/database.js";

const CAIRO_TZ = "Africa/Cairo";

function startOfTodayCairo(): Date {
  const now = new Date();
  // Cairo is UTC+2 (standard) or UTC+3 (Ramadan). Compute offset from locale.
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: CAIRO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  // Build midnight Cairo, then convert to UTC Date
  const cairoMidnight = new Date(`${y}-${m}-${d}T00:00:00`);
  // Adjust: the above is in local tz; shift by offset
  const utcStr = new Date(
    cairoMidnight.toLocaleString("en-US", { timeZone: "UTC" }),
  ).getTime();
  const cairoStr = cairoMidnight.getTime();
  const offsetMs = cairoStr - utcStr;
  return new Date(cairoMidnight.getTime() - offsetMs);
}

export async function getOverview() {
  const todayStart = startOfTodayCairo();

  const [
    onlineDrivers,
    approvedOnlineDrivers,
    pendingApprovals,
    searchingRides,
    assignedRides,
    inProgressRides,
    todayCompleted,
    todayCancelled,
    todayRevenue,
    stuckTrips,
    longWaitRides,
    activeRidesForMap,
    availableDriversForMap,
  ] = await Promise.all([
    // Online drivers (any approval status)
    prisma.driverProfile.count({
      where: { isOnline: true },
    }),

    // Available drivers: online + approved + NOT on an active ride
    prisma.driverProfile.findMany({
      where: {
        isOnline: true,
        approvalStatus: ApprovalStatus.APPROVED,
        rides: {
          none: {
            status: {
              in: [RideStatus.PENDING, RideStatus.ACCEPTED, RideStatus.ARRIVED, RideStatus.IN_PROGRESS],
            },
          },
        },
      },
      select: { id: true },
    }),

    // Pending approvals
    prisma.driverProfile.count({
      where: { approvalStatus: ApprovalStatus.PENDING },
    }),

    // Searching rides (PENDING, not expired)
    prisma.ride.count({
      where: {
        status: RideStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    }),

    // Assigned rides (ACCEPTED + ARRIVED)
    prisma.ride.count({
      where: { status: { in: [RideStatus.ACCEPTED, RideStatus.ARRIVED] } },
    }),

    // In-progress rides
    prisma.ride.count({
      where: { status: RideStatus.IN_PROGRESS },
    }),

    // Today completed
    prisma.ride.count({
      where: {
        status: RideStatus.COMPLETED,
        completedAt: { gte: todayStart },
      },
    }),

    // Today cancelled
    prisma.ride.count({
      where: {
        status: RideStatus.CANCELLED,
        cancelledAt: { gte: todayStart },
      },
    }),

    // Today revenue
    prisma.ride.aggregate({
      where: {
        status: RideStatus.COMPLETED,
        completedAt: { gte: todayStart },
      },
      _sum: { fare: true },
    }),

    // Stuck trips: ACCEPTED/ARRIVED with no update for >5 min
    prisma.ride.findMany({
      where: {
        status: { in: [RideStatus.ACCEPTED, RideStatus.ARRIVED] },
        updatedAt: {
          lt: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
      select: {
        id: true,
        status: true,
        originAddress: true,
        destinationAddress: true,
        fare: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: "asc" },
      take: 10,
    }),

    // Long-wait rides: PENDING > 3 min with 0 nearby drivers
    prisma.ride.findMany({
      where: {
        status: RideStatus.PENDING,
        expiresAt: { gt: new Date() },
        createdAt: {
          lt: new Date(Date.now() - 3 * 60 * 1000),
        },
        nearbyDrivers: 0,
      },
      select: {
        id: true,
        status: true,
        originAddress: true,
        destinationAddress: true,
        fare: true,
        createdAt: true,
        nearbyDrivers: true,
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 10,
    }),

    // Active rides for map overlay
    prisma.ride.findMany({
      where: {
        status: { in: [RideStatus.PENDING, RideStatus.ACCEPTED, RideStatus.ARRIVED, RideStatus.IN_PROGRESS] },
      },
      select: {
        id: true,
        status: true,
        originLatitude: true,
        originLongitude: true,
        destinationLatitude: true,
        destinationLongitude: true,
        driverFirstName: true,
        driverLastName: true,
        user: { select: { firstName: true, lastName: true } },
        driver: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            heading: true,
          },
        },
      },
      take: 100,
    }),

    // Available drivers for map
    prisma.driverProfile.findMany({
      where: {
        isOnline: true,
        approvalStatus: ApprovalStatus.APPROVED,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        latitude: true,
        longitude: true,
        heading: true,
        vehicleType: true,
      },
      take: 200,
    }),
  ]);

  const todayTotal = todayCompleted + todayCancelled;
  const completionRate = todayTotal > 0 ? todayCompleted / todayTotal : 0;

  return {
    counts: {
      onlineDrivers,
      availableDrivers: approvedOnlineDrivers.length,
      searchingRides,
      assignedRides,
      inProgressRides,
      pendingApprovals,
    },
    today: {
      completedRides: todayCompleted,
      cancelledRides: todayCancelled,
      revenue: Number(todayRevenue._sum.fare ?? 0),
      completionRate: Math.round(completionRate * 1000) / 10,
      avgPickupTimeSeconds: 0, // computed from ride timestamps when available
      avgTripDurationMinutes: 0, // computed from ride timestamps when available
    },
    alerts: [
      {
        type: "long_wait" as const,
        count: longWaitRides.length,
        severity: longWaitRides.length > 0 ? ("warning" as const) : ("info" as const),
        rides: longWaitRides.map((r) => ({
          id: r.id,
          status: r.status,
          originAddress: r.originAddress,
          destinationAddress: r.destinationAddress,
          waitTimeSeconds: Math.round(
            (Date.now() - r.createdAt.getTime()) / 1000,
          ),
          nearestDriverCount: 0,
          fare: Number(r.fare),
          riderName: `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim(),
          createdAt: r.createdAt.toISOString(),
        })),
      },
      {
        type: "stuck_trip" as const,
        count: stuckTrips.length,
        severity: stuckTrips.length > 0 ? ("critical" as const) : ("info" as const),
        rides: stuckTrips.map((r) => ({
          id: r.id,
          status: r.status,
          originAddress: r.originAddress,
          destinationAddress: r.destinationAddress,
          waitTimeSeconds: Math.round(
            (Date.now() - r.updatedAt.getTime()) / 1000,
          ),
          nearestDriverCount: 0,
          fare: Number(r.fare),
          riderName: `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim(),
          createdAt: r.createdAt.toISOString(),
        })),
      },
      {
        type: "pending_approval" as const,
        count: pendingApprovals,
        severity: pendingApprovals > 0 ? ("info" as const) : ("info" as const),
      },
    ],
    activeRides: activeRidesForMap.map((r) => ({
      id: r.id,
      status: r.status,
      origin: { lat: r.originLatitude, lng: r.originLongitude },
      destination: { lat: r.destinationLatitude, lng: r.destinationLongitude },
      driver: r.driver
        ? {
            id: r.driver.id,
            lat: r.driver.latitude ?? 0,
            lng: r.driver.longitude ?? 0,
            heading: r.driver.heading ?? undefined,
          }
        : undefined,
      riderName: `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim(),
    })),
    availableDriversMap: availableDriversForMap.map((d) => ({
      id: d.id,
      name: `${d.firstName} ${d.lastName}`.trim(),
      lat: d.latitude!,
      lng: d.longitude!,
      heading: d.heading ?? undefined,
      vehicleType: d.vehicleType,
    })),
  };
}
