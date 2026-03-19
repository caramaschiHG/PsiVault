"use server";

import { redirect } from "next/navigation";
import { createClinicalNote, updateClinicalNote } from "../../../../lib/clinical/model";
import { getClinicalNoteRepository } from "../../../../lib/clinical/store";
import { getAppointmentRepository } from "../../../../lib/appointments/store";
import { createClinicalNoteAuditEvent } from "../../../../lib/clinical/audit";
import { getAuditRepository } from "../../../../lib/audit/store";
import { resolveSession } from "../../../../lib/supabase/session";

function generateId() {
  const buffer = new Uint8Array(9);
  globalThis.crypto.getRandomValues(buffer);
  return "note_" + Array.from(buffer, (v) => v.toString(16).padStart(2, "0")).join("");
}

// ─── Null coercion helper ──────────────────────────────────────────────────────

/**
 * Converts a FormData entry to string | null.
 * Empty strings (blank textareas) are treated as "not filled" → null.
 * Security: clinical content must never leak into audit metadata (SECU-05).
 */
function nullCoerce(value: FormDataEntryValue | null): string | null {
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
}

// ─── Create note action ────────────────────────────────────────────────────────

export async function createNoteAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const appointmentRepo = getAppointmentRepository();
  const clinicalRepo = getClinicalNoteRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  const freeText = String(formData.get("freeText") ?? "").trim();
  const demand = nullCoerce(formData.get("demand"));
  const observedMood = nullCoerce(formData.get("observedMood"));
  const themes = nullCoerce(formData.get("themes"));
  const clinicalEvolution = nullCoerce(formData.get("clinicalEvolution"));
  const nextSteps = nullCoerce(formData.get("nextSteps"));

  let redirectPath: string | null = null;

  try {
    // Guard: appointment must exist and be COMPLETED
    const appointment = await appointmentRepo.findById(appointmentId, workspaceId);
    if (!appointment || appointment.status !== "COMPLETED") return;

    // Guard: do not create duplicate — if note exists, redirect to patient profile
    const existingNote = await clinicalRepo.findByAppointmentId(appointmentId, workspaceId);
    if (existingNote) {
      redirectPath = `/patients/${patientId}`;
    } else {
      const note = createClinicalNote(
        {
          workspaceId: workspaceId,
          patientId,
          appointmentId,
          freeText,
          demand,
          observedMood,
          themes,
          clinicalEvolution,
          nextSteps,
        },
        { now, createId: generateId },
      );

      await clinicalRepo.save(note);

      audit.append(
        createClinicalNoteAuditEvent(
          {
            type: "clinical.note.created",
            note,
            actor: { accountId: accountId, workspaceId: workspaceId },
          },
          { now, createId: generateId },
        ),
      );

      redirectPath = `/patients/${patientId}`;
    }
  } catch (err) {
    console.error("[createNoteAction]", err);
    return;
  }

  if (redirectPath) redirect(redirectPath);
}

// ─── Update note action ────────────────────────────────────────────────────────

export async function updateNoteAction(formData: FormData): Promise<void> {
  const { accountId, workspaceId } = await resolveSession();
  const clinicalRepo = getClinicalNoteRepository();
  const audit = getAuditRepository();
  const now = new Date();

  const noteId = String(formData.get("noteId") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  const freeText = String(formData.get("freeText") ?? "").trim();
  const demand = nullCoerce(formData.get("demand"));
  const observedMood = nullCoerce(formData.get("observedMood"));
  const themes = nullCoerce(formData.get("themes"));
  const clinicalEvolution = nullCoerce(formData.get("clinicalEvolution"));
  const nextSteps = nullCoerce(formData.get("nextSteps"));

  let shouldRedirect = false;

  try {
    // Guard: note must exist
    const existingNote = await clinicalRepo.findById(noteId, workspaceId);
    if (!existingNote) return;

    const updatedNote = updateClinicalNote(
      existingNote,
      {
        freeText,
        demand,
        observedMood,
        themes,
        clinicalEvolution,
        nextSteps,
      },
      { now },
    );

    await clinicalRepo.save(updatedNote);

    audit.append(
      createClinicalNoteAuditEvent(
        {
          type: "clinical.note.updated",
          note: updatedNote,
          actor: { accountId: accountId, workspaceId: workspaceId },
        },
        { now, createId: generateId },
      ),
    );

    shouldRedirect = true;
  } catch (err) {
    console.error("[updateNoteAction]", err);
    return;
  }

  if (shouldRedirect) redirect(`/patients/${patientId}`);
}
