/**
 * Module-level in-memory finance store.
 *
 * Mirrors the document/patient/appointment store pattern so the
 * session charge repository is available across server actions
 * without requiring a DB connection in this phase.
 */

import { createInMemorySessionChargeRepository } from "./repository";
import type { SessionChargeRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultFinance__: SessionChargeRepository | undefined;
}

export function getFinanceRepository(): SessionChargeRepository {
  globalThis.__psivaultFinance__ ??= createInMemorySessionChargeRepository();
  return globalThis.__psivaultFinance__;
}
