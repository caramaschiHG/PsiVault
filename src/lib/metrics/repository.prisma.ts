import { db } from "../db";
import type { PerformanceMetric } from "./model";
import type { MetricsRepository } from "./repository";

export function createPrismaMetricsRepository(): MetricsRepository {
  return {
    async save(metric: PerformanceMetric): Promise<PerformanceMetric> {
      await db.performanceMetric.create({
        data: {
          id: metric.id,
          metricName: metric.metricName,
          value: metric.value,
          rating: metric.rating,
          pagePath: metric.pagePath,
          workspaceId: metric.workspaceId,
          sessionId: metric.sessionId,
          createdAt: metric.createdAt,
        },
      });
      return metric;
    },
  };
}
