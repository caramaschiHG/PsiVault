import { Skeleton } from "@/components/ui/skeleton";

const cardStyle = {
  padding: "var(--space-4) var(--space-6)",
  borderRadius: "var(--radius-lg)",
  background: "var(--surface-raised)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-sm)",
  display: "grid",
  gap: "var(--space-1)",
  textDecoration: "none",
} satisfies React.CSSProperties;

export function StatCardSkeleton() {
  return (
    <div style={cardStyle}>
      <Skeleton width="80px" height="var(--font-size-sm)" />
      <Skeleton width="60px" height="var(--font-size-display)" />
    </div>
  );
}
