import type { CSSProperties } from "react";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: number;
}

const baseStyle = {
  padding: "var(--space-page-padding-y) var(--space-page-padding-x)",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "var(--space-inline-xl)",
  alignContent: "start",
} satisfies CSSProperties;

export function PageShell({ children, className, maxWidth = 960 }: PageShellProps) {
  return (
    <main
      className={className}
      style={{ ...baseStyle, maxWidth } satisfies CSSProperties}
    >
      {children}
    </main>
  );
}
