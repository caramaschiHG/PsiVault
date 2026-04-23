import { createPrismaMetricsRepository } from "./repository.prisma";
import type { MetricsRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultMetricsRepo__: MetricsRepository | undefined;
}

export function getMetricsRepository(): MetricsRepository {
  return (
    globalThis.__psivaultMetricsRepo__ ?? createPrismaMetricsRepository()
  );
}

globalThis.__psivaultMetricsRepo__ = getMetricsRepository();
