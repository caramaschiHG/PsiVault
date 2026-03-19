"use client";

/**
 * AppointmentForm — create or reschedule a single appointment.
 *
 * Follows the essentials-first pattern established in PatientForm:
 * - Patient and time slot are always visible.
 * - Duration and care mode show pre-filled defaults from practice profile.
 * - Recurrence is a secondary section, closed by default visually.
 *
 * Care mode is explicit: IN_PERSON or ONLINE only (HYBRID is a practice
 * setting, not a per-appointment value).
 */

import type { Appointment } from "../../../../lib/appointments/model";
import type { Patient } from "../../../../lib/patients/model";
import { createAppointmentAction } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";

interface AppointmentFormProps {
  /** Available active patients for the select. */
  patients: Pick<Patient, "id" | "fullName" | "socialName">[];
  /** Prefilled patient id (e.g., quick next-session from patient context). */
  defaultPatientId?: string;
  /** Prefilled duration in minutes from practice profile defaults. */
  defaultDurationMinutes?: number;
  /** Prefilled care mode from practice profile. */
  defaultCareMode?: "IN_PERSON" | "ONLINE";
  /** If provided, this is a reschedule — show original context. */
  original?: Appointment;
}

export function AppointmentForm({
  patients,
  defaultPatientId,
  defaultDurationMinutes = 50,
  defaultCareMode = "IN_PERSON",
  original,
}: AppointmentFormProps) {
  const isReschedule = Boolean(original);

  return (
    <form action={createAppointmentAction} style={formStyle}>
      {original && (
        <input name="rescheduledFromId" type="hidden" value={original.id} />
      )}

      {/* Section 1: Patient and time slot */}
      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <p style={eyebrowStyle}>Essenciais</p>
          <h2 style={sectionTitleStyle}>
            {isReschedule ? "Novo horário" : "Paciente e horário"}
          </h2>
        </div>

        {!isReschedule && (
          <label style={labelStyle}>
            Paciente <span style={requiredMarkStyle}>*</span>
            <select
              defaultValue={defaultPatientId ?? ""}
              name="patientId"
              required
              style={selectStyle}
            >
              <option disabled value="">
                Selecione um paciente
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.socialName ? `${p.fullName} (${p.socialName})` : p.fullName}
                </option>
              ))}
            </select>
          </label>
        )}

        {isReschedule && (
          <input name="patientId" type="hidden" value={original!.patientId} />
        )}

        <label style={labelStyle}>
          Data e hora <span style={requiredMarkStyle}>*</span>
          <input
            name="startsAt"
            required
            style={inputStyle}
            type="datetime-local"
          />
        </label>
      </section>

      {/* Section 2: Session details */}
      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <p style={eyebrowStyle}>Configurações da sessão</p>
          <h2 style={sectionTitleStyle}>Detalhes</h2>
        </div>

        <div className="form-grid">
          <label style={labelStyle}>
            Duração (minutos)
            <input
              defaultValue={original?.durationMinutes ?? defaultDurationMinutes}
              min={15}
              name="durationMinutes"
              step={5}
              style={inputStyle}
              type="number"
            />
          </label>

          <label style={labelStyle}>
            Modalidade
            <select
              defaultValue={original?.careMode ?? defaultCareMode}
              name="careMode"
              style={selectStyle}
            >
              <option value="IN_PERSON">Presencial</option>
              <option value="ONLINE">Online</option>
            </select>
          </label>
        </div>
      </section>

      {/* Section 3: Recurrence (create only, not shown for reschedule) */}
      {!isReschedule && (
        <section style={sectionStyle}>
          <div style={sectionHeadingStyle}>
            <p style={eyebrowStyle}>Opcional</p>
            <h2 style={sectionTitleStyle}>Recorrência semanal</h2>
            <p style={sectionCopyStyle}>
              Crie uma série de consultas semanais de uma vez. O dia da semana e
              o horário são mantidos para todas as ocorrências.
            </p>
          </div>

          <div className="form-grid">
            <label style={labelStyle}>
              <input
                name="isRecurring"
                style={{ width: "auto" }}
                type="checkbox"
                value="true"
              />
              &nbsp;Criar série semanal
            </label>

            <label style={labelStyle}>
              Número de sessões
              <input
                defaultValue={1}
                min={1}
                max={52}
                name="recurrenceCount"
                style={inputStyle}
                type="number"
              />
            </label>
          </div>
        </section>
      )}

      <div style={actionsStyle}>
        <SubmitButton
          label={isReschedule ? "Reagendar consulta" : "Criar consulta"}
          style={primaryButtonStyle}
        />
      </div>
    </form>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const formStyle = {
  display: "grid",
  gap: "1.5rem",
} satisfies React.CSSProperties;

const sectionStyle = {
  display: "grid",
  gap: "1rem",
  padding: "1.5rem",
  borderRadius: "24px",
  background: "rgba(255, 252, 247, 0.92)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  boxShadow: "0 8px 24px rgba(120, 53, 15, 0.06)",
} satisfies React.CSSProperties;

const sectionHeadingStyle = {
  display: "grid",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const sectionTitleStyle = {
  margin: 0,
  fontSize: "1.25rem",
} satisfies React.CSSProperties;

const sectionCopyStyle = {
  margin: 0,
  fontSize: "0.9rem",
  lineHeight: 1.6,
  color: "#78716c",
} satisfies React.CSSProperties;

const labelStyle = {
  display: "grid",
  gap: "0.42rem",
  fontWeight: 600,
  fontSize: "0.93rem",
} satisfies React.CSSProperties;

const requiredMarkStyle = {
  color: "#9a3412",
} satisfies React.CSSProperties;

const inputStyle = {
  borderRadius: "16px",
  border: "1px solid rgba(120, 53, 15, 0.16)",
  padding: "0.9rem 1rem",
  background: "#fffdfa",
  fontWeight: 400,
} satisfies React.CSSProperties;

const selectStyle = {
  ...inputStyle,
} satisfies React.CSSProperties;

const actionsStyle = {
  display: "flex",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const primaryButtonStyle = {
  border: 0,
  borderRadius: "16px",
  padding: "0.95rem 1.6rem",
  background: "#9a3412",
  color: "#fff7ed",
  fontWeight: 700,
  cursor: "pointer",
} satisfies React.CSSProperties;
