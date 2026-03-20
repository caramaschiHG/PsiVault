import { createPrismaNotificationJobRepository } from "./repository.prisma";
import type { NotificationJobRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultNotificationJobs__: NotificationJobRepository | undefined;
}

export function getNotificationJobRepository(): NotificationJobRepository {
  globalThis.__psivaultNotificationJobs__ ??= createPrismaNotificationJobRepository();
  return globalThis.__psivaultNotificationJobs__;
}
