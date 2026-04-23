import type { PerformanceMetric, P75Metric } from "./model";

export interface MetricsRepository {
  save(metric: PerformanceMetric): Promise<PerformanceMetric>;
  getP75ByPagePath(days: number): Promise<P75Metric[]>;
  cleanupOldMetrics(retentionDays: number): Promise<number>;
}
