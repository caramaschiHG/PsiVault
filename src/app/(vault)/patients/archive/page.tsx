/**
 * Archived patients view.
 *
 * Archived patients leave active flows and live here with explicit recovery.
 * Recovery returns the professional directly to the restored patient profile.
 */

import Link from "next/link";
import { getPatientRepository } from "../../../../lib/patients/store";
import { recoverPatientAction } from "../actions";
import { resolveSession } from "../../../../lib/supabase/session";

export default async function PatientArchivePage() {
  const { workspaceId } = await resolveSession();
  const repo = getPatientRepository();
  const archived = await repo.listArchived(workspaceId);

  return (
    <main style={shellStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Pacientes arquivados</p>
        <h1 style={titleStyle}>Arquivo</h1>
        <p style={copyStyle}>
          Pacientes arquivados não aparecem nos fluxos ativos. O histórico vinculado permanece
          intacto e pode ser acessado após a reativação.
        </p>
        <div style={headerActionsStyle}>
          <Link href="/patients" className="btn-secondary">
            Voltar aos pacientes ativos
          </Link>
        </div>
      </section>

      {archived.length === 0 ? (
        <section style={emptyStateStyle}>
          <p style={emptyTextStyle}>Nenhum paciente arquivado.</p>
        </section>
      ) : (
        <section style={listSectionStyle}>
          <ul style={listStyle}>
            {archived.map((patient) => (
              <li key={patient.id} style={listItemStyle}>
                <div style={patientRowStyle}>
                  <div style={patientInfoStyle}>
                    <strong style={patientNameStyle}>{patient.fullName}</strong>
                    {patient.socialName && (
                      <span style={socialNameStyle}> ({patient.socialName})</span>
                    )}
                    {patient.archivedAt && (
                      <p style={archivedMetaStyle}>
                        Arquivado em{" "}
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "medium",
                        }).format(patient.archivedAt)}
                      </p>
                    )}
                    <span style={archivedBadgeStyle}>Arquivado</span>
                  </div>

                  <form action={recoverPatientAction} style={recoverFormStyle}>
                    <input name="patientId" type="hidden" value={patient.id} />
                    <button className="btn-primary" type="submit">
                      Reativar paciente
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
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
  fontSize: "2rem",
  fontWeight: 700,
  fontFamily: "'IBM Plex Serif', serif",
  color: "var(--color-text-1)",
  lineHeight: 1.1,
} satisfies React.CSSProperties;

const copyStyle = {
  margin: "0.25rem 0 0",
  lineHeight: 1.6,
  color: "var(--color-text-2)",
  fontSize: "0.9rem",
} satisfies React.CSSProperties;

const headerActionsStyle = {
  marginTop: "0.5rem",
} satisfies React.CSSProperties;

const emptyStateStyle = {
  padding: "1.5rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const emptyTextStyle = {
  margin: 0,
  color: "var(--color-text-3)",
  fontSize: "0.9rem",
} satisfies React.CSSProperties;

const listSectionStyle = {
  maxWidth: "100%",
} satisfies React.CSSProperties;

const listStyle = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const listItemStyle = {
  padding: "1rem 1.25rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-sm)",
} satisfies React.CSSProperties;

const patientRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
} satisfies React.CSSProperties;

const patientInfoStyle = {
  flex: 1,
  display: "grid",
  gap: "0.25rem",
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

const archivedMetaStyle = {
  margin: 0,
  fontSize: "0.82rem",
  color: "var(--color-text-4)",
} satisfies React.CSSProperties;

const archivedBadgeStyle = {
  display: "inline-block",
  padding: "0.2rem 0.55rem",
  borderRadius: "var(--radius-pill)",
  background: "rgba(168, 162, 158, 0.12)",
  color: "var(--color-text-3)",
  fontSize: "0.72rem",
  fontWeight: 600,
  width: "fit-content",
} satisfies React.CSSProperties;

const recoverFormStyle = {
  flexShrink: 0,
} satisfies React.CSSProperties;
