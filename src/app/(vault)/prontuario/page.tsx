import Link from "next/link";
import { getPatientRepository } from "@/lib/patients/store";
import { getClinicalNoteRepository } from "@/lib/clinical/store";
import { resolveSession } from "@/lib/supabase/session";

export default async function ProntuarioPage() {
  const { workspaceId } = await resolveSession();
  const patientRepo = getPatientRepository();
  const clinicalRepo = getClinicalNoteRepository();

  const patients = await patientRepo.listActive(workspaceId);

  const notesPerPatient = await Promise.all(
    patients.map((p) => clinicalRepo.listByPatient(p.id, workspaceId)),
  );

  const patientsWithActivity = patients
    .map((patient, i) => {
      const notes = notesPerPatient[i];
      const sorted = [...notes].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
      const latestNote = sorted[0] ?? null;
      return { patient, latestNote };
    })
    .sort((a, b) => {
      if (!a.latestNote && !b.latestNote) return 0;
      if (!a.latestNote) return 1;
      if (!b.latestNote) return -1;
      return b.latestNote.createdAt.getTime() - a.latestNote.createdAt.getTime();
    });

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);

  const countLabel =
    patients.length === 0
      ? "Nenhum registro clínico ainda."
      : patients.length === 1
        ? "1 paciente em acompanhamento."
        : `${patients.length} pacientes em acompanhamento.`;

  return (
    <main style={shellStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Registros clínicos</p>
        <h1 style={titleStyle}>Prontuário</h1>
        <p style={copyStyle}>{countLabel}</p>
      </section>

      {patients.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={emptyStateTextStyle}>Nenhum registro clínico ainda.</p>
          <p style={emptyStateTextStyle}>O histórico dos pacientes aparecerá aqui.</p>
        </div>
      ) : (
        <ul style={listStyle}>
          {patientsWithActivity.map(({ patient, latestNote }) => (
            <li key={patient.id} style={cardStyle}>
              <div style={cardContentStyle}>
                <div style={patientNameRowStyle}>
                  <strong style={patientNameStyle}>{patient.fullName}</strong>
                  {patient.socialName && (
                    <span style={socialNameStyle}> ({patient.socialName})</span>
                  )}
                </div>
                <p style={lastNoteStyle}>
                  Último registro:{" "}
                  {latestNote ? formatDate(latestNote.createdAt) : "Sem registros"}
                </p>
              </div>
              <Link href={`/patients/${patient.id}`} style={linkStyle}>
                Ver prontuário
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const heroStyle = {
  padding: "1.75rem 2rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-md)",
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const titleStyle = {
  margin: "0.25rem 0 0",
  fontSize: "var(--font-size-page-title)",
  fontWeight: 700,
  fontFamily: "var(--font-serif)",
  color: "var(--color-text-1)",
  lineHeight: 1.1,
} satisfies React.CSSProperties;

const copyStyle = {
  margin: "0.25rem 0 0",
  lineHeight: 1.6,
  color: "var(--color-text-2)",
  fontSize: "0.9rem",
} satisfies React.CSSProperties;

const listStyle = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const cardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  padding: "1rem 1.25rem",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-sm)",
} satisfies React.CSSProperties;

const cardContentStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const patientNameRowStyle = {
  lineHeight: 1.3,
} satisfies React.CSSProperties;

const patientNameStyle = {
  fontSize: "1rem",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const socialNameStyle = {
  fontWeight: 400,
  color: "var(--color-text-3)",
  fontSize: "0.92rem",
} satisfies React.CSSProperties;

const lastNoteStyle = {
  margin: 0,
  fontSize: "0.85rem",
  color: "var(--color-text-3)",
  lineHeight: 1.5,
} satisfies React.CSSProperties;

const linkStyle = {
  flexShrink: 0,
  fontSize: "0.875rem",
  color: "var(--color-accent)",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;

const emptyStateStyle = {
  padding: "2.5rem 2rem",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  textAlign: "center" as const,
} satisfies React.CSSProperties;

const emptyStateTextStyle = {
  margin: "0.25rem 0",
  color: "var(--color-text-3)",
  fontSize: "0.9rem",
} satisfies React.CSSProperties;
