import type { CSSProperties } from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  borderRadius = "var(--radius-sm)",
  className = "",
  style,
  delay = 0,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        animationDelay: `${delay}ms`,
        ...style,
      }}
    />
  );
}
