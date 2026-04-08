import { Skeleton } from "@/components/ui/skeleton";

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.25rem",
  alignContent: "start",
} satisfies React.CSSProperties;

export default function PatientProfileLoading() {
  return (
    <main style={shellStyle}>
      <Skeleton height="120px" borderRadius="var(--radius-xl)" delay={0} />
      <Skeleton height="200px" borderRadius="var(--radius-xl)" delay={100} />
      <Skeleton height="200px" borderRadius="var(--radius-xl)" delay={200} />
      <Skeleton height="200px" borderRadius="var(--radius-xl)" delay={300} />
    </main>
  );
}
