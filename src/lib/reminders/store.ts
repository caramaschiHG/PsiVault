/**
 * Module-level in-memory reminder store.
 *
 * Mirrors the finance/patient/appointment store pattern so the
 * reminder repository is available across server actions without
 * requiring a DB connection in this phase.
 */

import { createInMemoryReminderRepository } from "./repository";
import type { ReminderRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultReminders__: ReminderRepository | undefined;
}

export function getReminderRepository(): ReminderRepository {
  globalThis.__psivaultReminders__ ??= createInMemoryReminderRepository();
  return globalThis.__psivaultReminders__;
}
