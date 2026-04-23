import { Skeleton } from "@/components/ui/skeleton";

const blockStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

export function PageHeaderSkeleton() {
  return (
    <div style={blockStyle}>
      <Skeleton width="100px" height="0.7rem" />
      <Skeleton width="200px" height="var(--font-size-page-title)" />
    </div>
  );
}
