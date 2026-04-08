import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main style={{ padding: "2rem 2.5rem", display: "grid", gap: "1.5rem" }}>
      <Skeleton height="2rem" width="30%" borderRadius="var(--radius-md)" delay={0} />
      <Skeleton height="1.5rem" width="20%" delay={50} />
      <Skeleton height="200px" borderRadius="var(--radius-xl)" delay={100} />
      <Skeleton height="60px" borderRadius="var(--radius-lg)" delay={200} />
    </main>
  );
}
