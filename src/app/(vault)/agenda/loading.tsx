import { Skeleton } from "@/components/ui/skeleton";

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

export default function AgendaLoading() {
  return (
    <main style={shellStyle}>
      <Skeleton height="2rem" width="40%" borderRadius="var(--radius-md)" delay={0} />
      <Skeleton height="180px" borderRadius="var(--radius-xl)" delay={100} />
      <Skeleton height="80px" borderRadius="var(--radius-lg)" delay={200} />
      <Skeleton height="80px" borderRadius="var(--radius-lg)" delay={300} />
      <Skeleton height="80px" borderRadius="var(--radius-lg)" delay={400} />
    </main>
  );
}
