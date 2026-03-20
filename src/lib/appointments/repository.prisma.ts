import { db } from "../db";
import type { Appointment, AppointmentCareMode, AppointmentStatus, CancellationActor, SeriesPattern } from "./model";
import type { AppointmentRepository } from "./repository";
import type { Appointment as PrismaAppointment, AppointmentCareMode as PrismaCareMode, AppointmentStatus as PrismaStatus, CancellationActor as PrismaCancellationActor } from "@prisma/client";

function mapToDomain(a: PrismaAppointment): Appointment {
  return {
    id: a.id,
    workspaceId: a.workspaceId,
    patientId: a.patientId,
    startsAt: a.startsAt,
    endsAt: a.endsAt,
    durationMinutes: a.durationMinutes,
    careMode: a.careMode as AppointmentCareMode,
    status: a.status as AppointmentStatus,
    seriesId: a.seriesId,
    seriesIndex: a.seriesIndex,
    rescheduledFromId: a.rescheduledFromId,
    canceledAt: a.canceledAt,
    canceledByAccountId: a.canceledByAccountId,
    canceledBy: a.canceledBy as CancellationActor | null,
    confirmedAt: a.confirmedAt,
    completedAt: a.completedAt,
    noShowAt: a.noShowAt,
    priceInCents: a.priceInCents,
    meetingLink: a.meetingLink,
    remoteIssueNote: a.remoteIssueNote,
    seriesPattern: a.seriesPattern as SeriesPattern | null,
    seriesDaysOfWeek: a.seriesDaysOfWeek,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

function buildData(appointment: Appointment) {
  return {
    workspaceId: appointment.workspaceId,
    patientId: appointment.patientId,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
    durationMinutes: appointment.durationMinutes,
    careMode: appointment.careMode as PrismaCareMode,
    status: appointment.status as PrismaStatus,
    seriesId: appointment.seriesId,
    seriesIndex: appointment.seriesIndex,
    rescheduledFromId: appointment.rescheduledFromId,
    canceledAt: appointment.canceledAt,
    canceledByAccountId: appointment.canceledByAccountId,
    canceledBy: appointment.canceledBy as PrismaCancellationActor | null,
    confirmedAt: appointment.confirmedAt,
    completedAt: appointment.completedAt,
    noShowAt: appointment.noShowAt,
    priceInCents: appointment.priceInCents,
    meetingLink: appointment.meetingLink,
    remoteIssueNote: appointment.remoteIssueNote,
    seriesPattern: appointment.seriesPattern,
    seriesDaysOfWeek: appointment.seriesDaysOfWeek,
  };
}

export function createPrismaAppointmentRepository(): AppointmentRepository {
  return {
    async save(appointment: Appointment): Promise<Appointment> {
      const data = buildData(appointment);

      const a = await db.appointment.upsert({
        where: { id: appointment.id },
        update: data,
        create: {
          id: appointment.id,
          ...data,
        },
      });

      return mapToDomain(a);
    },

    async findById(id: string, workspaceId: string): Promise<Appointment | null> {
      const a = await db.appointment.findFirst({
        where: { id, workspaceId },
      });

      return a ? mapToDomain(a) : null;
    },

    async listByDateRange(workspaceId: string, from: Date, to: Date): Promise<Appointment[]> {
      const appointments = await db.appointment.findMany({
        where: {
          workspaceId,
          startsAt: {
            gte: from,
            lt: to,
          },
        },
        orderBy: {
          startsAt: "asc",
        },
      });

      return appointments.map(mapToDomain);
    },

    async listBySeries(seriesId: string, workspaceId: string): Promise<Appointment[]> {
      const appointments = await db.appointment.findMany({
        where: {
          workspaceId,
          seriesId,
        },
        orderBy: {
          startsAt: "asc",
        },
      });

      return appointments.map(mapToDomain);
    },

    async listByPatient(patientId: string, workspaceId: string): Promise<Appointment[]> {
      const appointments = await db.appointment.findMany({
        where: {
          workspaceId,
          patientId,
        },
        orderBy: {
          startsAt: "desc",
        },
      });

      return appointments.map(mapToDomain);
    },

    async listFutureActiveByPatient(patientId: string, workspaceId: string, from: Date): Promise<Appointment[]> {
      const appointments = await db.appointment.findMany({
        where: {
          workspaceId,
          patientId,
          status: { in: ["SCHEDULED", "CONFIRMED"] },
          startsAt: { gte: from },
        },
        orderBy: {
          startsAt: "asc",
        },
      });

      return appointments.map(mapToDomain);
    },

    async saveBatch(appointments: Appointment[]): Promise<void> {
      await db.$transaction(
        appointments.map((appointment) => {
          const data = buildData(appointment);
          return db.appointment.upsert({
            where: { id: appointment.id },
            update: data,
            create: { id: appointment.id, ...data },
          });
        }),
      );
    },
  };
}
