import { db } from "../db";
import type { PracticeDocument, DocumentType, DocumentStatus } from "./model";
import type { PracticeDocumentRepository } from "./repository";
import type { PracticeDocument as PrismaDocument } from "@prisma/client";

function mapToDomain(d: PrismaDocument): PracticeDocument {
  return {
    id: d.id,
    workspaceId: d.workspaceId,
    patientId: d.patientId,
    type: d.type as DocumentType, // Prisma stores String; cast to domain union
    content: d.content,
    createdByAccountId: d.createdByAccountId,
    createdByName: d.createdByName,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    editedAt: d.editedAt,
    archivedAt: d.archivedAt,
    archivedByAccountId: d.archivedByAccountId,
    status: d.status as DocumentStatus,
    appointmentId: d.appointmentId,
    signedAt: d.signedAt,
    signedByAccountId: d.signedByAccountId,
    deliveredAt: d.deliveredAt,
    deliveredTo: d.deliveredTo,
    deliveredVia: d.deliveredVia,
  };
}

function mapToPrisma(doc: PracticeDocument) {
  return {
    workspaceId: doc.workspaceId,
    patientId: doc.patientId,
    type: doc.type,
    content: doc.content,
    createdByAccountId: doc.createdByAccountId,
    createdByName: doc.createdByName,
    editedAt: doc.editedAt,
    archivedAt: doc.archivedAt,
    archivedByAccountId: doc.archivedByAccountId,
    status: doc.status,
    appointmentId: doc.appointmentId,
    signedAt: doc.signedAt,
    signedByAccountId: doc.signedByAccountId,
    deliveredAt: doc.deliveredAt,
    deliveredTo: doc.deliveredTo,
    deliveredVia: doc.deliveredVia,
  };
}

export function createPrismaDocumentRepository(): PracticeDocumentRepository {
  return {
    async save(doc: PracticeDocument): Promise<PracticeDocument> {
      const data = mapToPrisma(doc);
      const d = await db.practiceDocument.upsert({
        where: { id: doc.id },
        update: data,
        create: { id: doc.id, ...data },
      });
      return mapToDomain(d);
    },

    async findById(id: string, workspaceId: string): Promise<PracticeDocument | null> {
      const d = await db.practiceDocument.findFirst({ where: { id, workspaceId } });
      return d ? mapToDomain(d) : null;
    },

    async listByPatient(patientId: string, workspaceId: string): Promise<PracticeDocument[]> {
      const docs = await db.practiceDocument.findMany({
        where: { patientId, workspaceId },
        orderBy: { createdAt: "desc" },
      });
      return docs.map(mapToDomain);
    },

    async listActiveByPatient(patientId: string, workspaceId: string): Promise<PracticeDocument[]> {
      const docs = await db.practiceDocument.findMany({
        where: { patientId, workspaceId, archivedAt: null },
        orderBy: { createdAt: "desc" },
      });
      return docs.map(mapToDomain);
    },

    async listByStatus(
      workspaceId: string,
      patientId: string,
      status: DocumentStatus,
    ): Promise<PracticeDocument[]> {
      const docs = await db.practiceDocument.findMany({
        where: { workspaceId, patientId, status },
        orderBy: { createdAt: "desc" },
      });
      return docs.map(mapToDomain);
    },

    async listDraftsByPatient(patientId: string, workspaceId: string): Promise<PracticeDocument[]> {
      const docs = await db.practiceDocument.findMany({
        where: { workspaceId, patientId, status: "draft" },
        orderBy: { createdAt: "desc" },
      });
      return docs.map(mapToDomain);
    },

    async findByAppointmentId(
      workspaceId: string,
      appointmentId: string,
    ): Promise<PracticeDocument[]> {
      const docs = await db.practiceDocument.findMany({
        where: { workspaceId, appointmentId },
        orderBy: { createdAt: "desc" },
      });
      return docs.map(mapToDomain);
    },
  };
}
