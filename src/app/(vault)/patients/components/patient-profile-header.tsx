/**
 * PatientProfileHeader — identity-first.
 *
 * Legal name leads. Social name appears as secondary context when present.
 * This component appears above the fold in the first screenful.
 */

import type { Patient } from "../../../../lib/patients/model";
import { archivePatientAction } from "../actions";

interface PatientProfileHeaderProps {
  patient: Patient;
}

export function PatientProfileHeader({ patient }: PatientProfileHeaderProps) {
  return (
    <section style={headerStyle}>
      <div style={identityStyle}>
        <div>
          <h1 style={nameStyle}>{patient.fullName}</h1>
          {patient.socialName && (
            <p style={socialNameStyle}>
              <span style={socialNameLabelStyle}>Nome social:</span> {patient.socialName}
            </p>
          )}
        </div>

        <div style={actionsStyle}>
          {patient.archivedAt ? (
            <span style={archivedBadgeStyle}>Arquivado</span>
          ) : (
            <form action={archivePatientAction}>
              <input name="patientId" type="hidden" value={patient.id} />
              <button style={archiveButtonStyle} type="submit">
                Arquivar paciente
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Contact info — privacy-safe */}
      {(patient.email || patient.phone) && (
        <div style={contactRowStyle}>
          {patient.email && (
            <span style={contactChipStyle}>{patient.email}</span>
          )}
          {patient.phone && (
            <span style={contactChipStyle}>{patient.phone}</span>
          )}
        </div>
      )}
    </section>
  );
}

const headerStyle = {
  padding: "1.75rem 2rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-md)",
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const identityStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "1rem",
} satisfies React.CSSProperties;

const nameStyle = {
  margin: 0,
  fontSize: "var(--font-size-page-title)",
  lineHeight: 1.1,
  fontFamily: "var(--font-serif)",
  fontWeight: 700,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const socialNameStyle = {
  margin: "0.4rem 0 0",
  fontSize: "0.95rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const socialNameLabelStyle = {
  fontWeight: 600,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const actionsStyle = {
  flexShrink: 0,
} satisfies React.CSSProperties;

const archivedBadgeStyle = {
  display: "inline-block",
  padding: "0.4rem 0.85rem",
  borderRadius: "10px",
  background: "var(--color-accent-light)",
  color: "var(--color-accent)",
  fontWeight: 600,
  fontSize: "0.85rem",
} satisfies React.CSSProperties;

const archiveButtonStyle = {
  border: "1px solid var(--color-border-med)",
  borderRadius: "12px",
  padding: "0.55rem 1rem",
  background: "var(--color-surface-0)",
  color: "var(--color-accent)",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const contactRowStyle = {
  display: "flex",
  gap: "0.6rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const contactChipStyle = {
  display: "inline-block",
  padding: "0.3rem 0.75rem",
  borderRadius: "8px",
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border)",
  fontSize: "0.87rem",
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;
