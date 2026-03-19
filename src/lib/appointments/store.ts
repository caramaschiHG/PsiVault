/**
 * Module-level appointment store.
 *
 * Provides access to the Prisma appointment repository.
 */

import { createPrismaAppointmentRepository } from "./repository.prisma";
import type { AppointmentRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultAppointmentRepository__: AppointmentRepository | undefined;
}

export function getAppointmentRepository(): AppointmentRepository {
  globalThis.__psivaultAppointmentRepository__ ??= createPrismaAppointmentRepository();
  return globalThis.__psivaultAppointmentRepository__;
}
