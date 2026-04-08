import { Skeleton } from "@/components/ui/skeleton";

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "2rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const sectionSkeletonStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const hrSkeletonStyle = {
  height: "1px",
  background: "var(--color-border)",
  border: "none",
} satisfies React.CSSProperties;

const entrySkeletonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.75rem 0",
  borderBottom: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

export default function Loading() {
  return (
    <main style={shellStyle}>
      {/* Breadcrumb skeleton */}
      <Skeleton height="0.75rem" width="10rem" delay={0} />

      {/* Header skeleton */}
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <Skeleton height="2.25rem" width="16rem" delay={50} />
        <Skeleton height="0.75rem" width="7rem" delay={100} />
      </div>

      {/* Timeline section skeleton */}
      <div style={sectionSkeletonStyle}>
        <Skeleton height="1rem" width="12rem" delay={150} />
        <div style={hrSkeletonStyle} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={entrySkeletonStyle}>
            <Skeleton height="0.75rem" width="8rem" delay={i * 80 + 200} />
            <Skeleton height="0.75rem" width="5rem" delay={i * 80 + 240} />
          </div>
        ))}
      </div>

      {/* Documents section skeleton */}
      <div style={sectionSkeletonStyle}>
        <Skeleton height="1rem" width="9rem" delay={500} />
        <div style={hrSkeletonStyle} />
        <Skeleton height="0.75rem" width="18rem" delay={550} />
      </div>
    </main>
  );
}
