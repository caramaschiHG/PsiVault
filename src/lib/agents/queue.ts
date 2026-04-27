import type { AgentOrchestrator } from "./orchestrator";
import type { AgentTaskPriority } from "./model";

export interface EnqueueInput {
  workspaceId: string;
  agentId: string;
  type: string;
  priority?: AgentTaskPriority;
  payload?: Record<string, unknown>;
  scheduledFor?: Date;
  idempotencyKey: string;
}

export async function enqueueAgentTask(
  orchestrator: AgentOrchestrator,
  input: EnqueueInput,
): Promise<{ taskId: string; status: string; error?: string }> {
  return orchestrator.enqueueTask(input);
}

/**
 * Check whether a workspace has an agent enabled at all.
 * Used by callers to avoid computing expensive payloads when agent is off.
 */
export async function shouldProcessForWorkspace(
  orchestrator: AgentOrchestrator,
  workspaceId: string,
  agentId: string,
): Promise<boolean> {
  const config = await orchestrator.getConfig(workspaceId, agentId);
  if (!config) return false;
  return config.enabled && config.intensity !== "off";
}

/**
 * Convenience builder for appointment-related agent tasks.
 * Ensures idempotency keys are deterministic: `{agentId}:{appointmentId}:{eventType}`
 */
export function buildAppointmentAgentIdempotencyKey(
  agentId: string,
  appointmentId: string,
  eventType: string,
): string {
  return `${agentId}:${appointmentId}:${eventType}`;
}
