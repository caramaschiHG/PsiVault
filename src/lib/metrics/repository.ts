import type { PerformanceMetric } from "./model";

export interface MetricsRepository {
  save(metric: PerformanceMetric): Promise<PerformanceMetric>;
}
