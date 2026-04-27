import { createPrismaAgentTaskRepository, createPrismaWorkspaceAgentConfigRepository } from "./repository.prisma";
import type { AgentTaskRepository, WorkspaceAgentConfigRepository } from "./repository";

declare global {
  // eslint-disable-next-line no-var
  var __psivaultAgentTasks__: AgentTaskRepository | undefined;
  // eslint-disable-next-line no-var
  var __psivaultAgentConfigs__: WorkspaceAgentConfigRepository | undefined;
}

export function getAgentTaskRepository(): AgentTaskRepository {
  globalThis.__psivaultAgentTasks__ ??= createPrismaAgentTaskRepository();
  return globalThis.__psivaultAgentTasks__;
}

export function getWorkspaceAgentConfigRepository(): WorkspaceAgentConfigRepository {
  globalThis.__psivaultAgentConfigs__ ??= createPrismaWorkspaceAgentConfigRepository();
  return globalThis.__psivaultAgentConfigs__;
}
