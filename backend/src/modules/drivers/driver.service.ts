import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";
import * as userRepository from "../users/user.repository";
import * as driverRepository from "./driver.repository";
import type { ApplyDriverDto } from "./driver.validation";

/**
 * Submits a new driver application or re-applies after rejection.
 *
 * State: null → PENDING  |  REJECTED → PENDING
 * Blocked: existing PENDING or APPROVED applications cannot re-apply.
 */
export async function apply(clerkId: string, data: ApplyDriverDto) {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) throw new NotFoundError("User not found");

  const existing = await driverRepository.findByUserId(user.id);

  // Only REJECTED drivers may re-apply; PENDING/APPROVED are blocked
  if (existing && existing.approvalStatus !== "REJECTED") {
    throw new BadRequestError(
      existing.approvalStatus === "PENDING"
        ? "Application already submitted and pending review"
        : "You are already an approved driver",
    );
  }

  return driverRepository.upsert(user.id, data);
}

/**
 * Returns the authenticated user's driver application status.
 * Throws if no application exists.
 */
export async function getMyApplication(clerkId: string) {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) throw new NotFoundError("User not found");

  const profile = await driverRepository.findByUserId(user.id);
  if (!profile) throw new NotFoundError("No driver application found");

  return profile;
}

/**
 * Updates and re-submits a previously REJECTED application.
 *
 * State: REJECTED → PENDING
 * Blocked: PENDING, APPROVED, or SUSPENDED drivers cannot use this flow.
 */
export async function updateApplication(clerkId: string, data: ApplyDriverDto) {
  const user = await userRepository.findByClerkId(clerkId);
  if (!user) throw new NotFoundError("User not found");

  const existing = await driverRepository.findByUserId(user.id);
  if (!existing) throw new NotFoundError("No driver application found");

  // Re-apply is only permitted after rejection — forces edit before re-review
  if (existing.approvalStatus !== "REJECTED") {
    throw new BadRequestError("Can only re-apply after rejection");
  }

  return driverRepository.upsert(user.id, data);
}
