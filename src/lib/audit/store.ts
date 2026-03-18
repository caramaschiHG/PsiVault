import { createPrismaAuditRepository } from "./repository.prisma";
import type { AuditEventRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultAudit__: AuditEventRepository | undefined;
}

export function getAuditRepository(): AuditEventRepository {
  globalThis.__psivaultAudit__ ??= createPrismaAuditRepository();
  return globalThis.__psivaultAudit__;
}
