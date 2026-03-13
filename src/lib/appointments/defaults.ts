/**
 * Quick next-session defaults initializer.
 *
 * Shared contract consumed by:
 * - Patient profile quick-action (patient-context entry point)
 * - Completed-appointment action in agenda surfaces (post-session entry point)
 *
 * Precedence:
 * 1. Latest relevant appointment values for the patient
 * 2. Practice profile defaults from Phase 1
 *
 * Date and time are intentionally NOT prefilled — the professional must
 * choose the new slot explicitly to avoid silent scheduling assumptions.
 */

import type { AppointmentCareMode } from "./model";

export interface PracticeProfileDefaults {
  /** Default session duration in minutes from practice profile. */
  defaultDurationMinutes: number;
  /** Default session price in cents from practice profile. */
  defaultPriceInCents: number | null;
  /** Preferred care mode from practice profile (HYBRID maps to IN_PERSON). */
  defaultCareMode: AppointmentCareMode;
}

export interface LastAppointmentContext {
  /** Duration used in the most recent relevant appointment. */
  durationMinutes: number;
  /** Care mode used in the most recent relevant appointment. */
  careMode: AppointmentCareMode;
  /** Price in cents charged in the most recent relevant appointment. */
  priceInCents: number | null;
}

export interface NextSessionDefaultsInput {
  /** The patient the next session will be for. */
  patientId: string;
  /**
   * Most recent completed or scheduled appointment for this patient.
   * When provided, its values take precedence over practice profile defaults.
   */
  lastAppointment?: LastAppointmentContext | null;
  /** Practice profile defaults — fallback when no last appointment exists. */
  profileDefaults: PracticeProfileDefaults;
}

export interface NextSessionDefaults {
  patientId: string;
  /** Duration in minutes — never null; always has a value. */
  durationMinutes: number;
  /** Care mode — never null; always has a value. */
  careMode: AppointmentCareMode;
  /** Price in cents — null when neither last appointment nor profile has a value. */
  priceInCents: number | null;
  // Note: startsAt is intentionally absent — the professional picks the new slot.
}

/**
 * Derive the prefill defaults for a quick next-session creation.
 *
 * Uses the most recent appointment values as the primary source, falling
 * back to practice profile defaults for any missing field. Date and time
 * are never included — the professional must choose the new slot explicitly.
 */
export function deriveNextSessionDefaults(
  input: NextSessionDefaultsInput,
): NextSessionDefaults {
  const last = input.lastAppointment;
  const profile = input.profileDefaults;

  return {
    patientId: input.patientId,
    durationMinutes: last?.durationMinutes ?? profile.defaultDurationMinutes,
    careMode: last?.careMode ?? profile.defaultCareMode,
    priceInCents: last?.priceInCents ?? profile.defaultPriceInCents,
  };
}
