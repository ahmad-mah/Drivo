import { prisma } from "../../config/database";
import type { ApprovalStatus, Prisma } from "@prisma/client";
import type { CreateDriverDto } from "./driver.types";

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

export async function upsert(userId: string, data: CreateDriverDto) {
  return prisma.driverProfile.upsert({
    where: { userId },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      vehicleType: data.vehicleType,
      vehicleModel: data.vehicleModel,
      vehicleColor: data.vehicleColor,
      vehiclePlate: data.vehiclePlate,
      licenseNumber: data.licenseNumber,
      approvalStatus: "PENDING",
      rejectionReason: null,
    },
    create: {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      vehicleType: data.vehicleType,
      vehicleModel: data.vehicleModel,
      vehicleColor: data.vehicleColor,
      vehiclePlate: data.vehiclePlate,
      licenseNumber: data.licenseNumber,
    },
  });
}

export async function findAll(status?: ApprovalStatus) {
  const where = status ? { approvalStatus: status } : {};
  return prisma.driverProfile.findMany({ where });
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
