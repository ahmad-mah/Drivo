import { TicketStatus } from "@prisma/client";
import { prisma } from "../../../config/database.js";
import { NotFoundError } from "../../../errors/NotFoundError.js";
import { logAdminAction } from "../../../shared/rbac.js";

export async function listTickets(params: { status?: TicketStatus; page?: number; limit?: number }) {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 25, 100);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.status) where.status = params.status;

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  const data = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    rideId: t.rideId,
    userName: t.user
      ? `${t.user.firstName ?? ""} ${t.user.lastName ?? ""}`.trim() || t.user.email
      : "Unknown",
    assignedName: t.assignedTo
      ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}`
      : null,
    createdAt: t.createdAt.toISOString(),
  }));

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getTicketDetail(id: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      assignedTo: { select: { firstName: true, lastName: true } },
    },
  });
  if (!ticket) throw new NotFoundError("Ticket not found");
  return {
    ...ticket,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
  adminId: string,
) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) throw new NotFoundError("Ticket not found");

  const previousState = { status: ticket.status };

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: { status },
  });

  await logAdminAction({
    adminId,
    action: "support.update_status",
    targetType: "ticket",
    targetId: id,
    previousState,
    newState: { status: updated.status },
  });

  return updated;
}
