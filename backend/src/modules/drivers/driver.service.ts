import { BadRequestError } from "../../errors/BadRequestError";
import { ConflictError } from "../../errors/ConflictError";
import { NotFoundError } from "../../errors/NotFoundError";
import { env } from "../../config";
import { requireUserByClerkId } from "../../shared/require-user";
import { assertValidCoordinates } from "../../shared/validation/coordinates";
import * as driverRepository from "./driver.repository";
import { ensureFakeDriversAround } from "./fake-drivers.simulator";
import type { ApplyDriverDto, UpdateLocationDto } from "./driver.validation";
import type { DriverPersonalInfo } from "./driver.types";
import {
  ApprovalStatus,
  Prisma,
  type User,
} from "@prisma/client";

const REAPPLY_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Blocks re-apply until the rejection cooldown has passed.
 * Throws when the driver was rejected less than REAPPLY_COOLDOWN_MS ago.
 */
function assertReapplyWindowReached(existing: { rejectedAt: Date | null }) {
  if (!existing.rejectedAt) return;

  const elapsedMs = Date.now() - existing.rejectedAt.getTime();
  if (elapsedMs < REAPPLY_COOLDOWN_MS) {
    const remainingDays = Math.ceil(
      (REAPPLY_COOLDOWN_MS - elapsedMs) / (24 * 60 * 60 * 1000),
    );
    throw new BadRequestError(
      `You can re-apply in ${remainingDays} day${remainingDays === 1 ? "" : "s"}`,
    );
  }
}

/**
 * Snapshots the user's profile into the driver record.
 *
 * Personal info is owned by the User (profile screen) — the driver application
 * only stores a copy so admins see the name/phone at review time.
 */
function buildDriverPersonalInfo(user: User): DriverPersonalInfo {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phone: user.phone ?? "",
  };
}

function hasRequiredPersonalInfo(personal: DriverPersonalInfo) {
  return (
    personal.firstName.trim().length > 0 &&
    personal.lastName.trim().length > 0 &&
    personal.phone.trim().length > 0
  );
}

/**
 * Returns the driver application with the user profile as the source of truth.
 * The User owns personal info (profile screen); the driver record only stores
 * a snapshot for admin review. Throws when the profile is incomplete — there
 * is deliberately no fallback to a previous application's snapshot (Model A).
 */
function getDriverPersonalInfo(user: User): DriverPersonalInfo {
  const personal = buildDriverPersonalInfo(user);
  if (!hasRequiredPersonalInfo(personal)) {
    throw new BadRequestError(
      "Complete your name and phone in your profile before applying to drive",
    );
  }
  return personal;
}

/**
 * Submits or re-submits a driver application.
 *
 * State: null → PENDING  |  REJECTED → PENDING  |  APPROVED → PENDING (update only)
 * Blocked: existing PENDING applications cannot be re-submitted; SUSPENDED
 * drivers cannot use the flow at all; a fresh apply from an APPROVED driver is
 * rejected (vehicle changes must go through updateApplication).
 * Rejected drivers must wait out the 7-day re-apply cooldown.
 */
async function saveApplication(
  clerkId: string,
  data: ApplyDriverDto,
  mode: "apply" | "update",
) {
  const user = await requireUserByClerkId(clerkId);

  const existing = await driverRepository.findByUserId(user.id);

  if (existing?.approvalStatus === ApprovalStatus.PENDING) {
    throw new BadRequestError("Application already submitted and pending review");
  }
  if (existing?.approvalStatus === ApprovalStatus.SUSPENDED) {
    throw new BadRequestError("Can only update a rejected or approved application");
  }
  if (mode === "apply" && existing?.approvalStatus === ApprovalStatus.APPROVED) {
    throw new BadRequestError("You are already an approved driver");
  }
  if (mode === "update" && !existing) {
    throw new NotFoundError("No driver application found");
  }

  // Strict cooldown: rejected drivers must wait 1 week before re-applying.
  // Approved vehicle changes are exempt — there is no rejection to cool down from.
  if (existing?.approvalStatus === ApprovalStatus.REJECTED) {
    assertReapplyWindowReached(existing);
  }

  // Personal info is re-read from the User so an approved driver can never
  // resubmit under an old name/phone they have since changed (Model A).
  const personal = getDriverPersonalInfo(user);

  // Two concurrent first-time applications could both pass the "no existing
  // row" check and race the create. The unique (userId) index makes one of
  // them fail with P2002 — surface it as a clean 409 instead of a 500.
  try {
    return await driverRepository.upsert(user.id, personal, data);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new ConflictError("Application already submitted");
    }
    throw err;
  }
}

