"use client";

import { useActionState, useEffect, useRef } from "react";
import { createReminderAction, completeReminderAction } from "../../actions/reminders";
import { SubmitButton } from "@/components/ui/submit-button";

interface SerializedReminder {
  id: string;
  title: string;
  dueAt: string | null; // ISO string or null
}

interface RemindersSectionProps {
  reminders: SerializedReminder[];
  workspaceId: string;
}

export function RemindersSection({ reminders, workspaceId }: RemindersSectionProps) {
  const [state, formAction] = useActionState(createReminderAction, null);
  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  // Clear inputs after successful creation
  useEffect(() => {
    if (state?.success) {
      if (titleRef.current) titleRef.current.value = "";
      if (dateRef.current) dateRef.current.value = "";
    }
  }, [state]);

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <>
      {reminders.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={emptyStateTextStyle}>Nenhum lembrete ativo.</p>
        </div>
      ) : (
        <ul style={cardListStyle}>
          {reminders.map((reminder) => (
            <li key={reminder.id} style={reminderCardStyle}>
              <div style={reminderInfoStyle}>
                <span style={reminderTitleStyle}>{reminder.title}</span>
                {reminder.dueAt && (
                  <span style={reminderDueDateStyle}>
                    Prazo: {dateFormatter.format(new Date(reminder.dueAt))}
                  </span>
                )}
              </div>
              <form action={completeReminderAction.bind(null, reminder.id)}>
                <SubmitButton
                  label="Concluir"
                  pendingLabel="..."
                  variant="ghost"
                />
              </form>
            </li>
          ))}
        </ul>
      )}

      {/* Novo lembrete inline form */}
      <div style={newReminderFormContainerStyle}>
        <p style={newReminderFormLabelStyle}>Novo lembrete</p>
        <form action={formAction} style={newReminderFormStyle}>
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <input
            ref={titleRef}
            type="text"
            name="title"
            placeholder="Título do lembrete"
            required
            className="input-field"
            style={reminderTitleInputStyle}
          />
          <input
            ref={dateRef}
            type="date"
            name="dueAt"
            className="input-field"
            style={reminderDateInputStyle}
          />
          <SubmitButton label="Adicionar" pendingLabel="Adicionando..." className="btn-primary" />
        </form>
      </div>
    </>
  );
}

const emptyStateStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "1rem",
  borderRadius: "var(--radius-md)",
  background: "rgba(245, 245, 244, 0.5)",
} satisfies React.CSSProperties;

const emptyStateTextStyle = {
  margin: 0,
  fontSize: "0.88rem",
  color: "var(--color-text-3)",
  flex: 1,
} satisfies React.CSSProperties;

const cardListStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const reminderCardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  borderRadius: "var(--radius-md)",
  background: "rgba(255, 247, 237, 0.6)",
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const reminderInfoStyle = {
  display: "grid",
  gap: "0.15rem",
  flex: 1,
} satisfies React.CSSProperties;

const reminderTitleStyle = {
  fontSize: "0.9rem",
  fontWeight: 500,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const reminderDueDateStyle = {
  fontSize: "0.78rem",
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const newReminderFormContainerStyle = {
  paddingTop: "0.75rem",
  borderTop: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const newReminderFormLabelStyle = {
  margin: 0,
  fontSize: "0.72rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const newReminderFormStyle = {
  display: "flex",
  gap: "0.5rem",
  alignItems: "center",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const reminderTitleInputStyle = {
  flex: 1,
  minWidth: "12rem",
} satisfies React.CSSProperties;

const reminderDateInputStyle = {
  minWidth: "9rem",
} satisfies React.CSSProperties;
