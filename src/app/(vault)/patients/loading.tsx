export default function Loading() {
  return (
    <main style={{ padding: "2rem 2.5rem", display: "grid", gap: "1rem" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            height: 64,
            borderRadius: 12,
            background: "linear-gradient(90deg, #f0ebe2 25%, #e8e2d9 50%, #f0ebe2 75%)",
            backgroundSize: "200% 100%",
            animation: "skeleton-shimmer 1.4s ease infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </main>
  );
}
