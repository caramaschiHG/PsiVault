export type AgentIntensity = "off" | "silent" | "normal";

export interface WorkspaceAgentConfig {
  id: string;
  workspaceId: string;
  agentId: string;
  enabled: boolean;
  intensity: AgentIntensity;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkspaceAgentConfigInput {
  workspaceId: string;
  agentId: string;
  enabled?: boolean;
  intensity?: AgentIntensity;
  settings?: Record<string, unknown>;
}

interface CreateWorkspaceAgentConfigDeps {
  now: Date;
  createId: () => string;
}

export function createWorkspaceAgentConfig(
  input: CreateWorkspaceAgentConfigInput,
  deps: CreateWorkspaceAgentConfigDeps,
): WorkspaceAgentConfig {
  const validIntensities: AgentIntensity[] = ["off", "silent", "normal"];
  const intensity = input.intensity ?? "normal";
  if (!validIntensities.includes(intensity)) {
    throw new Error(`Invalid intensity "${intensity}". Must be one of: ${validIntensities.join(", ")}`);
  }

  return {
    id: deps.createId(),
    workspaceId: input.workspaceId,
    agentId: input.agentId,
    enabled: input.enabled ?? false,
    intensity,
    settings: input.settings ?? {},
    createdAt: deps.now,
    updatedAt: deps.now,
  };
}
