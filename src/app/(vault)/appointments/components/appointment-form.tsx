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

import { useState, useActionState, useEffect } from "react";
import type { Appointment } from "../../../../lib/appointments/model";
import type { Patient } from "../../../../lib/patients/model";
import { createAppointmentAction } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";

interface AppointmentFormProps {
  /** Available active patients for the select. */
  patients: Pick<Patient, "id" | "fullName" | "socialName">[];
  /** Workspace id used for conflict detection. */
  workspaceId: string;
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
  workspaceId,
  defaultPatientId,
  defaultDurationMinutes = 50,
  defaultCareMode = "IN_PERSON",
  original,
}: AppointmentFormProps) {
  const isReschedule = Boolean(original);
  const [recurrenceType, setRecurrenceType] = useState<"none" | "weekly" | "biweekly" | "twice_weekly">("none");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [state, formAction, isPending] = useActionState(createAppointmentAction, null);
  const [startsAtValue, setStartsAtValue] = useState("");
  const [durationValue, setDurationValue] = useState(String(original?.durationMinutes ?? defaultDurationMinutes));
  const [conflict, setConflict] = useState<{ patientName: string; startsAt: string } | null>(null);

  useEffect(() => {
    if (!startsAtValue || !durationValue) {
      setConflict(null);
      return;
    }
    const parsed = new Date(startsAtValue);
    if (isNaN(parsed.getTime())) {
      setConflict(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          workspaceId,
          startsAt: parsed.toISOString(),
          durationMinutes: durationValue,
          ...(original?.id ? { excludeId: original.id } : {}),
        });
        const res = await fetch(`/api/appointments/check-conflict?${params}`);
        const data = await res.json();
        setConflict(data.hasConflict ? data.conflictingAppointment : null);
      } catch {
        setConflict(null);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [startsAtValue, durationValue, workspaceId, original?.id]);

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : prev.length < 2
          ? [...prev, day].sort((a, b) => a - b)
          : prev,
    );
  }

  return (
    <form action={formAction} style={formStyle}>
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
            value={startsAtValue}
            onChange={(e) => setStartsAtValue(e.target.value)}
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
              value={durationValue}
              onChange={(e) => setDurationValue(e.target.value)}
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
            <h2 style={sectionTitleStyle}>Recorrência</h2>
          </div>

          {recurrenceType !== "none" && (
            <input type="hidden" name="isRecurring" value="true" />
          )}
          {recurrenceType !== "none" && (
            <input type="hidden" name="recurrenceType" value={recurrenceType} />
          )}

          <label style={labelStyle}>
            Frequência
            <select
              style={selectStyle}
              value={recurrenceType}
              onChange={(e) => {
                setRecurrenceType(e.target.value as typeof recurrenceType);
                setSelectedDays([]);
              }}
            >
              <option value="none">Sessão única</option>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quinzenal (a cada 2 semanas)</option>
              <option value="twice_weekly">2× por semana</option>
            </select>
          </label>

          {recurrenceType === "twice_weekly" && (
            <>
              <input type="hidden" name="recurrenceDaysOfWeek" value={JSON.stringify(selectedDays)} />
              <div style={labelStyle}>
                <span>Dias da semana <span style={requiredMarkStyle}>*</span> (selecione 2)</span>
                <div style={daysRowStyle}>
                  {[
                    { label: "Dom", value: 0 },
                    { label: "Seg", value: 1 },
                    { label: "Ter", value: 2 },
                    { label: "Qua", value: 3 },
                    { label: "Qui", value: 4 },
                    { label: "Sex", value: 5 },
                    { label: "Sáb", value: 6 },
                  ].map(({ label, value }) => {
                    const isSelected = selectedDays.includes(value);
                    const isDisabled = !isSelected && selectedDays.length >= 2;
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => toggleDay(value)}
                        style={{
                          ...dayBtnStyle,
                          ...(isSelected ? dayBtnSelectedStyle : {}),
                          ...(isDisabled ? dayBtnDisabledStyle : {}),
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {recurrenceType !== "none" && (
            <>
              <input type="hidden" name="recurrenceCount" value="OPEN_ENDED" />
              <p style={recurrenceInfoStyle}>
                {recurrenceType === "weekly" && "Série semanal sem data de encerramento — 2 anos (104 sessões)."}
                {recurrenceType === "biweekly" && "Série quinzenal sem data de encerramento — 1 ano (52 sessões)."}
                {recurrenceType === "twice_weekly" && "Série 2× por semana sem data de encerramento — 1 ano (104 sessões)."}
                {" "}Para encerrar, cancele as sessões futuras pela agenda.
              </p>
            </>
          )}
        </section>
      )}

      {conflict && (
        <div style={conflictWarningStyle}>
          Conflito com sessão de {conflict.patientName} às{" "}
          {new Date(conflict.startsAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
          })}
        </div>
      )}

      {state?.error && (
        <p style={errorMessageStyle}>{state.error}</p>
      )}

      <div style={actionsStyle}>
        <SubmitButton
          label={isPending
            ? (isReschedule ? "Reagendando…" : "Criando…")
            : (isReschedule ? "Reagendar consulta" : "Criar consulta")}
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
  color: "var(--color-text-3)",
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

const daysRowStyle = {
  display: "flex",
  gap: "0.4rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const dayBtnStyle = {
  padding: "0.35rem 0.65rem",
  borderRadius: "10px",
  border: "1px solid rgba(120, 53, 15, 0.2)",
  background: "transparent",
  color: "var(--color-text-3)",
  fontWeight: 500,
  fontSize: "0.82rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const dayBtnSelectedStyle = {
  background: "#9a3412",
  color: "#fff7ed",
  borderColor: "#9a3412",
} satisfies React.CSSProperties;

const dayBtnDisabledStyle = {
  opacity: 0.4,
  cursor: "not-allowed",
} satisfies React.CSSProperties;

const recurrenceInfoStyle = {
  margin: 0,
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  background: "rgba(120, 53, 15, 0.05)",
  border: "1px solid rgba(120, 53, 15, 0.14)",
  color: "var(--color-text-3)",
  fontSize: "0.88rem",
  lineHeight: 1.6,
} satisfies React.CSSProperties;

const conflictWarningStyle = {
  margin: 0,
  padding: "0.75rem 1rem",
  borderRadius: "10px",
  background: "rgba(234, 179, 8, 0.1)",
  border: "1px solid rgba(234, 179, 8, 0.35)",
  fontSize: "0.875rem",
  color: "#713f12",
} satisfies React.CSSProperties;

const errorMessageStyle = {
  margin: 0,
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  background: "rgba(220, 38, 38, 0.06)",
  border: "1px solid rgba(220, 38, 38, 0.2)",
  color: "#b91c1c",
  fontSize: "0.9rem",
  fontWeight: 500,
} satisfies React.CSSProperties;
