"use server";

import { redirect } from "next/navigation";
import { createClinicalNote, updateClinicalNote } from "../../../../lib/clinical/model";
import { getClinicalNoteRepository } from "../../../../lib/clinical/store";
import { getAppointmentRepository } from "../../../../lib/appointments/store";
import { createClinicalNoteAuditEvent } from "../../../../lib/clinical/audit";
import { getAuditRepository } from "../../../../lib/audit/store";

// ─── Stub identity (real resolution comes from session in production) ──────────

const DEFAULT_WORKSPACE_ID = "ws_1";
const DEFAULT_ACCOUNT_ID = "acct_1";

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

export async function createNoteAction(formData: FormData) {
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
    const appointment = await appointmentRepo.findById(appointmentId, DEFAULT_WORKSPACE_ID);
    if (!appointment || appointment.status !== "COMPLETED") return;

    // Guard: do not create duplicate — if note exists, redirect to patient profile
    const existingNote = await clinicalRepo.findByAppointmentId(appointmentId, DEFAULT_WORKSPACE_ID);
    if (existingNote) {
      redirectPath = `/patients/${patientId}`;
    } else {
      const note = createClinicalNote(
        {
          workspaceId: DEFAULT_WORKSPACE_ID,
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
            actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
          },
          { now, createId: generateId },
        ),
      );

      redirectPath = `/patients/${patientId}`;
    }
  } catch (err) {
    console.error("[createNoteAction]", err);
    return { ok: false, error: "Algo deu errado. Tente novamente." };
  }

  if (redirectPath) redirect(redirectPath);
}

// ─── Update note action ────────────────────────────────────────────────────────

export async function updateNoteAction(formData: FormData) {
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
    const existingNote = await clinicalRepo.findById(noteId, DEFAULT_WORKSPACE_ID);
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
          actor: { accountId: DEFAULT_ACCOUNT_ID, workspaceId: DEFAULT_WORKSPACE_ID },
        },
        { now, createId: generateId },
      ),
    );

    shouldRedirect = true;
  } catch (err) {
    console.error("[updateNoteAction]", err);
    return { ok: false, error: "Algo deu errado. Tente novamente." };
  }

  if (shouldRedirect) redirect(`/patients/${patientId}`);
}
