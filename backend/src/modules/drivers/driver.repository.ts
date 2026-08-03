import { prisma } from "../../config/database";
import {
  ApprovalStatus,
  type Prisma,
} from "@prisma/client";
import type { CreateDriverDto, DriverPersonalInfo } from "./driver.types";

export async function findByUserId(userId: string) {
  return prisma.driverProfile.findUnique({
    where: { userId },
  });
}

export async function findById(id: string) {
  return prisma.driverProfile.findUnique({
    where: { id },
    include: { user: true },
  });
}

export async function upsert(
  userId: string,
  personal: DriverPersonalInfo,
  data: CreateDriverDto,
) {
  const personalData = {
    firstName: personal.firstName,
    lastName: personal.lastName,
    phone: personal.phone,
  };
  const vehicleData = {
    vehicleType: data.vehicleType,
    vehicleModel: data.vehicleModel,
    vehicleColor: data.vehicleColor,
    vehiclePlate: data.vehiclePlate,
    licenseNumber: data.licenseNumber,
  };

  return prisma.driverProfile.upsert({
    where: { userId },
    update: {
      ...personalData,
      ...vehicleData,
      approvalStatus: ApprovalStatus.PENDING,
      rejectionReason: null,
      rejectedAt: null,
    },
    create: {
      userId,
      ...personalData,
      ...vehicleData,
    },
  });
}

export async function findAll(status?: ApprovalStatus) {
  const where = status ? { approvalStatus: status } : {};
  return prisma.driverProfile.findMany({
    where,
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateStatus(
  id: string,
  data: Prisma.DriverProfileUpdateInput,
) {
  return prisma.driverProfile.update({
    where: { id },
    data,
  });
}
