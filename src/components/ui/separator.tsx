import type { CSSProperties } from "react";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
  style?: CSSProperties;
}

const baseStyle: CSSProperties = {
  border: "none",
};

const horizontalStyle: CSSProperties = {
  ...baseStyle,
  height: "1px",
  backgroundColor: "var(--color-border)",
  width: "100%",
};

const verticalStyle: CSSProperties = {
  ...baseStyle,
  width: "1px",
  backgroundColor: "var(--color-border)",
  height: "100%",
  alignSelf: "stretch",
};

export function Separator({
  orientation = "horizontal",
  className,
  style,
}: SeparatorProps) {
  return (
    <hr
      className={className}
      style={{ ...(orientation === "horizontal" ? horizontalStyle : verticalStyle), ...style }}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
