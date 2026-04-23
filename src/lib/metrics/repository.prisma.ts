import { db } from "../db";
import type { PerformanceMetric, P75Metric } from "./model";
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
    async getP75ByPagePath(days: number): Promise<P75Metric[]> {
      const start = new Date(Date.now() - days * 86400000);
      const result = await db.$queryRaw<P75Metric[]>`
        SELECT
          page_path as "pagePath",
          metric_name as "metricName",
          percentile_cont(0.75) WITHIN GROUP (ORDER BY value) as p75
        FROM performance_metrics
        WHERE created_at >= ${start}
        GROUP BY page_path, metric_name
        ORDER BY page_path, metric_name
      `;
      return result;
    },
    async cleanupOldMetrics(retentionDays: number): Promise<number> {
      const cutoff = new Date(Date.now() - retentionDays * 86400000);
      const result = await db.performanceMetric.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      return result.count;
    },
  };
}
