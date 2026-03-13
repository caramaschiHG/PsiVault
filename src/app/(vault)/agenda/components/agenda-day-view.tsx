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
      <div style={emptyStateStyle}>
        <p style={emptyIconStyle}>📅</p>
        <p style={emptyTitleStyle}>Sem consultas</p>
        <p style={emptyCopyStyle}>Nenhuma consulta agendada para este dia.</p>
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

const emptyStateStyle = {
  padding: "3rem 2rem",
  borderRadius: "24px",
  background: "rgba(255, 252, 247, 0.7)",
  border: "1px solid rgba(146, 64, 14, 0.1)",
  textAlign: "center" as const,
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const emptyIconStyle = {
  margin: 0,
  fontSize: "2.2rem",
} satisfies React.CSSProperties;

const emptyTitleStyle = {
  margin: 0,
  fontWeight: 600,
  fontSize: "1.05rem",
  color: "#57534e",
} satisfies React.CSSProperties;

const emptyCopyStyle = {
  margin: 0,
  fontSize: "0.9rem",
  color: "#a8a29e",
} satisfies React.CSSProperties;
