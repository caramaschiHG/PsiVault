export default function Loading() {
  return (
    <main style={{ padding: "2rem 2.5rem", display: "grid", gap: "1.5rem" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: 120,
            borderRadius: 20,
            background: "linear-gradient(90deg, #f0ebe2 25%, #e8e2d9 50%, #f0ebe2 75%)",
            backgroundSize: "200% 100%",
            animation: "skeleton-shimmer 1.4s ease infinite",
          }}
        />
      ))}
    </main>
  );
}
