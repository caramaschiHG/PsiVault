import type { AgentTask } from "./model";

export type AgentAuditEventType =
  | "agent.task.enqueued"
  | "agent.task.started"
  | "agent.task.completed"
  | "agent.task.failed"
  | "agent.task.retried"
  | "agent.task.skipped"
  | "agent.task.stalled_reclaimed"
  | "agent.registered"
  | "agent.unregistered";

export interface AgentAuditPayload {
  taskId: string;
  agentId: string;
  taskType: string;
  priority: string;
  retryCount?: number;
  errorNote?: string;
  output?: Record<string, unknown>;
}

/**
 * Build an audit event payload for agent lifecycle events.
 * Callers should pass this to the audit repository save method.
 */
export function buildAgentTaskAuditPayload(
  eventType: AgentAuditEventType,
  task: AgentTask,
  extras?: { output?: Record<string, unknown>; errorNote?: string },
): {
  type: string;
  workspaceId: string;
  occurredAt: Date;
  actorAccountId: string; // system
  subjectKind: string;
  subjectId: string;
  summary: string;
  metadata: Record<string, unknown>;
} {
  const summaryMap: Record<AgentAuditEventType, string> = {
    "agent.task.enqueued": `Tarefa enfileirada para agente ${task.agentId}`,
    "agent.task.started": `Processamento iniciado para tarefa ${task.type}`,
    "agent.task.completed": `Tarefa concluída pelo agente ${task.agentId}`,
    "agent.task.failed": `Falha na tarefa do agente ${task.agentId}`,
    "agent.task.retried": `Tarefa reagendada para retry (${task.retryCount + 1})`,
    "agent.task.skipped": `Tarefa ignorada pelo agente ${task.agentId}`,
    "agent.task.stalled_reclaimed": `Tarefa stall recuperada e reenfileirada`,
    "agent.registered": `Agente ${task.agentId} registrado`,
    "agent.unregistered": `Agente ${task.agentId} desregistrado`,
  };

  return {
    type: eventType,
    workspaceId: task.workspaceId,
    occurredAt: new Date(),
    actorAccountId: "system", // Background cron runs as system actor
    subjectKind: "agent_task",
    subjectId: task.id,
    summary: summaryMap[eventType] ?? `Evento de agente: ${eventType}`,
    metadata: {
      taskId: task.id,
      agentId: task.agentId,
      taskType: task.type,
      priority: task.priority,
      retryCount: task.retryCount,
      errorNote: extras?.errorNote ?? task.errorNote ?? undefined,
      output: extras?.output,
    },
  };
}
