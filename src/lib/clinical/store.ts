import { createPrismaClinicalRepository } from "./repository.prisma";
import type { ClinicalNoteRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultClinicalNoteRepository__: ClinicalNoteRepository | undefined;
}

export function getClinicalNoteRepository(): ClinicalNoteRepository {
  globalThis.__psivaultClinicalNoteRepository__ ??= createPrismaClinicalRepository();
  return globalThis.__psivaultClinicalNoteRepository__;
}
