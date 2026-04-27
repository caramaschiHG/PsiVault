export type AgentTaskStatus = "PENDING" | "RUNNING" | "DONE" | "ERROR" | "SKIPPED";
export type AgentTaskPriority = "critical" | "high" | "medium" | "low";

export interface AgentTask {
  id: string;
  workspaceId: string;
  agentId: string;
  type: string;
  status: AgentTaskStatus;
  priority: AgentTaskPriority;
  payload: Record<string, unknown>;
  scheduledFor: Date;
  processedAt: Date | null;
  failedAt: Date | null;
  errorNote: string | null;
  retryCount: number;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAgentTaskInput {
  workspaceId: string;
  agentId: string;
  type: string;
  priority?: AgentTaskPriority;
  payload?: Record<string, unknown>;
  scheduledFor: Date;
  idempotencyKey: string;
}

interface CreateAgentTaskDeps {
  now: Date;
  createId: () => string;
}

export function createAgentTask(
  input: CreateAgentTaskInput,
  deps: CreateAgentTaskDeps,
): AgentTask {
  const validPriorities: AgentTaskPriority[] = ["critical", "high", "medium", "low"];
  const priority = input.priority ?? "medium";
  if (!validPriorities.includes(priority)) {
    throw new Error(`Invalid priority "${priority}". Must be one of: ${validPriorities.join(", ")}`);
  }

  return {
    id: deps.createId(),
    workspaceId: input.workspaceId,
    agentId: input.agentId,
    type: input.type,
    status: "PENDING",
    priority,
    payload: input.payload ?? {},
    scheduledFor: input.scheduledFor,
    processedAt: null,
    failedAt: null,
    errorNote: null,
    retryCount: 0,
    idempotencyKey: input.idempotencyKey,
    createdAt: deps.now,
    updatedAt: deps.now,
  };
}

// Base Agent interface that all agent implementations must satisfy
export interface Agent {
  id: string;
  name: string;
  description: string;
  defaultPriority: AgentTaskPriority;
  version: string;
  capabilities: string[];
  executeTask(task: AgentTask): Promise<{ status: "DONE" | "ERROR" | "SKIPPED"; output?: Record<string, unknown>; errorNote?: string }>;
}
