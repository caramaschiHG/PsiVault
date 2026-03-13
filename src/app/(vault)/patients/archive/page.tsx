/**
 * Archived patients view.
 *
 * Archived patients leave active flows and live here with explicit recovery.
 * Recovery returns the professional directly to the restored patient profile.
 */

import Link from "next/link";
import { getPatientRepository } from "../../../../lib/patients/store";
import { recoverPatientAction } from "../actions";

const WORKSPACE_ID = "ws_1";

export default function PatientArchivePage() {
  const repo = getPatientRepository();
  const archived = repo.listArchived(WORKSPACE_ID);

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
          <Link href="/patients" style={backLinkStyle}>
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
                  </div>

                  <form action={recoverPatientAction} style={recoverFormStyle}>
                    <input name="patientId" type="hidden" value={patient.id} />
                    <button style={recoverButtonStyle} type="submit">
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
  minHeight: "100vh",
  padding: "2rem",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const heroStyle = {
  maxWidth: "980px",
  padding: "1.7rem 1.8rem",
  borderRadius: "28px",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "0 22px 64px rgba(120, 53, 15, 0.1)",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.16em",
  fontSize: "0.72rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: "0.25rem 0 0.5rem",
  fontSize: "2rem",
  lineHeight: 1.1,
} satisfies React.CSSProperties;

const copyStyle = {
  margin: 0,
  lineHeight: 1.6,
  color: "#57534e",
} satisfies React.CSSProperties;

const headerActionsStyle = {
  marginTop: "0.75rem",
} satisfies React.CSSProperties;

const backLinkStyle = {
  display: "inline-block",
  padding: "0.55rem 1rem",
  borderRadius: "12px",
  background: "#fff7ed",
  color: "#9a3412",
  border: "1px solid rgba(146, 64, 14, 0.18)",
  fontWeight: 600,
  fontSize: "0.9rem",
  textDecoration: "none",
} satisfies React.CSSProperties;

const emptyStateStyle = {
  padding: "1.5rem",
  borderRadius: "20px",
  background: "rgba(255, 252, 247, 0.7)",
  border: "1px solid rgba(146, 64, 14, 0.1)",
  maxWidth: "980px",
} satisfies React.CSSProperties;

const emptyTextStyle = {
  margin: 0,
  color: "#78716c",
} satisfies React.CSSProperties;

const listSectionStyle = {
  maxWidth: "980px",
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
  borderRadius: "20px",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
} satisfies React.CSSProperties;

const patientRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
} satisfies React.CSSProperties;

const patientInfoStyle = {
  flex: 1,
} satisfies React.CSSProperties;

const patientNameStyle = {
  fontSize: "1.05rem",
} satisfies React.CSSProperties;

const socialNameStyle = {
  fontWeight: 400,
  color: "#78716c",
  fontSize: "0.95rem",
} satisfies React.CSSProperties;

const archivedMetaStyle = {
  margin: "0.25rem 0 0",
  fontSize: "0.85rem",
  color: "#a8a29e",
} satisfies React.CSSProperties;

const recoverFormStyle = {
  flexShrink: 0,
} satisfies React.CSSProperties;

const recoverButtonStyle = {
  border: 0,
  borderRadius: "12px",
  padding: "0.6rem 1rem",
  background: "#9a3412",
  color: "#fff7ed",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
} satisfies React.CSSProperties;
