import { prisma } from "../../config/database";
import type { Prisma } from "@prisma/client";
import type { CreateUserFromClerkDto } from "./user.types";

export async function upsertFromClerk(
  data: CreateUserFromClerkDto,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  return client.user.upsert({
    where: {
      clerkId: data.clerkId,
    },
    update: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      imageUrl: data.imageUrl,
    },
    create: {
      clerkId: data.clerkId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      imageUrl: data.imageUrl,
    },
  });
}

export async function findByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function deleteByClerkId(
  clerkId: string,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  return client.user.deleteMany({
    where: { clerkId },
  });
}
