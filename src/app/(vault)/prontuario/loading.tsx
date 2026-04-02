export default function Loading() {
  return (
    <main style={shellStyle}>
      <div style={headingSkeletonStyle}>
        <div
          className="skeleton-pulse"
          style={{ height: "0.7rem", width: "8rem", borderRadius: "var(--radius-sm)" }}
        />
        <div
          className="skeleton-pulse"
          style={{
            height: "2rem",
            width: "14rem",
            borderRadius: "var(--radius-sm)",
            marginTop: "0.3rem",
          }}
        />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton-pulse" style={cardSkeletonStyle} />
      ))}
    </main>
  );
}

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const headingSkeletonStyle = {
  padding: "1.75rem 2rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const cardSkeletonStyle = {
  height: 72,
  borderRadius: "var(--radius-lg)",
} satisfies React.CSSProperties;
