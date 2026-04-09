"use client";

/**
 * PatientOverviewTab — "Visão Geral" tab content.
 * Shows: summary cards, quick next session, reminders.
 */

import type { Patient } from "@/lib/patients/model";
import type { PatientOperationalSummary } from "@/lib/patients/summary";
import type { NextSessionDefaults } from "@/lib/appointments/defaults";
import type { Reminder } from "@/lib/reminders/model";
import { PatientSummaryCards } from "../../components/patient-summary-cards";
import { QuickNextSessionCard } from "../components/quick-next-session-card";
import { RemindersSection } from "../components/reminders-section";

interface PatientOverviewTabProps {
  patient: Patient;
  summary: PatientOperationalSummary;
  nextSessionDefaults: NextSessionDefaults;
  patientDisplayName: string;
  activeReminders: Reminder[];
  completedReminders: Reminder[];
  createReminderAction: any;
  completeReminderAction: any;
}

export function PatientOverviewTab({
  patient,
  summary,
  nextSessionDefaults,
  patientDisplayName,
  activeReminders,
  completedReminders,
  createReminderAction,
  completeReminderAction,
}: PatientOverviewTabProps) {
  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <PatientSummaryCards summary={summary} />
      <QuickNextSessionCard
        defaults={nextSessionDefaults}
        patientDisplayName={patientDisplayName}
      />
      <RemindersSection
        activeReminders={activeReminders}
        completedReminders={completedReminders}
        createReminderAction={createReminderAction}
        completeReminderAction={completeReminderAction}
        patientId={patient.id}
      />
    </div>
  );
}
