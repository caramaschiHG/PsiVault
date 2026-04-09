import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main style={{ padding: "2rem 2.5rem", display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height="100px" borderRadius="var(--radius-lg)" delay={i * 150} />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} height="80px" borderRadius="var(--radius-md)" delay={i * 100 + 300} />
      ))}
    </main>
  );
}
