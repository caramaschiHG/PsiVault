import { db } from "../db";
import type { NotificationJob, NotificationJobStatus, NotificationJobType } from "./model";
import type { NotificationJobRepository } from "./repository";
import type { NotificationJob as PrismaNotificationJob } from "@prisma/client";

function mapToDomain(r: PrismaNotificationJob): NotificationJob {
  return {
    id: r.id,
    workspaceId: r.workspaceId,
    appointmentId: r.appointmentId,
    patientId: r.patientId,
    recipientEmail: r.recipientEmail,
    type: r.type as NotificationJobType,
    status: r.status as NotificationJobStatus,
    scheduledFor: r.scheduledFor,
    sentAt: r.sentAt,
    failedAt: r.failedAt,
    errorNote: r.errorNote,
    idempotencyKey: r.idempotencyKey,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function createPrismaNotificationJobRepository(): NotificationJobRepository {
  return {
    async save(job) {
      const data = {
        workspaceId: job.workspaceId,
        appointmentId: job.appointmentId,
        patientId: job.patientId,
        recipientEmail: job.recipientEmail,
        type: job.type,
        status: job.status,
        scheduledFor: job.scheduledFor,
        sentAt: job.sentAt,
        failedAt: job.failedAt,
        errorNote: job.errorNote,
        idempotencyKey: job.idempotencyKey,
      };
      const r = await db.notificationJob.upsert({
        where: { id: job.id },
        update: data,
        create: { id: job.id, ...data },
      });
      return mapToDomain(r);
    },

    async findByIdempotencyKey(key) {
      const r = await db.notificationJob.findUnique({ where: { idempotencyKey: key } });
      return r ? mapToDomain(r) : null;
    },

    async listDue(now) {
      const rows = await db.notificationJob.findMany({
        where: { status: "PENDING", scheduledFor: { lte: now } },
        orderBy: { scheduledFor: "asc" },
      });
      return rows.map(mapToDomain);
    },

    async cancelByAppointment(appointmentId) {
      await db.notificationJob.updateMany({
        where: { appointmentId, status: "PENDING" },
        data: { status: "CANCELED" },
      });
    },

    async listByWorkspace(workspaceId) {
      const rows = await db.notificationJob.findMany({
        where: { workspaceId },
        orderBy: { scheduledFor: "desc" },
      });
      return rows.map(mapToDomain);
    },
  };
}
