/**
 * Active patients list — privacy-safe.
 *
 * Shows only identity and minimal contact context.
 * importantObservations is explicitly excluded.
 */

import Link from "next/link";
import { getPatientRepository } from "../../../lib/patients/store";
import { PatientForm } from "./components/patient-form";
import { EmptyState } from "../components/empty-state";

// Stub workspace resolution — real session lookup in production
const WORKSPACE_ID = "ws_1";

export default async function PatientsPage() {
  const repo = getPatientRepository();
  const patients = await repo.listActive(WORKSPACE_ID);

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
          <Link href="/patients/archive" className="btn-secondary">
            Ver arquivo
          </Link>
        </div>
      </section>

      <section style={listSectionStyle}>
        {patients.length === 0 ? (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            }
            title="Nenhum paciente ainda"
            description="Comece adicionando o primeiro paciente ao sistema."
            actionLabel="Adicionar paciente"
            actionHref="#form"
          />
        ) : (
          <ul style={listStyle}>
            {patients.map((patient) => (
              <li key={patient.id} className="card-hover" style={listItemStyle}>
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
        )}
      </section>

      {/* FAB mobile — visible only on mobile via CSS class */}
      <a
        href="#form"
        className="fab-mobile"
        style={{
          position: "fixed",
          bottom: "5.5rem",
          right: "1.5rem",
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "50%",
          backgroundColor: "var(--color-accent)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-lg)",
          fontSize: "1.5rem",
          textDecoration: "none",
          zIndex: 90,
        } satisfies React.CSSProperties}
        aria-label="Adicionar paciente"
      >
        +
      </a>

      <section id="form" style={formSectionStyle}>
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

const headerActionsStyle = {
  marginTop: "0.5rem",
  display: "flex",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const listSectionStyle = {
  maxWidth: "100%",
} satisfies React.CSSProperties;

const listStyle = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  boxShadow: "var(--shadow-sm)",
  overflow: "hidden",
} satisfies React.CSSProperties;

const listItemStyle = {
  minHeight: "var(--space-row-height)",
  borderBottom: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const patientLinkStyle = {
  display: "block",
  padding: "1rem 1.25rem",
  textDecoration: "none",
  color: "inherit",
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

const patientMetaStyle = {
  margin: "0.25rem 0 0",
  fontSize: "0.85rem",
  color: "var(--color-text-3)",
  lineHeight: 1.5,
} satisfies React.CSSProperties;

const formSectionStyle = {
  maxWidth: "100%",
  display: "grid",
  gap: "1rem",
  paddingTop: "0.5rem",
  borderTop: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const formHeaderStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const formTitleStyle = {
  margin: 0,
  fontSize: "1.4rem",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;
