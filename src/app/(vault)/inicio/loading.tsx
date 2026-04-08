import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main style={{ padding: "2rem 2.5rem", display: "grid", gap: "1.5rem" }}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} height="120px" borderRadius="20px" delay={i * 100} />
      ))}
    </main>
  );
}
