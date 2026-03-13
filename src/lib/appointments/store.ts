/**
 * Module-level in-memory appointment store.
 *
 * Mirrors the Phase 1 profile and patient store pattern so the appointment
 * repository is available across server actions without requiring a DB
 * connection in this phase.
 */

import { createInMemoryAppointmentRepository } from "./repository";
import type { AppointmentRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultAppointmentRepository__: AppointmentRepository | undefined;
}

export function getAppointmentRepository(): AppointmentRepository {
  globalThis.__psivaultAppointmentRepository__ ??= createInMemoryAppointmentRepository();
  return globalThis.__psivaultAppointmentRepository__;
}