export const apply = (clerkId: string, data: ApplyDriverDto) =>
  saveApplication(clerkId, data, "apply");

export const updateApplication = (clerkId: string, data: ApplyDriverDto) =>
  saveApplication(clerkId, data, "update");

/**
 * Returns the authenticated user's driver application status.
 * Throws if no application exists.
 */
export async function getMyApplication(clerkId: string) {
  const user = await requireUserByClerkId(clerkId);

  const profile = await driverRepository.findByUserId(user.id);
  if (!profile) throw new NotFoundError("No driver application found");

  return profile;
}

export interface DriverAvailabilityResult {
  isOnline: boolean;
  error?: string;
}

/**
 * Flips the driver online.
 *
 * State: offline → online
 * Blocked: PENDING, REJECTED and SUSPENDED drivers cannot go online; only
 * approved drivers may present themselves as available to the map. The
 * approval check is part of the atomic DB write, so an admin suspending the
 * driver concurrently cannot race a stale read into an online flip.
 */
export async function goOnline(clerkId: string): Promise<DriverAvailabilityResult> {
  const user = await requireUserByClerkId(clerkId);

  const result = await driverRepository.setOnlineIfApproved(user.id);
  if (result.count === 0) {
    // 0 rows means either no profile or the approval status isn't APPROVED —
    // either way the driver may not go online
    return { isOnline: false, error: "Only approved drivers can go online" };
  }

  return { isOnline: true };
}

/**
 * Flips the driver offline. Intentionally idempotent — the mobile app may
 * retry or call it for an already-offline driver; that is a success.
 */
export async function goOffline(clerkId: string): Promise<DriverAvailabilityResult> {
  const user = await requireUserByClerkId(clerkId);
  await driverRepository.setOffline(user.id);
  return { isOnline: false };
}

/**
 * REST variant of the two socket events: the body carries the target state
 * (`isOnline: true|false`) instead of distinct socket events. This "sets"
 * availability rather than toggling it.
 */
export async function setAvailability(
  clerkId: string,
  data: { isOnline: boolean },
): Promise<DriverAvailabilityResult> {
  return data.isOnline ? goOnline(clerkId) : goOffline(clerkId);
}

/**
 * Registers driver liveness. Offline drivers are swept after a silence window
 * regardless of whether they are moving, so the mobile app pings this on a
 * fixed interval to keep stationary drivers visible on the admin map.
 */
export async function heartbeat(clerkId: string) {
  const user = await requireUserByClerkId(clerkId);
  await driverRepository.refreshSeen(user.id);
}

/** Records the driver's latest live position. */
export async function updateLocation(
  clerkId: string,
  location: UpdateLocationDto,
) {
  assertValidCoordinates(location.latitude, location.longitude);

  const user = await requireUserByClerkId(clerkId);
  await driverRepository.updateLocation(user.id, location);
}

/** Returns the nearest online drivers around a point for the rider map. */
export async function getNearbyDrivers(
  latitude: number,
  longitude: number,
  radiusKm: number,
) {
  assertValidCoordinates(latitude, longitude);
  // Seeding on query keeps the simulated fleet centered on where riders
  // actually look, so the home map always has cars without a ride request.
  // Skipped entirely while the fleet is disabled for real-driver testing.
  if (!env.DISABLE_FAKE_DRIVERS) {
    await ensureFakeDriversAround(latitude, longitude);
  }
  return driverRepository.findNearbyDrivers(latitude, longitude, radiusKm);
}
