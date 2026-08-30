import { RideStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../../config/database";
import { NotFoundError } from "../../../errors/NotFoundError";
import { ConflictError } from "../../../errors/ConflictError";
import { emitRideUpdated } from "../../../sockets/admin-emit";
import { logAdminAction } from "../../../shared/rbac";

// ── List trips with filters ──────────────────────────────────────────
export interface ListTripsParams {
  status?: RideStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listTrips(params: ListTripsParams) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 25, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.RideWhereInput = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.dateFrom || params.dateTo) {
    where.createdAt = {};
    if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
    if (params.dateTo) where.createdAt.lte = new Date(params.dateTo);
  }

  if (params.search) {
    const s = params.search;
    where.OR = [
      { id: { contains: s, mode: "insensitive" } },
      { originAddress: { contains: s, mode: "insensitive" } },
      { destinationAddress: { contains: s, mode: "insensitive" } },
      { driverFirstName: { contains: s, mode: "insensitive" } },
      { driverLastName: { contains: s, mode: "insensitive" } },
      { user: { email: { contains: s, mode: "insensitive" } } },
      { user: { firstName: { contains: s, mode: "insensitive" } } },
      { user: { lastName: { contains: s, mode: "insensitive" } } },
    ];
  }

  const [rides, total] = await Promise.all([
    prisma.ride.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, email: true } },
        driver: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            vehicleType: true,
            vehicleModel: true,
            vehiclePlate: true,
          },
        },
      },
    }),
    prisma.ride.count({ where }),
  ]);

  const data = rides.map((r) => ({
    id: r.id,
    status: r.status,
    originAddress: r.originAddress,
    destinationAddress: r.destinationAddress,
    distanceKm: r.distanceKm,
    fare: Number(r.fare),
    currency: r.currency,
    riderName: `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim() || r.user.email,
    riderPhone: r.user.phone ?? "",
    driverName: r.driver
      ? `${r.driver.firstName} ${r.driver.lastName}`
      : null,
    driverPhone: r.driver?.phone ?? null,
    vehicleType: r.driver?.vehicleType ?? null,
    createdAt: r.createdAt.toISOString(),
    acceptedAt: r.startedAt?.toISOString() ?? null,
    startedAt: r.startedAt?.toISOString() ?? null,
    completedAt: r.completedAt?.toISOString() ?? null,
    cancelledAt: r.cancelledAt?.toISOString() ?? null,
    cancelReason: r.cancelReason ?? null,
    nearbyDrivers: r.nearbyDrivers,
  }));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ── Trip detail ──────────────────────────────────────────────────────
export async function getTripDetail(id: string) {
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, imageUrl: true } },
      driver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          vehicleType: true,
          vehicleModel: true,
          vehicleColor: true,
          vehiclePlate: true,
          ratingSum: true,
          ratingCount: true,
          user: { select: { email: true } },
        },
      },
      offers: {
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              vehicleType: true,
              vehicleModel: true,
              vehiclePlate: true,
            },
          },
        },
        orderBy: { offeredAt: "asc" },
      },
    },
  });

  if (!ride) throw new NotFoundError("Trip not found");

  return {
    id: ride.id,
    status: ride.status,
    originAddress: ride.originAddress,
    originLatitude: ride.originLatitude,
    originLongitude: ride.originLongitude,
    destinationAddress: ride.destinationAddress,
    destinationLatitude: ride.destinationLatitude,
    destinationLongitude: ride.destinationLongitude,
    distanceKm: ride.distanceKm,
    fare: Number(ride.fare),
    currency: ride.currency,
    rideTimeMinutes: ride.rideTimeMinutes,
    nearbyDrivers: ride.nearbyDrivers,
    cancelReason: ride.cancelReason ?? null,
    riderRating: ride.riderRating ?? null,
    riderComment: ride.riderComment ?? null,
    createdAt: ride.createdAt.toISOString(),
    arrivedAt: ride.arrivedAt?.toISOString() ?? null,
    startedAt: ride.startedAt?.toISOString() ?? null,
    completedAt: ride.completedAt?.toISOString() ?? null,
    cancelledAt: ride.cancelledAt?.toISOString() ?? null,
    expiresAt: ride.expiresAt.toISOString(),
    rider: {
      id: ride.user.id,
      name: `${ride.user.firstName ?? ""} ${ride.user.lastName ?? ""}`.trim() || ride.user.email,
      email: ride.user.email,
      phone: ride.user.phone,
      imageUrl: ride.user.imageUrl,
    },
    driver: ride.driver
      ? {
          id: ride.driver.id,
          name: `${ride.driver.firstName} ${ride.driver.lastName}`,
          email: ride.driver.user.email,
          phone: ride.driver.phone,
          vehicleType: ride.driver.vehicleType,
          vehicleModel: ride.driver.vehicleModel,
          vehicleColor: ride.driver.vehicleColor,
          vehiclePlate: ride.driver.vehiclePlate,
          rating:
            ride.driver.ratingCount > 0
              ? Math.round((ride.driver.ratingSum / ride.driver.ratingCount) * 10) / 10
              : null,
        }
      : null,
    offers: ride.offers.map((o) => ({
      id: o.id,
      driverId: o.driverId,
      driverName: `${o.driver.firstName} ${o.driver.lastName}`,
      vehicleType: o.driver.vehicleType,
      status: o.status,
      distanceKm: o.distanceKm,
      offeredAt: o.offeredAt.toISOString(),
      respondedAt: o.respondedAt?.toISOString() ?? null,
    })),
  };
}

// ── Cancel trip (admin) ──────────────────────────────────────────────
export async function cancelTrip(
  id: string,
  adminId: string,
  reason: string,
) {
  const ride = await prisma.ride.findUnique({ where: { id } });
  if (!ride) throw new NotFoundError("Trip not found");

  const terminal: RideStatus[] = [
    RideStatus.COMPLETED,
    RideStatus.CANCELLED,
    RideStatus.EXPIRED,
  ];
  if (terminal.includes(ride.status)) {
    throw new ConflictError(`Trip is already ${ride.status.toLowerCase()}`);
  }

  const previousState = { status: ride.status };

  const updated = await prisma.ride.update({
    where: { id },
    data: {
      status: RideStatus.CANCELLED,
      cancelReason: reason,
      cancelledAt: new Date(),
    },
  });

  await logAdminAction({
    adminId,
    action: "trips.cancel",
    targetType: "ride",
    targetId: id,
    previousState,
    newState: { status: updated.status },
    reason,
  });

  emitRideUpdated({
    rideId: id,
    newStatus: updated.status,
    timestamp: new Date().toISOString(),
  });

  return updated;
}
