import type { Agent, AgentTask } from "../model";

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
          return { status: "SKIPPED", errorNote: "Not yet implemented — Plan 44-03" };
        }

        case "schedule_suggestion": {
          return { status: "SKIPPED", errorNote: "Not yet implemented — Plan 44-03" };
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
