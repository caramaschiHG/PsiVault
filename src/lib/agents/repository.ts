import type { AgentTask } from "./model";
import type { WorkspaceAgentConfig } from "./config-model";

export interface AgentTaskRepository {
  save(task: AgentTask): Promise<AgentTask>;
  findById(id: string, workspaceId: string): Promise<AgentTask | null>;
  findByIdempotencyKey(key: string): Promise<AgentTask | null>;
  listPendingByPriority(workspaceId: string, now: Date, limit?: number): Promise<AgentTask[]>;
  listByWorkspace(workspaceId: string, limit?: number): Promise<AgentTask[]>;
  listPendingAcrossWorkspaces(now: Date, limit?: number): Promise<AgentTask[]>;
}

export interface WorkspaceAgentConfigRepository {
  save(config: WorkspaceAgentConfig): Promise<WorkspaceAgentConfig>;
  findByWorkspaceAndAgent(workspaceId: string, agentId: string): Promise<WorkspaceAgentConfig | null>;
  listByWorkspace(workspaceId: string): Promise<WorkspaceAgentConfig[]>;
}

// In-memory implementations for unit tests
export function createInMemoryAgentTaskRepository(seed: AgentTask[] = []): AgentTaskRepository {
  const store = new Map<string, AgentTask>(seed.map((t) => [t.id, t]));

  return {
    async save(task) {
      store.set(task.id, task);
      return task;
    },
    async findById(id, workspaceId) {
      const t = store.get(id);
      return t && t.workspaceId === workspaceId ? t : null;
    },
    async findByIdempotencyKey(key) {
      for (const t of store.values()) {
        if (t.idempotencyKey === key) return t;
      }
      return null;
    },
    async listPendingByPriority(workspaceId, now, limit = 100) {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return [...store.values()]
        .filter((t) => t.workspaceId === workspaceId && t.status === "PENDING" && t.scheduledFor <= now)
        .sort((a, b) => {
          const pa = priorityOrder[a.priority] ?? 99;
          const pb = priorityOrder[b.priority] ?? 99;
          if (pa !== pb) return pa - pb;
          return a.scheduledFor.getTime() - b.scheduledFor.getTime();
        })
        .slice(0, limit);
    },
    async listByWorkspace(workspaceId, limit = 100) {
      return [...store.values()]
        .filter((t) => t.workspaceId === workspaceId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    },
    async listPendingAcrossWorkspaces(now, limit = 500) {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return [...store.values()]
        .filter((t) => t.status === "PENDING" && t.scheduledFor <= now)
        .sort((a, b) => {
          const pa = priorityOrder[a.priority] ?? 99;
          const pb = priorityOrder[b.priority] ?? 99;
          if (pa !== pb) return pa - pb;
          return a.scheduledFor.getTime() - b.scheduledFor.getTime();
        })
        .slice(0, limit);
    },
  };
}

export function createInMemoryWorkspaceAgentConfigRepository(
  seed: WorkspaceAgentConfig[] = [],
): WorkspaceAgentConfigRepository {
  const store = new Map<string, WorkspaceAgentConfig>(seed.map((c) => [c.id, c]));

  return {
    async save(config) {
      store.set(config.id, config);
      return config;
    },
    async findByWorkspaceAndAgent(workspaceId, agentId) {
      for (const c of store.values()) {
        if (c.workspaceId === workspaceId && c.agentId === agentId) return c;
      }
      return null;
    },
    async listByWorkspace(workspaceId) {
      return [...store.values()].filter((c) => c.workspaceId === workspaceId);
    },
  };
}
