import { createPrismaReminderRepository } from "./repository.prisma";
import type { ReminderRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultReminders__: ReminderRepository | undefined;
}

export function getReminderRepository(): ReminderRepository {
  globalThis.__psivaultReminders__ ??= createPrismaReminderRepository();
  return globalThis.__psivaultReminders__;
}
