/**
 * Clinical note aggregate — workspace-scoped canonical shape.
 *
 * Security policy (SECU-05):
 * - Clinical content (freeText and all structured fields) must NEVER appear
 *   in audit metadata, logs, or any non-clinical surface.
 *
 * Session number derivation:
 * - deriveSessionNumber counts only COMPLETED appointments sorted by startsAt
 *   ascending and returns the 1-based position of the target appointment.
 *   Returns null if the target is not among the COMPLETED appointments.
 */

export interface ClinicalNote {
  id: string;
  workspaceId: string;
  patientId: string;
  appointmentId: string;

  // Free-form narrative (always present)
  freeText: string;

  // Optional structured fields — null when not filled
  demand: string | null;
  observedMood: string | null;
  themes: string | null;
  clinicalEvolution: string | null;
  nextSteps: string | null;

  // Lifecycle timestamps
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null; // null on first creation, set on every subsequent update
}

export interface CreateClinicalNoteInput {
  workspaceId: string;
  patientId: string;
  appointmentId: string;
  freeText: string;
  demand?: string | null;
  observedMood?: string | null;
  themes?: string | null;
  clinicalEvolution?: string | null;
  nextSteps?: string | null;
}

interface CreateClinicalNoteDeps {
  now: Date;
  createId: () => string;
}

export function createClinicalNote(
  input: CreateClinicalNoteInput,
  deps: CreateClinicalNoteDeps,
): ClinicalNote {
  return {
    id: deps.createId(),
    workspaceId: input.workspaceId,
    patientId: input.patientId,
    appointmentId: input.appointmentId,
    freeText: input.freeText,
    demand: input.demand ?? null,
    observedMood: input.observedMood ?? null,
    themes: input.themes ?? null,
    clinicalEvolution: input.clinicalEvolution ?? null,
    nextSteps: input.nextSteps ?? null,
    createdAt: deps.now,
    updatedAt: deps.now,
    editedAt: null,
  };
}

export interface UpdateClinicalNoteInput {
  freeText?: string;
  demand?: string | null;
  observedMood?: string | null;
  themes?: string | null;
  clinicalEvolution?: string | null;
  nextSteps?: string | null;
}

interface UpdateClinicalNoteDeps {
  now: Date;
}

export function updateClinicalNote(
  existing: ClinicalNote,
  updates: UpdateClinicalNoteInput,
  deps: UpdateClinicalNoteDeps,
): ClinicalNote {
  return {
    ...existing,
    ...updates,
    updatedAt: deps.now,
    editedAt: deps.now,
  };
}

export interface AppointmentForSessionNumber {
  id: string;
  startsAt: Date;
  status: string;
}

/**
 * Returns the 1-based session number of targetAppointmentId among all
 * COMPLETED appointments sorted by startsAt ascending.
 *
 * Returns null if the target appointment is not in the COMPLETED list.
 */
export function deriveSessionNumber(
  targetAppointmentId: string,
  allPatientAppointments: AppointmentForSessionNumber[],
): number | null {
  const completed = allPatientAppointments
    .filter((a) => a.status === "COMPLETED")
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const index = completed.findIndex((a) => a.id === targetAppointmentId);

  if (index === -1) return null;

  return index + 1;
}
