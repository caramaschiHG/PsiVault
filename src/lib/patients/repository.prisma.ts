import { db } from "../db";
import type { Patient } from "./model";
import type { PatientRepository } from "./repository";
import { Prisma } from "@prisma/client";
import type { Patient as PrismaPatient } from "@prisma/client";

function mapToDomain(p: PrismaPatient): Patient {
  return {
    id: p.id,
    workspaceId: p.workspaceId,
    fullName: p.fullName,
    socialName: p.socialName,
    email: p.email,
    phone: p.phone,
    reminderPhone: p.reminderPhone,
    preferredReminderTime: p.preferredReminderTime,
    sessionPriceInCents: p.sessionPriceInCents,
    guardianName: p.guardianName,
    guardianPhone: p.guardianPhone,
    emergencyContactName: p.emergencyContactName,
    emergencyContactPhone: p.emergencyContactPhone,
    importantObservations: p.importantObservations,
    archivedAt: p.deletedAt,
    archivedByAccountId: p.deletedByAccountId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

const LIST_SELECT = Prisma.validator<Prisma.PatientSelect>()({
  id: true,
  workspaceId: true,
  fullName: true,
  socialName: true,
  email: true,
  phone: true,
  reminderPhone: true,
  preferredReminderTime: true,
  sessionPriceInCents: true,
  guardianName: true,
  guardianPhone: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  deletedAt: true,
  deletedByAccountId: true,
  createdAt: true,
  updatedAt: true,
});

type PatientListRow = Prisma.PatientGetPayload<{ select: typeof LIST_SELECT }>;

function mapListToDomain(p: PatientListRow): Patient {
  return {
    id: p.id,
    workspaceId: p.workspaceId,
    fullName: p.fullName,
    socialName: p.socialName,
    email: p.email,
    phone: p.phone,
    reminderPhone: p.reminderPhone,
    preferredReminderTime: p.preferredReminderTime,
    sessionPriceInCents: p.sessionPriceInCents,
    guardianName: p.guardianName,
    guardianPhone: p.guardianPhone,
    emergencyContactName: p.emergencyContactName,
    emergencyContactPhone: p.emergencyContactPhone,
    importantObservations: null, // excluded from list queries — see schema comment
    archivedAt: p.deletedAt,
    archivedByAccountId: p.deletedByAccountId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function createPrismaPatientRepository(): PatientRepository {
  return {
    async save(patient: Patient): Promise<Patient> {
      const data = {
        fullName: patient.fullName,
        socialName: patient.socialName,
        email: patient.email,
        phone: patient.phone,
        reminderPhone: patient.reminderPhone,
        preferredReminderTime: patient.preferredReminderTime,
        sessionPriceInCents: patient.sessionPriceInCents,
        guardianName: patient.guardianName,
        guardianPhone: patient.guardianPhone,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
        importantObservations: patient.importantObservations,
        deletedAt: patient.archivedAt,
        deletedByAccountId: patient.archivedByAccountId,
        workspaceId: patient.workspaceId,
      };

      const p = await db.patient.upsert({
        where: { id: patient.id },
        update: data,
        create: {
          id: patient.id,
          ...data,
        },
      });

      return mapToDomain(p);
    },

    async findById(id: string, workspaceId: string): Promise<Patient | null> {
      const p = await db.patient.findFirst({
        where: { id, workspaceId },
      });

      return p ? mapToDomain(p) : null;
    },

    async listActive(workspaceId: string): Promise<Patient[]> {
      const patients = await db.patient.findMany({
        where: {
          workspaceId,
          deletedAt: null,
        },
        orderBy: {
          fullName: "asc",
        },
        select: LIST_SELECT,
      });

      return patients.map(mapListToDomain);
    },

    async listArchived(workspaceId: string): Promise<Patient[]> {
      const patients = await db.patient.findMany({
        where: {
          workspaceId,
          deletedAt: { not: null },
        },
        orderBy: {
          deletedAt: "desc",
        },
        select: LIST_SELECT,
      });

      return patients.map(mapListToDomain);
    },

    async listAllByWorkspace(workspaceId: string): Promise<Patient[]> {
      const patients = await db.patient.findMany({
        where: { workspaceId },
        orderBy: { fullName: "asc" },
      });
      return patients.map(mapToDomain);
    },

    async searchByName(workspaceId: string, query: string): Promise<Patient[]> {
      const q = query.trim();
      if (!q) return [];

      const patients = await db.patient.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { socialName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { fullName: "asc" },
        select: LIST_SELECT,
      });

      return patients.map(mapListToDomain);
    },
  };
}
