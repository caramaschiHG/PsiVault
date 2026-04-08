import { Skeleton } from "@/components/ui/skeleton";

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

export default function Loading() {
  return (
    <main style={shellStyle}>
      <div
        style={{
          padding: "1.75rem 2rem",
          borderRadius: "var(--radius-xl)",
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-border)",
          display: "grid",
          gap: "0.5rem",
        }}
      >
        <Skeleton height="0.7rem" width="8rem" delay={0} />
        <Skeleton height="2rem" width="14rem" delay={50} />
      </div>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} height="72px" borderRadius="var(--radius-lg)" delay={i * 100 + 100} />
      ))}
    </main>
  );
}
