import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "@/components/streaming/page-header-skeleton";
import { SectionSkeleton } from "@/components/streaming/section-skeleton";
import { StatCardSkeleton } from "@/components/streaming/stat-card-skeleton";

export default function Loading() {
  return (
    <main style={{ padding: "var(--space-page-padding-y) var(--space-page-padding-x)", maxWidth: 960, width: "100%", display: "grid", gap: "var(--space-6)", alignContent: "start" }}>
      <PageHeaderSkeleton />
      <SectionSkeleton />
      <SectionSkeleton />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-3)" }}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <SectionSkeleton />
    </main>
  );
}
