/**
 * CompletedAppointmentNextSessionAction — entry point for quick next-session
 * creation directly from a completed appointment in the agenda.
 *
 * Uses the shared next-session defaults contract from
 * src/lib/appointments/defaults.ts to prefill patient, duration, care mode,
 * and price — but leaves date and time empty so the professional chooses the
 * new slot intentionally.
 *
 * Renders only when the appointment status is COMPLETED.
 * Wired to the appointment booking form with prefilled query params.
 */

import Link from "next/link";
import type { NextSessionDefaults } from "../../../../lib/appointments/defaults";

interface CompletedAppointmentNextSessionActionProps {
  appointmentId: string;
  defaults: NextSessionDefaults;
}

export function CompletedAppointmentNextSessionAction({
  appointmentId: _appointmentId,
  defaults,
}: CompletedAppointmentNextSessionActionProps) {
  // Build query params from defaults — date/time left empty intentionally
  const params = new URLSearchParams();
  params.set("patientId", defaults.patientId);
  if (defaults.durationMinutes !== undefined) {
    params.set("durationMinutes", String(defaults.durationMinutes));
  }
  if (defaults.careMode !== undefined) {
    params.set("careMode", defaults.careMode);
  }
  if (defaults.priceInCents !== undefined) {
    params.set("priceInCents", String(defaults.priceInCents));
  }

  const href = `/appointments/new?${params.toString()}`;

  return (
    <Link href={href} style={actionLinkStyle}>
      Agendar próxima sessão
    </Link>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const actionLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.48rem 1rem",
  borderRadius: "var(--radius-md)",
  background: "rgba(255, 247, 237, 0.9)",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  color: "var(--color-warning-text)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.85rem",
} satisfies React.CSSProperties;
