"use client";

/**
 * PatientClinicoTab — "Clínico" tab content.
 * Shows: clinical timeline.
 */

import { ClinicalTimeline } from "./clinical-timeline";

interface TimelineEntry {
  appointmentId: string;
  startsAt: Date;
  durationMinutes: number;
  careMode: "IN_PERSON" | "ONLINE";
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  sessionNumber: number | null;
  hasNote: boolean;
  noteId: string | null;
}

interface PatientClinicoTabProps {
  patientId: string;
  upcoming: TimelineEntry[];
  completed: TimelineEntry[];
  dismissed: TimelineEntry[];
  patientName: string;
  patientPhone: string | null;
}

export function PatientClinicoTab({
  patientId,
  upcoming,
  completed,
  dismissed,
  patientName,
  patientPhone,
}: PatientClinicoTabProps) {
  return (
    <ClinicalTimeline
      patientId={patientId}
      upcoming={upcoming}
      completed={completed}
      dismissed={dismissed}
      patientName={patientName}
      patientPhone={patientPhone}
    />
  );
}
