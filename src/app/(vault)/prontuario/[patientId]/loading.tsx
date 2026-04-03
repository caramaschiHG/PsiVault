export default function Loading() {
  return (
    <main style={shellStyle}>
      {/* Breadcrumb skeleton */}
      <div
        className="skeleton-pulse"
        style={{ height: "0.75rem", width: "10rem", borderRadius: "var(--radius-sm)" }}
      />

      {/* Header skeleton */}
      <div style={headerSkeletonStyle}>
        <div
          className="skeleton-pulse"
          style={{ height: "2.25rem", width: "16rem", borderRadius: "var(--radius-sm)" }}
        />
        <div
          className="skeleton-pulse"
          style={{
            height: "0.75rem",
            width: "7rem",
            borderRadius: "var(--radius-sm)",
            marginTop: "0.25rem",
          }}
        />
      </div>

      {/* Timeline section skeleton */}
      <div style={sectionSkeletonStyle}>
        <div
          className="skeleton-pulse"
          style={{ height: "1rem", width: "12rem", borderRadius: "var(--radius-sm)" }}
        />
        <div style={hrSkeletonStyle} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={entrySkeletonStyle}>
            <div
              className="skeleton-pulse"
              style={{ height: "0.75rem", width: "8rem", borderRadius: "var(--radius-sm)" }}
            />
            <div
              className="skeleton-pulse"
              style={{ height: "0.75rem", width: "5rem", borderRadius: "var(--radius-sm)" }}
            />
          </div>
        ))}
      </div>

      {/* Documents section skeleton */}
      <div style={sectionSkeletonStyle}>
        <div
          className="skeleton-pulse"
          style={{ height: "1rem", width: "9rem", borderRadius: "var(--radius-sm)" }}
        />
        <div style={hrSkeletonStyle} />
        <div
          className="skeleton-pulse"
          style={{ height: "0.75rem", width: "18rem", borderRadius: "var(--radius-sm)" }}
        />
      </div>
    </main>
  );
}

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "2rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const headerSkeletonStyle = {
  display: "grid",
  gap: "0.5rem",
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
