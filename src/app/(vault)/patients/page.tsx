/**
 * Active patients list — privacy-safe.
 *
 * Shows only identity and minimal contact context.
 * importantObservations is explicitly excluded.
 */

import Link from "next/link";
import { getPatientRepository } from "../../../lib/patients/store";
import { PatientForm } from "./components/patient-form";

// Stub workspace resolution — real session lookup in production
const WORKSPACE_ID = "ws_1";

export default function PatientsPage() {
  const repo = getPatientRepository();
  const patients = repo.listActive(WORKSPACE_ID);

  return (
    <main style={shellStyle}>
      <section style={heroStyle}>
        <p style={eyebrowStyle}>Pacientes ativos</p>
        <h1 style={titleStyle}>Pacientes</h1>
        <p style={copyStyle}>
          {patients.length === 0
            ? "Nenhum paciente ativo ainda."
            : `${patients.length} paciente${patients.length > 1 ? "s" : ""} ativo${patients.length > 1 ? "s" : ""}.`}
        </p>
        <div style={headerActionsStyle}>
          <Link href="/patients/archive" style={secondaryLinkStyle}>
            Ver arquivo
          </Link>
        </div>
      </section>

      {patients.length > 0 && (
        <section style={listSectionStyle}>
          <ul style={listStyle}>
            {patients.map((patient) => (
              <li key={patient.id} style={listItemStyle}>
                <Link href={`/patients/${patient.id}`} style={patientLinkStyle}>
                  <div>
                    <strong style={patientNameStyle}>{patient.fullName}</strong>
                    {patient.socialName && (
                      <span style={socialNameStyle}> ({patient.socialName})</span>
                    )}
                  </div>
                  {/* Privacy-safe: only show contact info, never importantObservations */}
                  {(patient.email || patient.phone) && (
                    <p style={patientMetaStyle}>
                      {[patient.email, patient.phone].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={formSectionStyle}>
        <div style={formHeaderStyle}>
          <p style={eyebrowStyle}>Novo paciente</p>
          <h2 style={formTitleStyle}>Cadastrar paciente</h2>
        </div>
        <PatientForm />
      </section>
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
  display: "flex",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const secondaryLinkStyle = {
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
  borderRadius: "20px",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
  overflow: "hidden",
} satisfies React.CSSProperties;

const patientLinkStyle = {
  display: "block",
  padding: "1rem 1.25rem",
  textDecoration: "none",
  color: "inherit",
} satisfies React.CSSProperties;

const patientNameStyle = {
  fontSize: "1.05rem",
} satisfies React.CSSProperties;

const socialNameStyle = {
  fontWeight: 400,
  color: "#78716c",
  fontSize: "0.95rem",
} satisfies React.CSSProperties;

const patientMetaStyle = {
  margin: "0.25rem 0 0",
  fontSize: "0.87rem",
  color: "#78716c",
  lineHeight: 1.5,
} satisfies React.CSSProperties;

const formSectionStyle = {
  maxWidth: "740px",
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const formHeaderStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const formTitleStyle = {
  margin: 0,
  fontSize: "1.5rem",
} satisfies React.CSSProperties;
