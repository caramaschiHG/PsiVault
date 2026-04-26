/**
 * Patient profile page — organized into tabs for clarity.
 *
 * Tabs:
 * 1. Visão Geral — header, summary cards, quick next session, reminders
 * 2. Clínico — clinical timeline (sessions, notes, upcoming)
 * 3. Documentos — active patient documents
 * 4. Financeiro — charge history and payments
 * 5. Configurações — edit form, observations, export
 *
 * Server component: loads all data once, distributes to tab panels via client wrapper.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getPatientRepository } from "../../../../lib/patients/store";
import { getAppointmentRepository } from "../../../../lib/appointments/store";
import { getPracticeProfileSnapshot } from "../../../../lib/setup/profile";
import { derivePatientSummaryFromAppointments } from "../../../../lib/patients/summary";
import { deriveNextSessionDefaults } from "../../../../lib/appointments/defaults";
import { getClinicalNoteRepository } from "../../../../lib/clinical/store";
import { deriveSessionNumber } from "../../../../lib/clinical/model";
import { getDocumentRepository } from "../../../../lib/documents/store";
import { getFinanceRepository } from "../../../../lib/finance/store";
import { deriveFinancialStatus } from "../../../../lib/finance/model";
import { updateChargeAction } from "../../appointments/actions";
import { getReminderRepository } from "../../../../lib/reminders/store";
import { createReminderAction, completeReminderAction } from "../../actions/reminders";
import { resolveSession } from "../../../../lib/supabase/session";
import { PatientProfileTabs } from "./components/patient-profile-tabs";

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
  if (!patient) notFound();

  const appointments = await appointmentRepo.listByPatient(patient.id, workspaceId);

  const appointmentMap = Object.fromEntries(
    appointments.map((a) => [
      a.id,
      { startsAt: a.startsAt, careMode: a.careMode },
    ]),
  );

  const lastRelevantAppointment =
    appointments.find((a) => a.status === "COMPLETED") ??
    appointments.find((a) => a.status === "SCHEDULED" || a.status === "CONFIRMED") ??
    null;

  const profileCareMode =
    profile.serviceModes.includes("online") && !profile.serviceModes.includes("in_person")
      ? ("ONLINE" as const)
      : ("IN_PERSON" as const);

  const nextSessionDefaults = deriveNextSessionDefaults({
    patientId: patient.id,
    lastAppointment: lastRelevantAppointment
      ? {
          durationMinutes: lastRelevantAppointment.durationMinutes,
          careMode: lastRelevantAppointment.careMode,
          priceInCents: null,
        }
      : null,
    profileDefaults: {
      defaultDurationMinutes: profile.defaultAppointmentDurationMinutes ?? 50,
      defaultPriceInCents: profile.defaultSessionPriceInCents ?? null,
      defaultCareMode: profileCareMode,
    },
  });

  const reminderRepo = getReminderRepository();
  const docRepo = getDocumentRepository();
  const financeRepo = getFinanceRepository();

  const [activeReminders, completedReminders, allDocuments, charges] = await Promise.all([
    reminderRepo.listActiveByPatient(patient.id, workspaceId),
    reminderRepo.listCompletedByPatient(patient.id, workspaceId),
    docRepo.listByPatient(patient.id, workspaceId),
    financeRepo.listByPatient(patient.id, workspaceId),
  ]);
  const financialStatus = deriveFinancialStatus(charges);

  const summary = derivePatientSummaryFromAppointments({
    patientId: patient.id,
    appointments,
    financialStatus,
  });

  const clinicalRepo = getClinicalNoteRepository();
  const patientNotes = await clinicalRepo.listByPatient(patient.id, workspaceId);
  const notesByAppointment = new Map<string, string>();
  for (const note of patientNotes) {
    notesByAppointment.set(note.appointmentId, note.id);
  }

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
  const upcomingEntries = allEntries
    .filter((e) => (e.status === "SCHEDULED" || e.status === "CONFIRMED") && e.startsAt > now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 1);
  const completedEntries = allEntries.filter((e) => e.status === "COMPLETED");
  const dismissedEntries = allEntries.filter(
    (e) => e.status === "CANCELED" || e.status === "NO_SHOW",
  );

  const patientDisplayName = patient.socialName
    ? `${patient.fullName} (${patient.socialName})`
    : patient.fullName;

  return (
    <main style={shellStyle}>
      <nav className="breadcrumb">
        <Link href="/patients" className="breadcrumb-link">Pacientes</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{patient.fullName}</span>
      </nav>

      <PatientProfileTabs
        patient={patient}
        summary={summary}
        nextSessionDefaults={nextSessionDefaults}
        patientDisplayName={patientDisplayName}
        upcoming={upcomingEntries}
        completed={completedEntries}
        dismissed={dismissedEntries}
        activeDocuments={allDocuments}
        charges={charges}
        activeReminders={activeReminders}
        completedReminders={completedReminders}
        createReminderAction={createReminderAction}
        completeReminderAction={completeReminderAction}
        updateChargeAction={updateChargeAction}
        appointmentMap={appointmentMap}
      />
    </main>
  );
}

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1rem",
  alignContent: "start",
} satisfies React.CSSProperties;
