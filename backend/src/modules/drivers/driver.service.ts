import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";
import * as userRepository from "../users/user.repository";
import * as driverRepository from "./driver.repository";
import type { ApplyDriverDto } from "./driver.validation";
import type { DriverPersonalInfo } from "./driver.types";
import { ApprovalStatus, type User } from "@prisma/client";

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
 * Returns the driver's personal info snapshot, or the previous application's
 * snapshot as a fallback when the profile is incomplete (re-apply path).
 * Throws when incomplete and no fallback exists (first-time apply).
 */
function getDriverPersonalInfo(
  user: User,
  existing?: DriverPersonalInfo | null,
): DriverPersonalInfo {
  const personal = buildDriverPersonalInfo(user);
  if (hasRequiredPersonalInfo(personal)) return personal;

  if (existing) {
    return {
      firstName: existing.firstName,
      lastName: existing.lastName,
      phone: existing.phone,
    };
  }

  throw new BadRequestError(
    "Complete your name and phone in your profile before applying to drive",
  );
}

/** Resolves the authenticated user or throws. */
async function requireUser(clerkId: string): Promise<User> {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) throw new NotFoundError("User not found");
  return user;
}

/**
 * Submits a new driver application or re-applies after rejection.
 *
 * State: null → PENDING  |  REJECTED → PENDING
 * Blocked: existing PENDING or APPROVED applications cannot re-apply.
 * Re-apply is also blocked during the 7-day rejection cooldown.
 */
export async function apply(clerkId: string, data: ApplyDriverDto) {
  const user = await requireUser(clerkId);

  const existing = await driverRepository.findByUserId(user.id);

  // Only REJECTED drivers may re-apply; PENDING/APPROVED are blocked
  if (existing && existing.approvalStatus !== ApprovalStatus.REJECTED) {
    throw new BadRequestError(
      existing.approvalStatus === ApprovalStatus.PENDING
        ? "Application already submitted and pending review"
        : "You are already an approved driver",
    );
  }

  // Strict cooldown: rejected drivers must wait 1 week before re-applying
  if (existing) assertReapplyWindowReached(existing);

  const personal = getDriverPersonalInfo(user);

  return driverRepository.upsert(user.id, personal, data);
}

/**
 * Returns the authenticated user's driver application status.
 * Throws if no application exists.
 */
export async function getMyApplication(clerkId: string) {
  const user = await requireUser(clerkId);

  const profile = await driverRepository.findByUserId(user.id);
  if (!profile) throw new NotFoundError("No driver application found");

  return profile;
}

/**
 * Updates and re-submits an application.
 *
 * State: REJECTED → PENDING  |  APPROVED → PENDING (vehicle change re-review)
 * Blocked: PENDING and SUSPENDED drivers cannot use this flow.
 * Rejected drivers must wait out the 7-day re-apply cooldown.
 */
export async function updateApplication(clerkId: string, data: ApplyDriverDto) {
  const user = await requireUser(clerkId);

  const existing = await driverRepository.findByUserId(user.id);
  if (!existing) throw new NotFoundError("No driver application found");

  // Re-apply is only permitted after rejection, or when an approved driver
  // changes their vehicle (drops back to PENDING for re-review)
  if (
    existing.approvalStatus !== ApprovalStatus.REJECTED &&
    existing.approvalStatus !== ApprovalStatus.APPROVED
  ) {
    throw new BadRequestError("Can only update a rejected or approved application");
  }

  // Strict cooldown: rejected drivers must wait 1 week before re-applying.
  // Approved vehicle changes are exempt — there is no rejection to cool down from.
  if (existing.approvalStatus === ApprovalStatus.REJECTED) {
    assertReapplyWindowReached(existing);
  }

  // Fall back to the snapshot on the previous application so an incomplete
  // profile never blocks a re-apply
  const personal = getDriverPersonalInfo(user, existing);

  return driverRepository.upsert(user.id, personal, data);
}
