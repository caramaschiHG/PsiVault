/**
 * Note composer page — /sessions/[appointmentId]/note
 *
 * Server component. Guards that the appointment exists and is COMPLETED.
 * Loads the patient, all patient appointments (for session number derivation),
 * and any existing note (for pre-population in update mode).
 *
 * Renders a read-only session context header and the NoteComposerForm client
 * component which handles form state, submission, and the unsaved-draft guard.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getAppointmentRepository } from "../../../../../lib/appointments/store";
import { getPatientRepository } from "../../../../../lib/patients/store";
import { getClinicalNoteRepository } from "../../../../../lib/clinical/store";
import { deriveSessionNumber } from "../../../../../lib/clinical/model";
import { NoteComposerForm } from "./components/note-composer-form";
import { createNoteAction, updateNoteAction } from "../actions";

const WORKSPACE_ID = "ws_1";

interface NotePageProps {
  params: Promise<{ appointmentId: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { appointmentId } = await params;

  const appointmentRepo = getAppointmentRepository();
  const patientRepo = getPatientRepository();
  const clinicalRepo = getClinicalNoteRepository();

  // Guard: appointment must exist and be COMPLETED
  const appointment = appointmentRepo.findById(appointmentId, WORKSPACE_ID);
  if (!appointment || appointment.status !== "COMPLETED") {
    notFound();
  }

  // Guard: patient must exist
  const patient = patientRepo.findById(appointment.patientId, WORKSPACE_ID);
  if (!patient) {
    notFound();
  }

  // Compute session number
  const allAppointments = appointmentRepo.listByPatient(patient.id, WORKSPACE_ID);
  const sessionNumber = deriveSessionNumber(appointmentId, allAppointments);

  // Load existing note (null if first creation)
  const existingNote = clinicalRepo.findByAppointmentId(appointmentId, WORKSPACE_ID);

  // Build read-only header labels
  const sessionLabel =
    sessionNumber !== null ? `Sessão ${sessionNumber}` : "Consulta avulsa";

  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(appointment.startsAt);

  const careModeLabel = appointment.careMode === "ONLINE" ? "Online" : "Presencial";
  const durationLabel = `${appointment.durationMinutes} min`;

  const backHref = `/patients/${patient.id}`;
  const patientDisplayName = patient.socialName
    ? `${patient.fullName} (${patient.socialName})`
    : patient.fullName;

  return (
    <main style={shellStyle}>
      {/* Breadcrumb */}
      <nav style={breadcrumbStyle}>
        <Link href="/patients" style={breadcrumbLinkStyle}>
          Pacientes
        </Link>
        <span style={breadcrumbSepStyle}>/</span>
        <Link href={backHref} style={breadcrumbLinkStyle}>
          {patientDisplayName}
        </Link>
        <span style={breadcrumbSepStyle}>/</span>
        <span style={breadcrumbCurrentStyle}>Registrar evolução</span>
      </nav>

      {/* Page heading */}
      <div style={headingStyle}>
        <p style={eyebrowStyle}>Prontuário clínico</p>
        <h1 style={titleStyle}>
          {existingNote ? "Editar evolução" : "Registrar evolução"}
        </h1>
      </div>

      {/* Read-only session context header */}
      <section style={sessionHeaderStyle}>
        <p style={sessionEyebrowStyle}>Sessão</p>
        <div style={sessionMetaRowStyle}>
          <span style={sessionLabelStyle}>{sessionLabel}</span>
          <span style={sessionMetaSepStyle}>·</span>
          <span style={sessionMetaValueStyle}>{dateLabel}</span>
          <span style={sessionMetaSepStyle}>·</span>
          <span style={sessionMetaValueStyle}>{careModeLabel}</span>
          <span style={sessionMetaSepStyle}>·</span>
          <span style={sessionMetaValueStyle}>{durationLabel}</span>
        </div>
      </section>

      {/* Note form */}
      <NoteComposerForm
        existingNote={existingNote}
        appointmentId={appointmentId}
        patientId={patient.id}
        backHref={backHref}
        createAction={createNoteAction}
        updateAction={updateNoteAction}
      />
    </main>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const shellStyle = {
  minHeight: "100vh",
  padding: "2rem",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
  maxWidth: "800px",
} satisfies React.CSSProperties;

const breadcrumbStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.82rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const breadcrumbLinkStyle = {
  color: "#b45309",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;

const breadcrumbSepStyle = {
  color: "#d6d3d1",
  fontWeight: 400,
} satisfies React.CSSProperties;

const breadcrumbCurrentStyle = {
  color: "#78716c",
  fontWeight: 500,
} satisfies React.CSSProperties;

const headingStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: 700,
  color: "#1c1917",
} satisfies React.CSSProperties;

const sessionHeaderStyle = {
  padding: "1rem 1.25rem",
  borderRadius: "16px",
  background: "rgba(255, 252, 247, 0.95)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
  boxShadow: "0 2px 8px rgba(120, 53, 15, 0.04)",
  display: "grid",
  gap: "0.4rem",
} satisfies React.CSSProperties;

const sessionEyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: "0.68rem",
  color: "#a8a29e",
  fontWeight: 600,
} satisfies React.CSSProperties;

const sessionMetaRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const sessionLabelStyle = {
  fontWeight: 700,
  fontSize: "0.95rem",
  color: "#1c1917",
} satisfies React.CSSProperties;

const sessionMetaSepStyle = {
  color: "#d6d3d1",
  fontSize: "0.9rem",
} satisfies React.CSSProperties;

const sessionMetaValueStyle = {
  fontSize: "0.9rem",
  color: "#57534e",
  fontWeight: 500,
} satisfies React.CSSProperties;
