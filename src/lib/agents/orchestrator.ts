import type { Agent, AgentTask, AgentTaskPriority } from "./model";
import type { WorkspaceAgentConfig } from "./config-model";
import type { AgentRegistry } from "./registry";
import { getAgentTaskRepository, getWorkspaceAgentConfigRepository } from "./store";

export interface OrchestratorResult {
  taskId: string;
  status: "enqueued" | "skipped_agent_disabled" | "skipped_workspace_off" | "error";
  error?: string;
}

export interface AgentOrchestrator {
  registry: AgentRegistry;
  registerAgent(agent: Agent): void;
  unregisterAgent(agentId: string): boolean;
  enqueueTask(input: {
    workspaceId: string;
    agentId: string;
    type: string;
    priority?: AgentTaskPriority;
    payload?: Record<string, unknown>;
    scheduledFor?: Date;
    idempotencyKey: string;
  }): Promise<OrchestratorResult>;
  getConfig(workspaceId: string, agentId: string): Promise<WorkspaceAgentConfig | null>;
  listConfigs(workspaceId: string): Promise<WorkspaceAgentConfig[]>;
  ensureDefaultConfig(workspaceId: string, agentId: string): Promise<WorkspaceAgentConfig>;
}

interface OrchestratorDeps {
  now: Date;
  createId: () => string;
}

export function createAgentOrchestrator(
  registry: AgentRegistry,
  deps: OrchestratorDeps,
): AgentOrchestrator {
  const taskRepo = getAgentTaskRepository();
  const configRepo = getWorkspaceAgentConfigRepository();

  return {
    registry,

    registerAgent(agent) {
      registry.register(agent);
    },

    unregisterAgent(agentId) {
      return registry.unregister(agentId);
    },

    async enqueueTask(input) {
      // Verify agent is registered
      const agent = registry.get(input.agentId);
      if (!agent) {
        return { taskId: "", status: "error", error: `Agent "${input.agentId}" is not registered.` };
      }

      // Verify workspace has config; if not, create default (disabled per D-11)
      let config = await configRepo.findByWorkspaceAndAgent(input.workspaceId, input.agentId);
      if (!config) {
        const { createWorkspaceAgentConfig } = await import("./config-model");
        config = createWorkspaceAgentConfig(
          { workspaceId: input.workspaceId, agentId: input.agentId, enabled: false },
          { now: deps.now, createId: deps.createId },
        );
        await configRepo.save(config);
      }

      // Skip if agent disabled for workspace
      if (!config.enabled) {
        return { taskId: "", status: "skipped_agent_disabled" };
      }

      // Skip if intensity is "off" (fully disabled)
      if (config.intensity === "off") {
        return { taskId: "", status: "skipped_workspace_off" };
      }

      // Determine priority: task override > agent default > medium
      const priority = input.priority ?? agent.defaultPriority ?? "medium";

      // Determine scheduled time: input > now
      const scheduledFor = input.scheduledFor ?? deps.now;

      const { createAgentTask } = await import("./model");
      const task = createAgentTask(
        {
          workspaceId: input.workspaceId,
          agentId: input.agentId,
          type: input.type,
          priority,
          payload: input.payload ?? {},
          scheduledFor,
          idempotencyKey: input.idempotencyKey,
        },
        { now: deps.now, createId: deps.createId },
      );

      await taskRepo.save(task);
      return { taskId: task.id, status: "enqueued" };
    },

    async getConfig(workspaceId, agentId) {
      return configRepo.findByWorkspaceAndAgent(workspaceId, agentId);
    },

    async listConfigs(workspaceId) {
      return configRepo.listByWorkspace(workspaceId);
    },

    async ensureDefaultConfig(workspaceId, agentId) {
      const existing = await configRepo.findByWorkspaceAndAgent(workspaceId, agentId);
      if (existing) return existing;

      const { createWorkspaceAgentConfig } = await import("./config-model");
      const config = createWorkspaceAgentConfig(
        { workspaceId, agentId, enabled: false },
        { now: deps.now, createId: deps.createId },
      );
      return configRepo.save(config);
    },
  };
}
