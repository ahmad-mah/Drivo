import { BadRequestError } from "../../../errors/BadRequestError";
import { NotFoundError } from "../../../errors/NotFoundError";
import type { ApprovalStatus } from "@prisma/client";
import * as driverRepository from "../../drivers/driver.repository";

/**
 * Returns all driver profiles, optionally filtered by approval status.
 */
export async function listDrivers(status?: ApprovalStatus) {
  return driverRepository.findAll(status);
}

/**
 * Approves a PENDING driver application.
 * State: PENDING → APPROVED
 * Blocked: REJECTED, SUSPENDED, or already APPROVED profiles.
 */
export async function approve(id: string) {
  const profile = await driverRepository.findById(id);
  if (!profile) throw new NotFoundError("Driver profile not found");

  // Only PENDING applications can be approved
  if (profile.approvalStatus !== "PENDING") {
    throw new BadRequestError(
      `Cannot approve a ${profile.approvalStatus.toLowerCase()} application`,
    );
  }

  return driverRepository.updateStatus(id, {
    approvalStatus: "APPROVED",
    rejectionReason: null,
  });
}

/**
 * Rejects a PENDING driver application with a reason.
 * State: PENDING → REJECTED
 * Blocked: APPROVED, SUSPENDED, or already REJECTED profiles.
 */
export async function reject(id: string, reason: string) {
  const profile = await driverRepository.findById(id);
  if (!profile) throw new NotFoundError("Driver profile not found");

  // Only PENDING applications can be rejected
  if (profile.approvalStatus !== "PENDING") {
    throw new BadRequestError(
      `Cannot reject a ${profile.approvalStatus.toLowerCase()} application`,
    );
  }

  return driverRepository.updateStatus(id, {
    approvalStatus: "REJECTED",
    rejectionReason: reason,
  });
}

/**
 * Suspends an APPROVED driver (e.g. for policy violations).
 * State: APPROVED → SUSPENDED
 * Blocked: PENDING, REJECTED, or already SUSPENDED profiles.
 */
export async function suspend(id: string) {
  const profile = await driverRepository.findById(id);
  if (!profile) throw new NotFoundError("Driver profile not found");

  // Only APPROVED drivers can be suspended
  if (profile.approvalStatus !== "APPROVED") {
    throw new BadRequestError(
      `Cannot suspend a ${profile.approvalStatus.toLowerCase()} driver`,
    );
  }

  return driverRepository.updateStatus(id, { approvalStatus: "SUSPENDED" });
}

/**
 * Reinstates a SUSPENDED driver back to APPROVED status.
 * State: SUSPENDED → APPROVED
 * Blocked: PENDING, APPROVED, or REJECTED profiles.
 */
export async function reinstate(id: string) {
  const profile = await driverRepository.findById(id);
  if (!profile) throw new NotFoundError("Driver profile not found");

  // Only SUSPENDED drivers can be reinstated
  if (profile.approvalStatus !== "SUSPENDED") {
    throw new BadRequestError(
      `Cannot reinstate a ${profile.approvalStatus.toLowerCase()} driver`,
    );
  }

  return driverRepository.updateStatus(id, {
    approvalStatus: "APPROVED",
    rejectionReason: null,
  });
}
