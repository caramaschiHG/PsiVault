import { db } from "../db";
import type { Reminder, ReminderLinkType } from "./model";
import type { ReminderRepository } from "./repository";
import type { Reminder as PrismaReminder } from "@prisma/client";

function mapToDomain(r: PrismaReminder): Reminder {
  return {
    id: r.id,
    workspaceId: r.workspaceId,
    title: r.title,
    dueAt: r.dueAt,
    completedAt: r.completedAt,
    link:
      r.linkType != null && r.linkId != null
        ? { type: r.linkType as ReminderLinkType, id: r.linkId }
        : null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function createPrismaReminderRepository(): ReminderRepository {
  return {
    async save(reminder: Reminder): Promise<Reminder> {
      const data = {
        workspaceId: reminder.workspaceId,
        patientId: reminder.link?.type === "patient" ? reminder.link.id : null,
        title: reminder.title,
        dueAt: reminder.dueAt,
        completedAt: reminder.completedAt,
        linkType: reminder.link?.type ?? null,
        linkId: reminder.link?.id ?? null,
      };
      const r = await db.reminder.upsert({
        where: { id: reminder.id },
        update: data,
        create: { id: reminder.id, ...data },
      });
      return mapToDomain(r);
    },

    async findById(id: string, workspaceId: string): Promise<Reminder | null> {
      const r = await db.reminder.findFirst({ where: { id, workspaceId } });
      return r ? mapToDomain(r) : null;
    },

    async listActive(workspaceId: string): Promise<Reminder[]> {
      const rows = await db.reminder.findMany({
        where: { workspaceId, completedAt: null },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapToDomain);
    },

    async listCompleted(workspaceId: string): Promise<Reminder[]> {
      const rows = await db.reminder.findMany({
        where: { workspaceId, completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
      });
      return rows.map(mapToDomain);
    },

    async listActiveByPatient(patientId: string, workspaceId: string): Promise<Reminder[]> {
      const rows = await db.reminder.findMany({
        where: { workspaceId, completedAt: null, linkType: "patient", linkId: patientId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(mapToDomain);
    },

    async listCompletedByPatient(patientId: string, workspaceId: string): Promise<Reminder[]> {
      const rows = await db.reminder.findMany({
        where: { workspaceId, completedAt: { not: null }, linkType: "patient", linkId: patientId },
        orderBy: { completedAt: "desc" },
      });
      return rows.map(mapToDomain);
    },
  };
}
