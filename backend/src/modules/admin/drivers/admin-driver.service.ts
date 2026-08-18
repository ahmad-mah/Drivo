import { BadRequestError } from "../../../errors/BadRequestError";
import { NotFoundError } from "../../../errors/NotFoundError";
import { ApprovalStatus, type Prisma } from "@prisma/client";
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