/**
 * Module-level in-memory clinical note store.
 *
 * Mirrors the Phase 1 profile/patient/appointment store pattern so the
 * clinical note repository is available across server actions without
 * requiring a DB connection in this phase.
 */

import { createInMemoryClinicalRepository } from "./repository";
import type { ClinicalNoteRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultClinicalNoteRepository__: ClinicalNoteRepository | undefined;
}

export function getClinicalNoteRepository(): ClinicalNoteRepository {
  globalThis.__psivaultClinicalNoteRepository__ ??= createInMemoryClinicalRepository();
  return globalThis.__psivaultClinicalNoteRepository__;
}
