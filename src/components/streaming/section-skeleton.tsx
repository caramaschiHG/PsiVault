import { Skeleton } from "@/components/ui/skeleton";

const sectionCardStyle = {
  padding: "var(--space-6)",
  borderRadius: "var(--radius-xl)",
  background: "var(--surface-base)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-sm)",
  display: "grid",
  gap: "var(--space-4)",
  alignContent: "start",
} satisfies React.CSSProperties;

const sectionHeadingStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-3)",
} satisfies React.CSSProperties;

export function SectionSkeleton() {
  return (
    <div style={sectionCardStyle}>
      <div style={sectionHeadingStyle}>
        <Skeleton width="120px" height="var(--font-size-h2)" />
        <Skeleton width="80px" height="var(--font-size-sm)" />
      </div>
      <Skeleton height="60px" borderRadius="var(--radius-md)" />
      <Skeleton height="60px" borderRadius="var(--radius-md)" delay={80} />
      <Skeleton height="60px" borderRadius="var(--radius-md)" delay={160} />
    </div>
  );
}
