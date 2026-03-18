/**
 * AgendaDayView — primary operating surface.
 *
 * Renders the ordered list of appointment cards for a single calendar day.
 * Shows a calm empty state when no appointments exist for the day.
 *
 * Receives DayAgendaResult and a patient-name lookup so this component
 * never handles raw appointment or patient data directly.
 */

import type { DayAgendaResult } from "../../../../lib/appointments/agenda";
import { AppointmentCard } from "./appointment-card";
import { EmptyState } from "../../components/empty-state";

interface AgendaDayViewProps {
  day: DayAgendaResult;
  /** Resolves patientId to a display name — avoids loading full patient records here. */
  patientNames: Record<string, string>;
  /** Optional: slot for completed-appointment next-session actions (keyed by appointmentId). */
  nextSessionActions?: Record<string, React.ReactNode>;
}

export function AgendaDayView({ day, patientNames, nextSessionActions = {} }: AgendaDayViewProps) {
  if (day.cards.length === 0) {
    return (
      <div style={emptyStateContainerStyle}>
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          }
          title="Sua agenda está livre hoje"
          description="Nenhuma sessão agendada para este dia."
          actionLabel="Agendar sessão"
          actionHref="/appointments/new"
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardsListStyle}>
        {day.cards.map((card) => (
          <AppointmentCard
            key={card.appointmentId}
            card={card}
            patientDisplayName={patientNames[card.patientId] ?? "Paciente"}
            nextSessionAction={nextSessionActions[card.appointmentId]}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const containerStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const cardsListStyle = {
  display: "grid",
  gap: "0.65rem",
} satisfies React.CSSProperties;

const emptyStateContainerStyle = {
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;
