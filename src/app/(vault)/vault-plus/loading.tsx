import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main style={{ padding: "2rem 2.5rem", display: "grid", gap: "1.5rem" }}>
      <Skeleton height="2rem" width="40%" borderRadius="var(--radius-md)" delay={0} />
      <Skeleton height="1rem" width="60%" delay={50} />
      <Skeleton height="1rem" width="50%" delay={100} />
      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        <Skeleton height="60px" borderRadius="var(--radius-lg)" delay={150} />
        <Skeleton height="60px" borderRadius="var(--radius-lg)" delay={200} />
        <Skeleton height="60px" borderRadius="var(--radius-lg)" delay={250} />
      </div>
    </main>
  );
}
