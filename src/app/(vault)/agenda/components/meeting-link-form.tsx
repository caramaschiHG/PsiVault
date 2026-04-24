"use client";

import { useActionState } from "react";
import { editMeetingLinkAction } from "../../appointments/actions";
import { SubmitButton } from "@/components/ui/submit-button";

interface MeetingLinkFormProps {
  appointmentId: string;
  meetingLink: string | null;
  urlInputStyle?: React.CSSProperties;
  inlineFormStyle?: React.CSSProperties;
}

export function MeetingLinkForm({
  appointmentId,
  meetingLink,
  urlInputStyle,
  inlineFormStyle,
}: MeetingLinkFormProps) {
  const [state, formAction] = useActionState(editMeetingLinkAction, null);

  return (
    <div style={{ display: "grid", gap: "0.25rem" }}>
      <form action={formAction} style={inlineFormStyle}>
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <input
          type="url"
          name="meetingLink"
          defaultValue={meetingLink ?? ""}
          placeholder="https://meet.google.com/..."
          className={state?.error ? "input-error input-error-shake" : ""}
          style={urlInputStyle}
          onAnimationEnd={(e) => {
            if (e.animationName === "inputShake") {
              e.currentTarget.classList.remove("input-error-shake");
            }
          }}
        />
        <SubmitButton label="Salvar link" pendingLabel="Salvando..." />
      </form>
      {state?.success && (
        <span style={successStyle}>✓ Link salvo</span>
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
