/**
 * Module-level in-memory patient store.
 *
 * Mirrors the Phase 1 profile store pattern so the patient repository
 * is available across server actions without requiring a DB connection
 * in this phase.
 */

import { createInMemoryPatientRepository } from "./repository";
import type { PatientRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultPatientRepository__: PatientRepository | undefined;
}

export function getPatientRepository(): PatientRepository {
  globalThis.__psivaultPatientRepository__ ??= createInMemoryPatientRepository();
  return globalThis.__psivaultPatientRepository__;
}
