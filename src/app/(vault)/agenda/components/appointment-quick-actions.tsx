"use client";

/**
 * AppointmentQuickActions — inline action buttons rendered on agenda cards.
 *
 * Exposes confirm, complete, no-show, and cancel directly on the card so the
 * professional doesn't need to navigate to a separate page. Cancel in a
 * recurring series opens an inline scope selector before confirming.
 */

import { useState, useTransition } from "react";
import {
  confirmAppointmentAction,
  completeAppointmentAction,
  noShowAppointmentAction,
  cancelAppointmentAction,
} from "../../appointments/actions";
import { RecurrenceScopeDialog } from "../../appointments/components/recurrence-scope-dialog";
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
  const [showCancelScope, setShowCancelScope] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (status !== "SCHEDULED" && status !== "CONFIRMED") return null;

  if (showCancelScope) {
    return (
      <div style={cancelScopeContainerStyle}>
        <form
          action={(formData) => {
            startTransition(() => cancelAppointmentAction(formData));
          }}
        >
          <input type="hidden" name="appointmentId" value={appointmentId} />
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
              {isPending ? "Cancelando…" : "Confirmar cancelamento"}
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

  return (
    <div style={rowStyle}>
      {status === "SCHEDULED" && (
        <form
          action={(formData) => {
            startTransition(() => confirmAppointmentAction(formData));
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
        action={(formData) => {
          startTransition(() => completeAppointmentAction(formData));
        }}
        style={inlineFormStyle}
      >
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <button type="submit" disabled={isPending} style={completeBtnStyle}>
          Concluir
        </button>
      </form>

      <form
        action={(formData) => {
          startTransition(() => noShowAppointmentAction(formData));
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
        onClick={() => setShowCancelScope(true)}
        style={cancelBtnStyle}
        disabled={isPending}
      >
        Cancelar
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
  color: "#2d6a4f",
  borderColor: "rgba(45, 106, 79, 0.35)",
} satisfies React.CSSProperties;

const completeBtnStyle = {
  ...baseBtnStyle,
  color: "#92400e",
  borderColor: "rgba(146, 64, 14, 0.3)",
} satisfies React.CSSProperties;

const noShowBtnStyle = {
  ...baseBtnStyle,
  color: "#9f1239",
  borderColor: "rgba(159, 18, 57, 0.3)",
} satisfies React.CSSProperties;

const cancelBtnStyle = {
  ...baseBtnStyle,
  color: "#64748b",
  borderColor: "rgba(100, 116, 139, 0.3)",
} satisfies React.CSSProperties;

const cancelScopeContainerStyle = {
  display: "grid",
  gap: "0.75rem",
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
  color: "#9f1239",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const cancelDismissBtnStyle = {
  padding: "0.5rem 1rem",
  borderRadius: "10px",
  border: "1px solid rgba(100, 116, 139, 0.25)",
  background: "transparent",
  color: "#64748b",
  fontWeight: 500,
  fontSize: "0.85rem",
  cursor: "pointer",
} satisfies React.CSSProperties;
