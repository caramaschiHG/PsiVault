/**
 * Module-level in-memory document store.
 *
 * Mirrors the Phase 1 profile/patient/appointment/clinical store pattern so the
 * document repository is available across server actions without requiring a DB
 * connection in this phase.
 */

import { createInMemoryDocumentRepository } from "./repository";
import type { PracticeDocumentRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultDocumentRepository__: PracticeDocumentRepository | undefined;
}

export function getDocumentRepository(): PracticeDocumentRepository {
  globalThis.__psivaultDocumentRepository__ ??= createInMemoryDocumentRepository();
  return globalThis.__psivaultDocumentRepository__;
}
