import { db } from "../db";
import type { SessionCharge } from "./model";
import type { SessionChargeRepository } from "./repository";
import type { SessionCharge as PrismaSessionCharge } from "@prisma/client";

function mapToDomain(c: PrismaSessionCharge): SessionCharge {
  return {
    id: c.id,
    workspaceId: c.workspaceId,
    patientId: c.patientId,
    appointmentId: c.appointmentId,
    status: c.status as SessionCharge["status"],
    amountInCents: c.amountInCents,
    paymentMethod: c.paymentMethod,
    paidAt: c.paidAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export function createPrismaFinanceRepository(): SessionChargeRepository {
  return {
    async save(charge: SessionCharge): Promise<SessionCharge> {
      const data = {
        workspaceId: charge.workspaceId,
        patientId: charge.patientId,
        appointmentId: charge.appointmentId,
        status: charge.status,
        amountInCents: charge.amountInCents,
        paymentMethod: charge.paymentMethod,
        paidAt: charge.paidAt,
      };
      const c = await db.sessionCharge.upsert({
        where: { id: charge.id },
        update: data,
        create: { id: charge.id, ...data },
      });
      return mapToDomain(c);
    },

    async findById(id: string, workspaceId: string): Promise<SessionCharge | null> {
      const c = await db.sessionCharge.findUnique({ where: { id } });
      if (!c || c.workspaceId !== workspaceId) return null;
      return mapToDomain(c);
    },

    async findByAppointmentId(appointmentId: string): Promise<SessionCharge | null> {
      const c = await db.sessionCharge.findUnique({ where: { appointmentId } });
      return c ? mapToDomain(c) : null;
    },

    async listByPatient(patientId: string, workspaceId: string): Promise<SessionCharge[]> {
      const rows = await db.sessionCharge.findMany({
        where: { patientId, workspaceId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapToDomain);
    },

    async listByMonth(workspaceId: string, patientId: string, year: number, month: number): Promise<SessionCharge[]> {
      const from = new Date(Date.UTC(year, month - 1, 1));
      const to = new Date(Date.UTC(year, month, 1));
      const rows = await db.sessionCharge.findMany({
        where: { workspaceId, patientId, createdAt: { gte: from, lt: to } },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapToDomain);
    },

    async listByWorkspaceAndMonth(workspaceId: string, year: number, month: number): Promise<SessionCharge[]> {
      const from = new Date(Date.UTC(year, month - 1, 1));
      const to = new Date(Date.UTC(year, month, 1));
      const rows = await db.sessionCharge.findMany({
        where: { workspaceId, createdAt: { gte: from, lt: to } },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapToDomain);
    },

    async listByWorkspaceAndDateRange(workspaceId: string, from: Date, to: Date): Promise<SessionCharge[]> {
      const rows = await db.sessionCharge.findMany({
        where: { workspaceId, createdAt: { gte: from, lt: to } },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapToDomain);
    },
  };
}
