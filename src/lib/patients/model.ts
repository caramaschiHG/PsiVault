/**
 * Patient aggregate — workspace-scoped canonical shape.
 *
 * Optional fields policy:
 * - socialName, guardianName, guardianPhone, emergencyContactName,
 *   emergencyContactPhone, importantObservations are null when not supplied.
 * - email and phone are optional: many referrals arrive without contact data.
 *
 * Archive semantics:
 * - Archiving sets archivedAt + archivedByAccountId; it does NOT delete.
 * - Active vs archived distinction is enforced at the repository layer.
 * - Recovery clears both archive fields, restoring the patient to active flows.
 */

export interface Patient {
  id: string;
  workspaceId: string;

  // Core identity
  fullName: string;
  socialName: string | null;

  // Contact (optional)
  email: string | null;
  phone: string | null;

  // Reminders (AGEND-02)
  reminderPhone: string | null;
  preferredReminderTime: number | null;

  // Finance — session price override (falls back to PracticeProfile.defaultSessionPriceInCents)
  sessionPriceInCents: number | null;

  // Guardian (optional — minor patients or caregiver contexts)
  guardianName: string | null;
  guardianPhone: string | null;

  // Emergency contact (optional)
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;

  // Important observations — profile-only, must not leak to lists or agenda
  importantObservations: string | null;

  // Soft archive metadata
  archivedAt: Date | null;
  archivedByAccountId: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientInput {
  workspaceId: string;
  fullName: string;
  socialName?: string | null;
  email?: string | null;
  phone?: string | null;
  reminderPhone?: string | null;
  preferredReminderTime?: number | null;
  sessionPriceInCents?: number | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  importantObservations?: string | null;
}

interface CreatePatientDeps {
  now: Date;
  createId: () => string;
}

function trimOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requireTrim(value: string): string {
  return value.trim();
}

export function createPatient(input: CreatePatientInput, deps: CreatePatientDeps): Patient {
  return {
    id: deps.createId(),
    workspaceId: input.workspaceId,
    fullName: requireTrim(input.fullName),
    socialName: trimOrNull(input.socialName),
    email: trimOrNull(input.email),
    phone: trimOrNull(input.phone),
    reminderPhone: trimOrNull(input.reminderPhone),
    preferredReminderTime: input.preferredReminderTime ?? null,
    sessionPriceInCents: input.sessionPriceInCents ?? null,
    guardianName: trimOrNull(input.guardianName),
    guardianPhone: trimOrNull(input.guardianPhone),
    emergencyContactName: trimOrNull(input.emergencyContactName),
    emergencyContactPhone: trimOrNull(input.emergencyContactPhone),
    importantObservations: trimOrNull(input.importantObservations),
    archivedAt: null,
    archivedByAccountId: null,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
}

export interface ArchivePatientDeps {
  now: Date;
  archivedByAccountId: string;
}

export function archivePatient(patient: Patient, deps: ArchivePatientDeps): Patient {
  return {
    ...patient,
    archivedAt: deps.now,
    archivedByAccountId: deps.archivedByAccountId,
    updatedAt: deps.now,
  };
}

export interface RecoverPatientDeps {
  now: Date;
}

export function recoverPatient(patient: Patient, deps: RecoverPatientDeps): Patient {
  return {
    ...patient,
    archivedAt: null,
    archivedByAccountId: null,
    updatedAt: deps.now,
  };
}

export function updatePatient(
  patient: Patient,
  input: Partial<Omit<CreatePatientInput, "workspaceId">>,
  deps: { now: Date },
): Patient {
  return {
    ...patient,
    fullName: input.fullName !== undefined ? requireTrim(input.fullName) : patient.fullName,
    socialName: input.socialName !== undefined ? trimOrNull(input.socialName) : patient.socialName,
    email: input.email !== undefined ? trimOrNull(input.email) : patient.email,
    phone: input.phone !== undefined ? trimOrNull(input.phone) : patient.phone,
    reminderPhone: input.reminderPhone !== undefined ? trimOrNull(input.reminderPhone) : patient.reminderPhone,
    preferredReminderTime:
      input.preferredReminderTime !== undefined ? input.preferredReminderTime : patient.preferredReminderTime,
    sessionPriceInCents:
      input.sessionPriceInCents !== undefined ? input.sessionPriceInCents : patient.sessionPriceInCents,
    guardianName: input.guardianName !== undefined ? trimOrNull(input.guardianName) : patient.guardianName,
    guardianPhone: input.guardianPhone !== undefined ? trimOrNull(input.guardianPhone) : patient.guardianPhone,
    emergencyContactName:
      input.emergencyContactName !== undefined
        ? trimOrNull(input.emergencyContactName)
        : patient.emergencyContactName,
    emergencyContactPhone:
      input.emergencyContactPhone !== undefined
        ? trimOrNull(input.emergencyContactPhone)
        : patient.emergencyContactPhone,
    importantObservations:
      input.importantObservations !== undefined
        ? trimOrNull(input.importantObservations)
        : patient.importantObservations,
    updatedAt: deps.now,
  };
}

/**
 * Resolve the effective session price for a patient.
 * Falls back to the PracticeProfile default when the patient has no override.
 */
export function resolveSessionPrice(
  patient: { sessionPriceInCents: number | null },
  practiceProfile: { defaultSessionPriceInCents: number | null } | null,
): number | null {
  if (patient.sessionPriceInCents != null) return patient.sessionPriceInCents;
  if (practiceProfile?.defaultSessionPriceInCents != null)
    return practiceProfile.defaultSessionPriceInCents;
  return null;
}
