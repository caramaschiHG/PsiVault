/**
 * Patient profile page — identity-first, summary in first screenful.
 *
 * Structure:
 * 1. PatientProfileHeader (identity, social name, contact, archive action)
 * 2. PatientSummaryCards (scheduling-backed operational summary)
 * 3. QuickNextSessionCard (prefilled defaults from last appointment or profile)
 * 4. ClinicalTimeline (longitudinal session history, all statuses)
 * 5. DocumentsSection (active patient documents — type, date, view link)
 * 6. FinanceSection (charge history and inline edit form)
 * 7. ExportSection (per-patient data export trigger — SECU-03)
 * 8. Edit form (below the fold)
 * 9. Important observations (profile-only surface)
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
import { getClinicalNoteRepository } from "../../../../lib/clinical/store";
import { deriveSessionNumber } from "../../../../lib/clinical/model";
import { PatientProfileHeader } from "../components/patient-profile-header";
import { PatientSummaryCards } from "../components/patient-summary-cards";
import { PatientForm } from "../components/patient-form";
import { QuickNextSessionCard } from "./components/quick-next-session-card";
import { ClinicalTimeline } from "./components/clinical-timeline";
import { getDocumentRepository } from "../../../../lib/documents/store";
import { DocumentsSection } from "./components/documents-section";
import { getFinanceRepository } from "../../../../lib/finance/store";
import { deriveFinancialStatus } from "../../../../lib/finance/model";
import { FinanceSection } from "./components/finance-section";
import { updateChargeAction } from "../../appointments/actions";
import { ExportSection } from "./components/export-section";
import { getReminderRepository } from "../../../../lib/reminders/store";
import { RemindersSection } from "./components/reminders-section";
import { createReminderAction, completeReminderAction } from "../../actions/reminders";
import { resolveSession } from "../../../../lib/supabase/session";

interface PatientProfilePageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientProfilePage({ params }: PatientProfilePageProps) {
  const { accountId, workspaceId } = await resolveSession();
  const { patientId } = await params;

  const patientRepo = getPatientRepository();
  const appointmentRepo = getAppointmentRepository();
  const profile = await getPracticeProfileSnapshot(accountId, workspaceId);

  const patient = await patientRepo.findById(patientId, workspaceId);

  if (!patient) {
    notFound();
  }

  // Load all appointments for this patient to hydrate the summary and defaults
  const appointments = await appointmentRepo.listByPatient(patient.id, workspaceId);

  // Derive scheduling-backed summary (financialStatus populated after charges are loaded below)
  // Note: charges loaded after appointments, so we compute summary after loading charges
  // Summary will be recalculated below once financialStatus is available

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

  // Load reminders for this patient (active + completed history)
  const reminderRepo = getReminderRepository();
  const docRepo = getDocumentRepository();
  const financeRepo = getFinanceRepository();

  const [activeReminders, completedReminders, activeDocuments, charges] = await Promise.all([
    reminderRepo.listActiveByPatient(patient.id, workspaceId),
    reminderRepo.listCompletedByPatient(patient.id, workspaceId),
    docRepo.listActiveByPatient(patient.id, workspaceId),
    financeRepo.listByPatient(patient.id, workspaceId),
  ]);
  const financialStatus = deriveFinancialStatus(charges);

  // Derive scheduling-backed summary with real financial status
  const summary = derivePatientSummaryFromAppointments({
    patientId: patient.id,
    appointments,
    financialStatus,
  });

  // Load clinical notes and build timeline entries
  const clinicalRepo = getClinicalNoteRepository();

  // Build a map of appointmentId -> noteId for COMPLETED appointments that have a note
  const completedAppointments = appointments.filter((appt) => appt.status === "COMPLETED");
  const noteResults = await Promise.all(
    completedAppointments.map((appt) => clinicalRepo.findByAppointmentId(appt.id, workspaceId)),
  );
  const notesByAppointment = new Map<string, string>();
  completedAppointments.forEach((appt, i) => {
    const note = noteResults[i];
    if (note) notesByAppointment.set(appt.id, note.id);
  });

  // Build timeline entries — all appointments, most recent first
  // (appointments is already sorted most-recent first from listByPatient)
  const allEntries = appointments.map((appt) => ({
    appointmentId: appt.id,
    startsAt: appt.startsAt,
    durationMinutes: appt.durationMinutes,
    careMode: appt.careMode,
    status: appt.status,
    sessionNumber: deriveSessionNumber(appt.id, appointments),
    hasNote: notesByAppointment.has(appt.id),
    noteId: notesByAppointment.get(appt.id) ?? null,
  }));

  const now = new Date();

  // Upcoming: SCHEDULED/CONFIRMED in the future, sorted ASC (next first)
  const upcomingEntries = allEntries
    .filter((e) => (e.status === "SCHEDULED" || e.status === "CONFIRMED") && e.startsAt > now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  // Completed: most recent first (already sorted DESC from listByPatient)
  const completedEntries = allEntries.filter((e) => e.status === "COMPLETED");

  // Dismissed: canceled or no-show
  const dismissedEntries = allEntries.filter(
    (e) => e.status === "CANCELED" || e.status === "NO_SHOW",
  );

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
        <span style={navSepStyle}>›</span>
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

      {/* 4. Clinical timeline — longitudinal session history */}
      <ClinicalTimeline
        upcoming={upcomingEntries}
        completed={completedEntries}
        dismissed={dismissedEntries}
        patientName={patientDisplayName}
        patientPhone={patient.phone}
      />

      {/* 5. Documents section — patient vault */}
      <DocumentsSection
        documents={activeDocuments}
        patientId={patient.id}
        patientName={patientDisplayName}
        patientPhone={patient.phone}
      />

      {/* 6. Finance section — charge history and inline edit form */}
      <FinanceSection
        charges={charges}
        patientId={patient.id}
        updateChargeAction={updateChargeAction}
      />

      {/* 7. Reminders section — active reminders and completion history */}
      <RemindersSection
        activeReminders={activeReminders}
        completedReminders={completedReminders}
        createReminderAction={createReminderAction}
        completeReminderAction={completeReminderAction}
        patientId={patient.id}
      />

      {/* 8. Export section — per-patient data export trigger (SECU-03) */}
      <ExportSection patientId={patient.id} patientName={patientDisplayName} />

      {/* 8. Edit form — below the fold */}
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
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.25rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.82rem",
  marginBottom: "0.25rem",
} satisfies React.CSSProperties;

const navLinkStyle = {
  color: "var(--color-text-2)",
  textDecoration: "none",
  fontWeight: 500,
  transition: "color 0.12s",
} satisfies React.CSSProperties;

const navSepStyle = {
  color: "var(--color-text-4)",
  fontSize: "0.75rem",
} satisfies React.CSSProperties;

const navCurrentStyle = {
  color: "var(--color-text-3)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
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
