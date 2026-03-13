/**
 * New appointment page — creates a single appointment with optional prefill.
 *
 * Entry points:
 * - QuickNextSessionCard on patient profile (via /appointments/new?patientId=...&...)
 * - CompletedAppointmentNextSessionAction in agenda (same query-param contract)
 * - "Nova consulta" button in agenda toolbar (no params — full blank form)
 *
 * Query params (all optional strings — parsed defensively, never crash):
 * - patientId       → pre-selects patient in the form
 * - durationMinutes → positive integer; falls back to profile default (50 min)
 * - careMode        → "IN_PERSON" | "ONLINE"; falls back to profile service mode
 * - priceInCents    → informational only; reserved for Phase 5 finance domain
 *
 * Design decisions:
 * - No priceInCents prop passed to AppointmentForm — form does not accept it.
 * - WORKSPACE_ID and ACCOUNT_ID are deliberate stubs consistent with the rest
 *   of the vault. Real resolution comes from session in production.
 */

import Link from "next/link";
import { getPatientRepository } from "../../../../lib/patients/store";
import { getPracticeProfileSnapshot } from "../../../../lib/setup/profile";
import { AppointmentForm } from "../components/appointment-form";

// Stub — real workspace/account resolution comes from session in production
const WORKSPACE_ID = "ws_1";
const ACCOUNT_ID = "acct_1";

interface NewAppointmentPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function NewAppointmentPage({
  searchParams,
}: NewAppointmentPageProps) {
  const params = await searchParams;

  // Load data
  const patientRepo = getPatientRepository();
  const patients = patientRepo.listActive(WORKSPACE_ID);
  const profile = getPracticeProfileSnapshot(ACCOUNT_ID, WORKSPACE_ID);

  // Resolve defaultCareMode: use param if valid, otherwise derive from profile
  const rawCareMode = params.careMode;
  const defaultCareMode: "IN_PERSON" | "ONLINE" =
    rawCareMode === "IN_PERSON" || rawCareMode === "ONLINE"
      ? rawCareMode
      : profile.serviceModes.includes("online") &&
          !profile.serviceModes.includes("in_person")
        ? "ONLINE"
        : "IN_PERSON";

  // Resolve defaultDurationMinutes: use param if positive integer, else profile default
  const rawDuration = params.durationMinutes;
  const parsedDuration =
    rawDuration !== undefined ? parseInt(rawDuration, 10) : NaN;
  const defaultDurationMinutes =
    Number.isFinite(parsedDuration) && parsedDuration > 0
      ? parsedDuration
      : (profile.defaultAppointmentDurationMinutes ?? 50);

  // Resolve defaultPatientId: use param if non-empty, otherwise undefined
  const defaultPatientId =
    params.patientId && params.patientId.trim().length > 0
      ? params.patientId.trim()
      : undefined;

  return (
    <main style={shellStyle}>
      {/* Navigation breadcrumb / back link */}
      <nav style={navStyle}>
        <Link href="/agenda" style={navLinkStyle}>
          Agenda
        </Link>
        <span style={navSepStyle}>/</span>
        <span style={navCurrentStyle}>Nova consulta</span>
      </nav>

      {/* Page heading */}
      <div style={headingRowStyle}>
        <div style={headingTextStyle}>
          <p style={eyebrowStyle}>Consultas</p>
          <h1 style={titleStyle}>Nova consulta</h1>
        </div>
      </div>

      {/* Booking form with prefilled defaults */}
      <AppointmentForm
        patients={patients}
        defaultPatientId={defaultPatientId}
        defaultDurationMinutes={defaultDurationMinutes}
        defaultCareMode={defaultCareMode}
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
  maxWidth: "1100px",
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

const headingRowStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const headingTextStyle = {
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
