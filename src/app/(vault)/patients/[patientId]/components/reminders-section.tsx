"use client";

/**
 * RemindersSection — patient-scoped reminder surface on the patient profile.
 *
 * Renders:
 * - List of active reminders for this patient with "Concluir" action
 * - Inline creation form (title + optional due date + hidden patientId)
 * - Collapsible "Concluídas" disclosure showing completion history (never deleted)
 *
 * Receives server actions as props following the Phase 3-02 pattern:
 * server actions are collocated with the route and passed down as props
 * to keep this component presentational and free of import side effects.
 */

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { Reminder } from "../../../../../lib/reminders/model";

interface RemindersSectionProps {
  activeReminders: Reminder[];
  completedReminders: Reminder[];
  createReminderAction: (prevState: { success: boolean } | null, formData: FormData) => Promise<{ success: boolean }>;
  completeReminderAction: (reminderId: string) => Promise<void>;
  patientId: string;
}

export function RemindersSection({
  activeReminders,
  completedReminders,
  createReminderAction,
  completeReminderAction,
  patientId,
}: RemindersSectionProps) {
  const [completedOpen, setCompletedOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [, formAction] = useActionState(createReminderAction, null);

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  function handleComplete(reminderId: string) {
    startTransition(async () => {
      await completeReminderAction(reminderId);
    });
  }

  return (
    <section style={sectionStyle}>
      <div style={sectionHeadingStyle}>
        <p style={eyebrowStyle}>Paciente</p>
        <h2 style={sectionTitleStyle}>Lembretes</h2>
      </div>

      {/* Active reminders list */}
      {activeReminders.length === 0 ? (
        <p style={emptyStateTextStyle}>Tudo em dia! Nenhum lembrete ativo para este paciente.</p>
      ) : (
        <ul style={cardListStyle}>
          {activeReminders.map((reminder) => (
            <li key={reminder.id} style={reminderCardStyle}>
              <div style={reminderInfoStyle}>
                <span style={reminderTitleStyle}>{reminder.title}</span>
                {reminder.dueAt && (
                  <span style={reminderDueDateStyle}>
                    Prazo: {dateFormatter.format(reminder.dueAt)}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => handleComplete(reminder.id)}
                isLoading={isPending}
                loadingLabel="..."
                size="sm"
              >
                Concluir
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* New reminder inline form */}
      <div style={newReminderFormContainerStyle}>
        <p style={newReminderFormLabelStyle}>Novo lembrete</p>
        <form action={formAction} style={newReminderFormStyle}>
          {/* Hidden patient link — createReminderAction reads patientId to set link.type="patient" */}
          <input type="hidden" name="patientId" value={patientId} />
          <input
            type="text"
            name="title"
            placeholder="Título do lembrete"
            required
            style={titleInputStyle}
          />
          <input
            type="date"
            name="dueAt"
            style={dateInputStyle}
          />
          <Button type="submit" variant="primary" size="sm">
            Adicionar
          </Button>
        </form>
      </div>

      {/* Collapsible completed reminders */}
      {completedReminders.length > 0 && (
        <div style={completedSectionStyle}>
          <button
            type="button"
            onClick={() => setCompletedOpen((prev) => !prev)}
            className="btn-ghost"
            style={{ fontSize: "0.82rem" }}
          >
            {completedOpen ? "▲" : "▶"} Concluídas ({completedReminders.length})
          </button>

          {completedOpen && (
            <ul style={completedListStyle}>
              {completedReminders.map((reminder) => (
                <li key={reminder.id} style={completedCardStyle}>
                  <span style={completedTitleStyle}>{reminder.title}</span>
                  {reminder.completedAt && (
                    <span style={completedAtStyle}>
                      Concluído em {dateFormatter.format(reminder.completedAt)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sectionStyle = {
  padding: "1.35rem 1.5rem",
  borderRadius: "var(--radius-lg)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const sectionHeadingStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const sectionTitleStyle = {
  margin: 0,
  fontSize: "1.15rem",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const emptyStateTextStyle = {
  margin: 0,
  fontSize: "0.9rem",
  color: "var(--color-text-3)",
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
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border-med)",
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
  fontSize: "0.78rem",
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

const titleInputStyle = {
  flex: 1,
  minWidth: "12rem",
  padding: "0.4rem 0.6rem",
  fontSize: "0.88rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-0)",
} satisfies React.CSSProperties;

const dateInputStyle = {
  padding: "0.4rem 0.6rem",
  fontSize: "0.88rem",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-0)",
} satisfies React.CSSProperties;

const completedSectionStyle = {
  paddingTop: "0.5rem",
  borderTop: "1px solid var(--color-border)",
  display: "grid",
  gap: "0.5rem",
} satisfies React.CSSProperties;

const completedListStyle = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: "0.4rem",
} satisfies React.CSSProperties;

const completedCardStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  padding: "0.6rem 0.875rem",
  borderRadius: "var(--radius-sm)",
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-med)",
} satisfies React.CSSProperties;

const completedTitleStyle = {
  fontSize: "0.88rem",
  color: "var(--color-text-3)",
  flex: 1,
  textDecoration: "line-through",
  textDecorationColor: "var(--color-border-med)",
} satisfies React.CSSProperties;

const completedAtStyle = {
  fontSize: "0.75rem",
  color: "var(--color-text-4)",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;
