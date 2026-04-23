export interface PerformanceMetric {
  id: string;
  metricName: string;
  value: number;
  rating: string | null;
  pagePath: string;
  workspaceId: string | null;
  sessionId: string | null;
  createdAt: Date;
}

export interface P75Metric {
  pagePath: string;
  metricName: string;
  p75: number;
}
