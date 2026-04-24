"use client";

import { useActionState } from "react";
import { addRemoteIssueNoteAction } from "../../appointments/actions";
import { SubmitButton } from "@/components/ui/submit-button";

interface RemoteIssueFormProps {
  appointmentId: string;
  remoteIssueNote: string | null;
  inlineFormStyle?: React.CSSProperties;
  textareaStyle?: React.CSSProperties;
}

export function RemoteIssueForm({
  appointmentId,
  remoteIssueNote,
  inlineFormStyle,
  textareaStyle,
}: RemoteIssueFormProps) {
  const [state, formAction] = useActionState(addRemoteIssueNoteAction, null);

  return (
    <div style={{ display: "grid", gap: "0.25rem" }}>
      <form action={formAction} style={inlineFormStyle}>
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <textarea
          name="remoteIssueNote"
          defaultValue={remoteIssueNote ?? ""}
          placeholder="Descreva o problema..."
          className={state?.error ? "input-error input-error-shake" : ""}
          style={textareaStyle}
          onAnimationEnd={(e) => {
            if (e.animationName === "inputShake") {
              e.currentTarget.classList.remove("input-error-shake");
            }
          }}
        />
        <SubmitButton label="Registrar" pendingLabel="Registrando..." />
      </form>
      {state?.success && (
        <span style={successStyle}>✓ Registrado</span>
      )}
      {state?.error && (
        <span style={errorStyle}>{state.error}</span>
      )}
    </div>
  );
}

const successStyle = {
  fontSize: "0.8rem",
  color: "var(--color-forest)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const errorStyle = {
  fontSize: "0.8rem",
  color: "var(--color-rose)",
  fontWeight: 500,
} satisfies React.CSSProperties;
