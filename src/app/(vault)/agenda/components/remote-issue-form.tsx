"use client";

import { useActionState } from "react";
import { addRemoteIssueNoteAction } from "../../appointments/actions";
import { SubmitButton } from "@/components/ui/submit-button";

interface RemoteIssueFormProps {
  appointmentId: string;
  remoteIssueNote: string | null;
  inlineFormStyle?: React.CSSProperties;
  textareaStyle?: React.CSSProperties;
  submitButtonStyle?: React.CSSProperties;
}

export function RemoteIssueForm({
  appointmentId,
  remoteIssueNote,
  inlineFormStyle,
  textareaStyle,
  submitButtonStyle,
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
          style={textareaStyle}
        />
        <SubmitButton label="Registrar" pendingLabel="Registrando..." style={submitButtonStyle} />
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
  color: "#2d6a4f",
  fontWeight: 600,
} satisfies React.CSSProperties;

const errorStyle = {
  fontSize: "0.8rem",
  color: "#9f1239",
  fontWeight: 500,
} satisfies React.CSSProperties;
