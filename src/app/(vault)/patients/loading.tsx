import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main style={{ padding: "2rem 2.5rem", display: "grid", gap: "1rem" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} height="64px" borderRadius="12px" delay={i * 100} />
      ))}
    </main>
  );
}
