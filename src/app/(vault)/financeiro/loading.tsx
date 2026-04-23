import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/streaming/page-header-skeleton";
import { StatCardSkeleton } from "@/components/streaming/stat-card-skeleton";
import { ChartSkeleton } from "@/components/streaming/chart-skeleton";
import { SectionSkeleton } from "@/components/streaming/section-skeleton";

export default function Loading() {
  return (
    <main style={{ padding: "2rem 2.5rem", maxWidth: 960, width: "100%", display: "grid", gap: "1.25rem", alignContent: "start" }}>
      <PageHeaderSkeleton />
      <Skeleton height="50px" borderRadius="var(--radius-md)" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <ChartSkeleton height={120} barCount={6} />
      <Skeleton height="50px" borderRadius="var(--radius-md)" />
      <div style={{ display: "grid", gap: "1rem" }}>
        {[0, 1, 2, 3, 4].map(i => (
          <Skeleton key={i} height="60px" borderRadius="var(--radius-md)" delay={i * 80} />
        ))}
      </div>
      <SectionSkeleton />
      <SectionSkeleton />
    </main>
  );
}
