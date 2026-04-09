"use client";

/**
 * AppointmentQuickActions — inline action buttons rendered on agenda cards.
 *
 * Exposes confirm, complete, no-show, and cancel directly on the card so the
 * professional doesn't need to navigate to a separate page. Cancel in a
 * recurring series opens an inline scope selector before confirming.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  confirmAppointmentAction,
  completeAppointmentAction,
  noShowAppointmentAction,
  cancelAppointmentAction,
} from "../../appointments/actions";
import { RecurrenceScopeDialog } from "../../appointments/components/recurrence-scope-dialog";
import { useToast } from "../../../../components/ui/toast-provider";
import type { AppointmentStatus } from "../../../../lib/appointments/model";

interface AppointmentQuickActionsProps {
  appointmentId: string;
  status: AppointmentStatus;
  seriesId: string | null;
}

export function AppointmentQuickActions({
  appointmentId,
  status,
  seriesId,
}: AppointmentQuickActionsProps) {
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [patientRecordEntry, setPatientRecordEntry] = useState("");
  const [showCancelScope, setShowCancelScope] = useState(false);
  const [canceledBy, setCanceledBy] = useState<"PATIENT" | "THERAPIST">("THERAPIST");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  if (status !== "SCHEDULED" && status !== "CONFIRMED") return null;

  if (showCancelScope) {
    return (
      <div style={cancelScopeContainerStyle}>
        <form
          action={(formData) => {
            startTransition(async () => {
              const isSeries = formData.get("recurrenceScope") !== "THIS";
              const result = await cancelAppointmentAction(formData);
              if (result.success) {
                toast(isSeries ? "Série cancelada" : "Consulta cancelada");
                router.refresh();
              } else {
                toast(result.error ?? "Erro ao cancelar consulta", "error");
              }
            });
          }}
        >
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <input type="hidden" name="canceledBy" value={canceledBy} />
          {seriesId ? (
            <RecurrenceScopeDialog defaultScope="THIS" verb="cancelar" />
          ) : (
            <input type="hidden" name="recurrenceScope" value="THIS" />
          )}
          <div style={cancelActionsStyle}>
            <button
              type="submit"
              disabled={isPending}
              style={cancelConfirmBtnStyle}
            >
              {isPending ? "Cancelando…" : (canceledBy === "PATIENT" ? "Paciente cancelou" : "Cancelei")}
            </button>
            <button
              type="button"
              onClick={() => setShowCancelScope(false)}
              style={cancelDismissBtnStyle}
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (showCompleteForm) {
    return (
      <div style={completeContainerStyle}>
        <form
          action={(formData) => {
            startTransition(async () => {
              const result = await completeAppointmentAction(formData);
              if (result.success) {
                toast("Consulta concluída");
                setShowCompleteForm(false);
                setPatientRecordEntry("");
                router.refresh();
              } else {
                toast(result.error ?? "Erro ao concluir consulta", "error");
              }
            });
          }}
          style={completeFormStyle}
        >
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <label htmlFor={`patient-record-entry-${appointmentId}`} style={completeLabelStyle}>
            Registro para prontuário
          </label>
          <textarea
            id={`patient-record-entry-${appointmentId}`}
            name="patientRecordEntry"
            value={patientRecordEntry}
            onChange={(event) => setPatientRecordEntry(event.target.value)}
            rows={4}
            required
            placeholder="Escreva o registro clínico que deve entrar no prontuário."
            style={completeTextareaStyle}
          />
          <div style={cancelActionsStyle}>
            <button type="submit" disabled={isPending} style={completeConfirmBtnStyle}>
              {isPending ? "Concluindo…" : "Salvar e concluir"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCompleteForm(false);
                setPatientRecordEntry("");
              }}
              style={cancelDismissBtnStyle}
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={rowStyle}>
      {status === "SCHEDULED" && (
        <form
          action={(formData) => {
            startTransition(async () => {
              const result = await confirmAppointmentAction(formData);
              if (result.success) {
                toast("Consulta confirmada");
                router.refresh();
              } else {
                toast(result.error ?? "Erro ao confirmar consulta", "error");
              }
            });
          }}
          style={inlineFormStyle}
        >
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <button type="submit" disabled={isPending} style={confirmBtnStyle}>
            Confirmar
          </button>
        </form>
      )}

      <form
        style={inlineFormStyle}
      >
        <button
          type="button"
          disabled={isPending}
          style={completeBtnStyle}
          onClick={() => setShowCompleteForm(true)}
        >
          Concluir
        </button>
      </form>

      <form
        action={(formData) => {
          startTransition(async () => {
            const result = await noShowAppointmentAction(formData);
            if (result.success) {
              toast("Não comparecimento registrado");
              router.refresh();
            } else {
              toast(result.error ?? "Erro ao registrar não comparecimento", "error");
            }
          });
        }}
        style={inlineFormStyle}
      >
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <button type="submit" disabled={isPending} style={noShowBtnStyle}>
          Não compareceu
        </button>
      </form>

      <button
        type="button"
        onClick={() => { setCanceledBy("PATIENT"); setShowCancelScope(true); }}
        style={cancelBtnStyle}
        disabled={isPending}
      >
        Paciente cancelou
      </button>
      <button
        type="button"
        onClick={() => { setCanceledBy("THERAPIST"); setShowCancelScope(true); }}
        style={cancelBtnStyle}
        disabled={isPending}
      >
        Cancelei
      </button>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const rowStyle = {
  display: "flex",
  gap: "0.4rem",
  flexWrap: "wrap" as const,
  alignItems: "center",
} satisfies React.CSSProperties;

const inlineFormStyle = {
  display: "contents",
} satisfies React.CSSProperties;

const baseBtnStyle = {
  padding: "0.28rem 0.7rem",
  borderRadius: "8px",
  border: "1px solid",
  fontSize: "0.78rem",
  fontWeight: 600,
  cursor: "pointer",
  background: "transparent",
  lineHeight: 1.5,
} satisfies React.CSSProperties;

const confirmBtnStyle = {
  ...baseBtnStyle,
  color: "var(--color-forest)",
  borderColor: "rgba(45, 106, 79, 0.35)",
} satisfies React.CSSProperties;

const completeBtnStyle = {
  ...baseBtnStyle,
  color: "var(--color-warning-text)",
  borderColor: "rgba(146, 64, 14, 0.3)",
} satisfies React.CSSProperties;

const noShowBtnStyle = {
  ...baseBtnStyle,
  color: "var(--color-rose)",
  borderColor: "rgba(159, 18, 57, 0.3)",
} satisfies React.CSSProperties;

const cancelBtnStyle = {
  ...baseBtnStyle,
  color: "var(--color-slate)",
  borderColor: "rgba(100, 116, 139, 0.3)",
} satisfies React.CSSProperties;

const cancelScopeContainerStyle = {
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const completeContainerStyle = {
  display: "grid",
  gap: "0.75rem",
  padding: "0.8rem",
  borderRadius: "14px",
  background: "rgba(255, 252, 247, 0.95)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
} satisfies React.CSSProperties;

const completeFormStyle = {
  display: "grid",
  gap: "0.6rem",
} satisfies React.CSSProperties;

const completeLabelStyle = {
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--color-warm-brown)",
} satisfies React.CSSProperties;

const completeTextareaStyle = {
  width: "100%",
  padding: "0.75rem 0.9rem",
  borderRadius: "12px",
  border: "1px solid rgba(146, 64, 14, 0.16)",
  background: "rgba(255,255,255,0.98)",
  fontSize: "0.85rem",
  lineHeight: 1.6,
  resize: "vertical" as const,
  color: "var(--color-text-1)",
  boxSizing: "border-box" as const,
  fontFamily: "inherit",
} satisfies React.CSSProperties;

const cancelActionsStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap" as const,
  paddingTop: "0.25rem",
} satisfies React.CSSProperties;

const cancelConfirmBtnStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "10px",
  border: "1px solid rgba(159, 18, 57, 0.3)",
  background: "transparent",
  color: "var(--color-rose)",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const completeConfirmBtnStyle = {
  ...cancelConfirmBtnStyle,
  color: "var(--color-warning-text)",
  borderColor: "rgba(146, 64, 14, 0.28)",
} satisfies React.CSSProperties;

const cancelDismissBtnStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "10px",
  border: "1px solid rgba(100, 116, 139, 0.25)",
  background: "transparent",
  color: "var(--color-slate)",
  fontWeight: 500,
  fontSize: "0.85rem",
  cursor: "pointer",
} satisfies React.CSSProperties;
