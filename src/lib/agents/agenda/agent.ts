import type { Agent, AgentTask } from "../model";
import { batchRemindersForDay, MockReminderSender } from "./reminder-sender";
import { getPatientAttendanceBySlot, getTopSuggestions } from "./schedule-optimizer";

/**
 * Create the Agenda Agent that handles background tasks for:
 * - no_show_detection   (Plan 44-02)
 * - reminder_batch      (Plan 44-03)
 * - schedule_suggestion (Plan 44-03)
 * - daily_summary       (Plan 44-04)
 */
export function createAgendaAgent(): Agent {
  return {
    id: "agenda",
    name: "Agente de Agenda",
    description: "Detecta padrões de faltas, envia lembretes e sugere otimizações de horários.",
    defaultPriority: "medium",
    version: "1.0.0",
    capabilities: ["no_show_detection", "reminder_batching", "schedule_suggestion", "daily_summary"],

    async executeTask(task: AgentTask) {
      switch (task.type) {
        case "no_show_detection": {
          return { status: "SKIPPED", errorNote: "Not yet implemented — Plan 44-02" };
        }

        case "reminder_batch": {
          const { workspaceId, date } = task.payload as { workspaceId: string; date: string };
          const { getAppointmentRepository } = await import("../../appointments/store");
          const { getPatientRepository } = await import("../../patients/store");
          const { PrismaClient } = await import("@prisma/client");

          const result = await batchRemindersForDay(
            workspaceId,
            new Date(date),
            {
              listByDateRange: (ws, from, to) => getAppointmentRepository().listByDateRange(ws, from, to),
              findPatientById: (id, ws) => getPatientRepository().findById(id, ws),
              sender: new MockReminderSender(),
            },
          );
          return { status: "DONE", output: { sent: result.sent, failed: result.failed } };
        }

        case "schedule_suggestion": {
          const { patientId, workspaceId } = task.payload as { patientId: string; workspaceId: string };
          const { PrismaClient } = await import("@prisma/client");
          const prisma = new PrismaClient();
          const slots = await getPatientAttendanceBySlot(prisma, patientId, workspaceId);
          await prisma.$disconnect();
          return { status: "DONE", output: { suggestions: getTopSuggestions(slots) } };
        }

        case "daily_summary": {
          return { status: "SKIPPED", errorNote: "Not yet implemented — Plan 44-04" };
        }

        default: {
          return { status: "ERROR", errorNote: `Unknown task type: ${task.type}` };
        }
      }
    },
  };
}
