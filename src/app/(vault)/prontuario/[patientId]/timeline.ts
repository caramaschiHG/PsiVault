import type { Appointment } from "@/lib/appointments/model";
import type { ClinicalNote } from "@/lib/clinical/model";

export interface TimelineData {
  upcoming: Appointment | null;
  completedVisible: Appointment[];
  completedHidden: Appointment[];
  dismissedAll: Appointment[];
}

export function buildTimeline(appointments: Appointment[], now: Date): TimelineData {
  const upcoming =
    appointments
      .filter(
        (a) =>
          (a.status === "SCHEDULED" || a.status === "CONFIRMED") &&
          a.startsAt > now,
      )
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
      .at(0) ?? null;

  const completedSorted = appointments
    .filter((a) => a.status === "COMPLETED")
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

  const dismissedAll = appointments
    .filter((a) => a.status === "CANCELED" || a.status === "NO_SHOW")
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());

  return {
    upcoming,
    completedVisible: completedSorted.slice(0, 5),
    completedHidden: completedSorted.slice(5),
    dismissedAll,
  };
}

export function buildNotesByAppointment(notes: ClinicalNote[]): Map<string, ClinicalNote> {
  return new Map(notes.map((n) => [n.appointmentId, n]));
}

export function hasNotes(latestNote: ClinicalNote | null): boolean {
  return latestNote !== null;
}
