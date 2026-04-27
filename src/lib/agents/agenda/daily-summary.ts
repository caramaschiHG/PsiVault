import { isSameDay } from "date-fns";
import type { Appointment } from "../../appointments/model";

export interface DailySummaryInput {
  date: Date;
  workspaceId: string;
  accountId: string;
  noShowsDetected: number;
  remindersSent: number;
  suggestionsGenerated: number;
}

export interface DailySummaryOutput {
  title: string;
  description: string;
  dateLabel: string;
}

export function generateDailySummary(input: DailySummaryInput): DailySummaryOutput {
  const dateLabel = input.date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });
  const parts: string[] = [];
  if (input.noShowsDetected > 0) {
    parts.push(`${input.noShowsDetected} falta${input.noShowsDetected > 1 ? "s" : ""} detectada${input.noShowsDetected > 1 ? "s" : ""}`);
  }
  if (input.remindersSent > 0) {
    parts.push(`${input.remindersSent} lembrete${input.remindersSent > 1 ? "s" : ""} enviado${input.remindersSent > 1 ? "s" : ""}`);
  }
  if (input.suggestionsGenerated > 0) {
    parts.push(`${input.suggestionsGenerated} sugestão${input.suggestionsGenerated > 1 ? "s" : ""} de horário gerada${input.suggestionsGenerated > 1 ? "s" : ""}`);
  }
  const description = parts.length > 0 ? parts.join(" · ") : "Nenhuma atividade da agenda hoje.";
  return {
    title: `Resumo do dia — ${dateLabel}`,
    description,
    dateLabel,
  };
}

export function isLastAppointmentOfDay(
  completedAppointment: Appointment,
  allTodayAppointments: Appointment[],
): boolean {
  const today = completedAppointment.startsAt;
  const laterToday = allTodayAppointments.filter(
    (a) =>
      isSameDay(a.startsAt, today) &&
      a.startsAt > completedAppointment.startsAt &&
      (a.status === "SCHEDULED" || a.status === "CONFIRMED"),
  );
  return laterToday.length === 0;
}

export function buildDailySummaryIdempotencyKey(
  workspaceId: string,
  accountId: string,
  date: Date,
): string {
  const dateKey = date.toISOString().slice(0, 10);
  return `agenda:daily-summary:${workspaceId}:${accountId}:${dateKey}`;
}
