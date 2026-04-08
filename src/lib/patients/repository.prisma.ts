import { db } from "../db";
import type { Patient } from "./model";
import type { PatientRepository } from "./repository";
import type { Patient as PrismaPatient } from "@prisma/client";

function mapToDomain(p: PrismaPatient): Patient {
  return {
    id: p.id,
    workspaceId: p.workspaceId,
    fullName: p.fullName,
    socialName: p.socialName,
    email: p.email,
    phone: p.phone,
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

export function createPrismaPatientRepository(): PatientRepository {
  return {
    async save(patient: Patient): Promise<Patient> {
      const data = {
        fullName: patient.fullName,
        socialName: patient.socialName,
        email: patient.email,
        phone: patient.phone,
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
      });

      return patients.map(mapToDomain);
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
      });

      return patients.map(mapToDomain);
    },
  };
}
