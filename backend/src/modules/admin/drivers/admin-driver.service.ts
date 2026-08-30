import { BadRequestError } from "../../../errors/BadRequestError";
import { NotFoundError } from "../../../errors/NotFoundError";
import { ApprovalStatus, RideStatus, type Prisma } from "@prisma/client";
import { prisma } from "../../../config/database";
import * as driverRepository from "../../drivers/driver.repository";

/**
 * Declarative admin transition map.
 * State: PENDING → APPROVED | REJECTED; APPROVED → SUSPENDED; SUSPENDED → APPROVED
 * Blocked: any action whose current status is not the mapped `expected` state.
 */
const transitions = {
  approve: {
    expected: ApprovalStatus.PENDING,
    noun: "application",
    data: {
      approvalStatus: ApprovalStatus.APPROVED,
      rejectionReason: null,
      rejectedAt: null,
    },
  },
  reject: {
    expected: ApprovalStatus.PENDING,
    noun: "application",
    data: (reason: string) => ({
      approvalStatus: ApprovalStatus.REJECTED,
      rejectionReason: reason,
      rejectedAt: new Date(),
    }),
  },
  suspend: {
    expected: ApprovalStatus.APPROVED,
    noun: "driver",
    data: { approvalStatus: ApprovalStatus.SUSPENDED },
  },
  reinstate: {
    expected: ApprovalStatus.SUSPENDED,
    noun: "driver",
    data: {
      approvalStatus: ApprovalStatus.APPROVED,
      rejectionReason: null,
      rejectedAt: null,
    },
  },
} as const;

type TransitionName = keyof typeof transitions;

/**
 * Applies a transition atomically: the expected status lives in the UPDATE's
 * WHERE clause, so a concurrent status change cannot race a stale read into a
 * double-apply. When 0 rows match, the state changed (or the profile is gone)
 * since the last read — re-fetch to report the actual cause.
 */
async function applyTransition(id: string, name: TransitionName, reason?: string) {
  const { expected, noun, data } = transitions[name];
  const update = typeof data === "function" ? data(reason!) : data;

  const result = await driverRepository.updateStatusIf(id, expected, update);
  if (result.count === 0) {
    const profile = await driverRepository.findById(id);
    if (!profile) throw new NotFoundError("Driver profile not found");
    throw new BadRequestError(
      `Cannot ${name} a ${profile.approvalStatus.toLowerCase()} ${noun}`,
    );
  }

  return driverRepository.findById(id)!;
}

export const approve = (id: string) => applyTransition(id, "approve");
export const reject = (id: string, reason: string) =>
  applyTransition(id, "reject", reason);
export const suspend = (id: string) => applyTransition(id, "suspend");
export const reinstate = (id: string) => applyTransition(id, "reinstate");

/**
 * Returns all driver profiles, optionally filtered by approval status.
 */
export async function listDrivers(status?: ApprovalStatus) {
  return driverRepository.findAll(status);
}

/**
 * Returns only drivers currently online — the initial payload for the admin
 * live map, served as a REST fallback before/additionally to the socket
 * snapshot. Mirrors the shape of the socket `drivers:locations` snapshot.
 */
export async function listLiveDrivers() {
  return driverRepository.findOnlineDrivers();
}

/**
 * Returns a single driver profile including its user (email) for the
 * admin detail view. Throws if the profile does not exist.
 */
export async function getById(id: string) {
  const profile = await driverRepository.findById(id);
  if (!profile) throw new NotFoundError("Driver profile not found");
  return profile;
}

/**
 * Returns full driver detail for admin panel: profile + stats + recent trips.
 */
export async function getDetail(id: string) {
  const profile = await prisma.driverProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          imageUrl: true,
          createdAt: true,
        },
      },
    },
  });

  if (!profile) throw new NotFoundError("Driver profile not found");

  const driverId = profile.id;

  const [
    totalTrips,
    completedTrips,
    cancelledByDriverTrips,
    aggregatedEarnings,
    recentTrips,
    onlineTimeMinutes,
  ] = await Promise.all([
    prisma.ride.count({ where: { driverId } }),
    prisma.ride.count({ where: { driverId, status: RideStatus.COMPLETED } }),
    prisma.ride.count({
      where: { driverId, status: RideStatus.CANCELLED },
    }),
    prisma.ride.aggregate({
      where: { driverId, status: RideStatus.COMPLETED },
      _sum: { fare: true },
    }),
    prisma.ride.findMany({
      where: { driverId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        originAddress: true,
        destinationAddress: true,
        fare: true,
        currency: true,
        distanceKm: true,
        createdAt: true,
        completedAt: true,
        cancelledAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.$queryRaw<[{ total: number }]>`
      SELECT COALESCE(
        SUM(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 60), 0
      )::int AS total
      FROM "DriverProfile"
      WHERE id = ${driverId} AND "is_online" = true
    `,
  ]);

  const rating =
    profile.ratingCount > 0
      ? Math.round((profile.ratingSum / profile.ratingCount) * 10) / 10
      : null;

  const totalEarnings = Number(aggregatedEarnings._sum.fare ?? 0);
  const avgEarningsPerTrip =
    completedTrips > 0 ? Math.round((totalEarnings / completedTrips) * 100) / 100 : 0;

  return {
    id: profile.id,
    approvalStatus: profile.approvalStatus,
    isOnline: profile.isOnline,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    vehicleType: profile.vehicleType,
    vehicleModel: profile.vehicleModel,
    vehicleColor: profile.vehicleColor,
    vehiclePlate: profile.vehiclePlate,
    rating,
    ratingCount: profile.ratingCount,
    createdAt: profile.createdAt.toISOString(),
    user: profile.user
      ? {
          id: profile.user.id,
          firstName: profile.user.firstName,
          lastName: profile.user.lastName,
          email: profile.user.email,
          phone: profile.user.phone,
          imageUrl: profile.user.imageUrl,
          createdAt: profile.user.createdAt.toISOString(),
        }
      : null,
    stats: {
      totalTrips,
      completedTrips,
      cancelledTrips: cancelledByDriverTrips,
      completionRate:
        totalTrips > 0
          ? Math.round((completedTrips / totalTrips) * 1000) / 10
          : 0,
      totalEarnings,
      avgEarningsPerTrip,
      onlineMinutes: onlineTimeMinutes[0]?.total ?? 0,
    },
    recentTrips: recentTrips.map((t) => ({
      id: t.id,
      status: t.status,
      originAddress: t.originAddress,
      destinationAddress: t.destinationAddress,
      fare: Number(t.fare),
      currency: t.currency,
      distanceKm: t.distanceKm,
      createdAt: t.createdAt.toISOString(),
      completedAt: t.completedAt?.toISOString() ?? null,
      cancelledAt: t.cancelledAt?.toISOString() ?? null,
      riderName:
        `${t.user.firstName ?? ""} ${t.user.lastName ?? ""}`.trim() || "Unknown",
    })),
  };
}