/**
 * Patient profile page — identity-first, summary in first screenful.
 *
 * Structure:
 * 1. PatientProfileHeader (identity, social name, contact, archive action)
 * 2. PatientSummaryCards (scheduling-backed operational summary)
 * 3. QuickNextSessionCard (prefilled defaults from last appointment or profile)
 * 4. Edit form (below the fold)
 * 5. Important observations (profile-only surface)
 *
 * Now that 02-02 provides appointment occurrences, the summary is hydrated
 * from real scheduling data via derivePatientSummaryFromAppointments rather
 * than returning safe fallback null values.
 *
 * Quick next-session: prefills patient, duration, care mode, price from
 * the most recent appointment or practice profile defaults. Date and time
 * are left empty so the professional chooses the new slot intentionally.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatientRepository } from "../../../../lib/patients/store";
import { getAppointmentRepository } from "../../../../lib/appointments/store";
import { getPracticeProfileSnapshot } from "../../../../lib/setup/profile";
import {
  derivePatientSummaryFromAppointments,
} from "../../../../lib/patients/summary";
import { deriveNextSessionDefaults } from "../../../../lib/appointments/defaults";
import { PatientProfileHeader } from "../components/patient-profile-header";
import { PatientSummaryCards } from "../components/patient-summary-cards";
import { PatientForm } from "../components/patient-form";
import { QuickNextSessionCard } from "./components/quick-next-session-card";

const WORKSPACE_ID = "ws_1";
const ACCOUNT_ID = "acct_1";

interface PatientProfilePageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientProfilePage({ params }: PatientProfilePageProps) {
  const { patientId } = await params;

  const patientRepo = getPatientRepository();
  const appointmentRepo = getAppointmentRepository();
  const profile = getPracticeProfileSnapshot(ACCOUNT_ID, WORKSPACE_ID);

  const patient = patientRepo.findById(patientId, WORKSPACE_ID);

  if (!patient) {
    notFound();
  }

  // Load all appointments for this patient to hydrate the summary and defaults
  const appointments = appointmentRepo.listByPatient(patient.id, WORKSPACE_ID);

  // Derive scheduling-backed summary
  const summary = derivePatientSummaryFromAppointments({
    patientId: patient.id,
    appointments,
  });

  // Find the most recent completed or scheduled appointment for defaults
  const lastRelevantAppointment =
    appointments.find((a) => a.status === "COMPLETED") ??
    appointments.find((a) => a.status === "SCHEDULED" || a.status === "CONFIRMED") ??
    null;

  // Resolve default care mode from practice profile (HYBRID is not a booking value)
  const profileCareMode =
    profile.serviceModes.includes("online") && !profile.serviceModes.includes("in_person")
      ? ("ONLINE" as const)
      : ("IN_PERSON" as const);

  // Derive quick next-session defaults
  const nextSessionDefaults = deriveNextSessionDefaults({
    patientId: patient.id,
    lastAppointment: lastRelevantAppointment
      ? {
          durationMinutes: lastRelevantAppointment.durationMinutes,
          careMode: lastRelevantAppointment.careMode,
          priceInCents: null, // Price domain not yet available in 02-03
        }
      : null,
    profileDefaults: {
      defaultDurationMinutes: profile.defaultAppointmentDurationMinutes ?? 50,
      defaultPriceInCents: profile.defaultSessionPriceInCents ?? null,
      defaultCareMode: profileCareMode,
    },
  });

  const patientDisplayName = patient.socialName
    ? `${patient.fullName} (${patient.socialName})`
    : patient.fullName;

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

      {/* 2. Scheduling-backed operational summary */}
      <PatientSummaryCards summary={summary} />

      {/* 3. Quick next-session card — patient-context entry point */}
      <QuickNextSessionCard
        defaults={nextSessionDefaults}
        patientDisplayName={patientDisplayName}
      />

      {/* 4. Edit form — below the fold */}
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
