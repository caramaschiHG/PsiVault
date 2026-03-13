/**
 * Patient profile page — identity-first, summary in first screenful.
 *
 * Structure:
 * 1. PatientProfileHeader (identity, social name, contact, archive action)
 * 2. PatientSummaryCards (operational summary with fallback states)
 * 3. Edit form (below the fold)
 *
 * The operational summary is rendered with safe fallback states.
 * Real session, document, and financial data will be hydrated once
 * the corresponding domains (02-02 and beyond) are complete.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatientRepository } from "../../../../lib/patients/store";
import { derivePatientSummary } from "../../../../lib/patients/summary";
import { PatientProfileHeader } from "../components/patient-profile-header";
import { PatientSummaryCards } from "../components/patient-summary-cards";
import { PatientForm } from "../components/patient-form";

const WORKSPACE_ID = "ws_1";

interface PatientProfilePageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientProfilePage({ params }: PatientProfilePageProps) {
  const { patientId } = await params;
  const repo = getPatientRepository();
  const patient = repo.findById(patientId, WORKSPACE_ID);

  if (!patient) {
    notFound();
  }

  // Derive summary with fallback states (scheduling domain not yet available)
  const summary = derivePatientSummary({ patientId: patient.id });

  return (
    <main style={shellStyle}>
      {/* Navigation breadcrumb */}
      <nav style={navStyle}>
        <Link href="/patients" style={navLinkStyle}>
          Pacientes
        </Link>
        <span style={navSepStyle}>/</span>
        <span style={navCurrentStyle}>{patient.fullName}</span>
      </nav>

      {/* 1. Identity header — leads the page */}
      <PatientProfileHeader patient={patient} />

      {/* 2. Operational summary — immediately below identity, within first screenful */}
      <PatientSummaryCards summary={summary} />

      {/* 3. Edit form — below the fold */}
      <section style={editSectionStyle}>
        <div style={editHeadingStyle}>
          <p style={eyebrowStyle}>Dados do paciente</p>
          <h2 style={editTitleStyle}>Editar informações</h2>
        </div>
        <PatientForm patient={patient} />
      </section>

      {/* Important observations — profile-only surface */}
      {patient.importantObservations && (
        <section style={observationsSectionStyle}>
          <p style={eyebrowStyle}>Somente neste perfil</p>
          <h2 style={observationsTitleStyle}>Observações importantes</h2>
          <p style={observationsTextStyle}>{patient.importantObservations}</p>
        </section>
      )}
    </main>
  );
}

const shellStyle = {
  minHeight: "100vh",
  padding: "2rem",
  display: "grid",
  gap: "1.25rem",
  alignContent: "start",
  maxWidth: "900px",
} satisfies React.CSSProperties;

const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.9rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const navLinkStyle = {
  color: "#9a3412",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;

const navSepStyle = {
  color: "#d4c5b5",
} satisfies React.CSSProperties;

const navCurrentStyle = {
  color: "#57534e",
  fontWeight: 500,
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const editSectionStyle = {
  display: "grid",
  gap: "0.75rem",
  marginTop: "0.5rem",
} satisfies React.CSSProperties;

const editHeadingStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const editTitleStyle = {
  margin: 0,
  fontSize: "1.4rem",
} satisfies React.CSSProperties;

const observationsSectionStyle = {
  padding: "1.35rem 1.5rem",
  borderRadius: "22px",
  background: "rgba(255, 247, 237, 0.9)",
  border: "1px solid rgba(146, 64, 14, 0.16)",
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const observationsTitleStyle = {
  margin: 0,
  fontSize: "1.15rem",
} satisfies React.CSSProperties;

const observationsTextStyle = {
  margin: 0,
  lineHeight: 1.7,
  color: "#44403c",
  whiteSpace: "pre-wrap" as const,
} satisfies React.CSSProperties;
