/**
 * Module-level patient store.
 *
 * Provides access to the Prisma patient repository.
 */

import { createPrismaPatientRepository } from "./repository.prisma";
import type { PatientRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultPatientRepository__: PatientRepository | undefined;
}

export function getPatientRepository(): PatientRepository {
  globalThis.__psivaultPatientRepository__ ??= createPrismaPatientRepository();
  return globalThis.__psivaultPatientRepository__;
}
