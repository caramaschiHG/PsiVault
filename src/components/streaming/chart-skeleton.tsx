import { Skeleton } from "@/components/ui/skeleton";

const trendCardStyle = {
  padding: "1.25rem 1.5rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const chartContainerStyle = {
  position: "relative",
  display: "flex",
  alignItems: "flex-end",
  gap: "0.75rem",
  height: "120px",
} satisfies React.CSSProperties;

const barWrapperStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.375rem",
  height: "100%",
  justifyContent: "flex-end",
} satisfies React.CSSProperties;

const barStyle = {
  width: "100%",
  maxWidth: "60px",
  background: "var(--color-accent)",
  borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
  minHeight: "4px",
} satisfies React.CSSProperties;

interface ChartSkeletonProps {
  height?: number;
  barCount?: number;
}

const DEFAULT_HEIGHTS = ["30%", "55%", "40%", "80%", "60%", "45%"];

export function ChartSkeleton({ height = 120, barCount = 6 }: ChartSkeletonProps) {
  const heights = DEFAULT_HEIGHTS.slice(0, barCount);
  while (heights.length < barCount) {
    heights.push(DEFAULT_HEIGHTS[heights.length % DEFAULT_HEIGHTS.length]);
  }

  return (
    <div style={trendCardStyle}>
      <Skeleton width="100px" height="16px" />
      <div style={{ ...chartContainerStyle, height: `${height}px` }}>
        {heights.map((h, i) => (
          <div key={i} style={barWrapperStyle}>
            <Skeleton
              style={{
                ...barStyle,
                height: h,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
