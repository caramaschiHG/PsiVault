import { db } from "../db";
import type { ClinicalNote } from "./model";
import type { ClinicalNoteRepository } from "./repository";
import type { ClinicalNote as PrismaClinicalNote } from "@prisma/client";

function mapToDomain(n: PrismaClinicalNote): ClinicalNote {
  return {
    id: n.id,
    workspaceId: n.workspaceId,
    patientId: n.patientId,
    appointmentId: n.appointmentId,
    freeText: n.freeText,
    demand: n.demand,
    observedMood: n.observedMood,
    themes: n.themes,
    clinicalEvolution: n.clinicalEvolution,
    nextSteps: n.nextSteps,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    editedAt: n.editedAt,
  };
}

export function createPrismaClinicalRepository(): ClinicalNoteRepository {
  return {
    async save(note: ClinicalNote): Promise<ClinicalNote> {
      const data = {
        workspaceId: note.workspaceId,
        patientId: note.patientId,
        appointmentId: note.appointmentId,
        freeText: note.freeText,
        demand: note.demand,
        observedMood: note.observedMood,
        themes: note.themes,
        clinicalEvolution: note.clinicalEvolution,
        nextSteps: note.nextSteps,
        editedAt: note.editedAt,
      };
      const n = await db.clinicalNote.upsert({
        where: { id: note.id },
        update: data,
        create: { id: note.id, ...data },
      });
      return mapToDomain(n);
    },

    async findById(id: string, workspaceId: string): Promise<ClinicalNote | null> {
      const n = await db.clinicalNote.findFirst({ where: { id, workspaceId } });
      return n ? mapToDomain(n) : null;
    },

    async findByAppointmentId(appointmentId: string, workspaceId: string): Promise<ClinicalNote | null> {
      const n = await db.clinicalNote.findFirst({ where: { appointmentId, workspaceId } });
      return n ? mapToDomain(n) : null;
    },

    async listByPatient(patientId: string, workspaceId: string): Promise<ClinicalNote[]> {
      const notes = await db.clinicalNote.findMany({
        where: { patientId, workspaceId },
        orderBy: { createdAt: "desc" },
      });
      return notes.map(mapToDomain);
    },
  };
}
