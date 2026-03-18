import { createPrismaFinanceRepository } from "./repository.prisma";
import type { SessionChargeRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultFinance__: SessionChargeRepository | undefined;
}

export function getFinanceRepository(): SessionChargeRepository {
  globalThis.__psivaultFinance__ ??= createPrismaFinanceRepository();
  return globalThis.__psivaultFinance__;
}
