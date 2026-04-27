import { db } from "../db";
import type { AgentTask, AgentTaskPriority, AgentTaskStatus } from "./model";
import type { WorkspaceAgentConfig, AgentIntensity } from "./config-model";
import type { AgentTaskRepository, WorkspaceAgentConfigRepository } from "./repository";
import type { AgentTask as PrismaAgentTask, WorkspaceAgentConfig as PrismaWorkspaceAgentConfig } from "@prisma/client";

function mapTaskToDomain(r: PrismaAgentTask): AgentTask {
  return {
    id: r.id,
    workspaceId: r.workspaceId,
    agentId: r.agentId,
    type: r.type,
    status: r.status as AgentTaskStatus,
    priority: r.priority as AgentTaskPriority,
    payload: (r.payload as Record<string, unknown>) ?? {},
    scheduledFor: r.scheduledFor,
    processedAt: r.processedAt,
    failedAt: r.failedAt,
    errorNote: r.errorNote,
    retryCount: r.retryCount,
    idempotencyKey: r.idempotencyKey,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function mapConfigToDomain(r: PrismaWorkspaceAgentConfig): WorkspaceAgentConfig {
  return {
    id: r.id,
    workspaceId: r.workspaceId,
    agentId: r.agentId,
    enabled: r.enabled,
    intensity: r.intensity as AgentIntensity,
    settings: (r.settings as Record<string, unknown>) ?? {},
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function createPrismaAgentTaskRepository(): AgentTaskRepository {
  return {
    async save(task) {
      const data = {
        workspaceId: task.workspaceId,
        agentId: task.agentId,
        type: task.type,
        status: task.status,
        priority: task.priority,
        payload: task.payload,
        scheduledFor: task.scheduledFor,
        processedAt: task.processedAt,
        failedAt: task.failedAt,
        errorNote: task.errorNote,
        retryCount: task.retryCount,
        idempotencyKey: task.idempotencyKey,
      };
      const r = await db.agentTask.upsert({
        where: { id: task.id },
        update: data,
        create: { id: task.id, ...data },
      });
      return mapTaskToDomain(r);
    },

    async findById(id, workspaceId) {
      const r = await db.agentTask.findFirst({ where: { id, workspaceId } });
      return r ? mapTaskToDomain(r) : null;
    },

    async findByIdempotencyKey(key) {
      const r = await db.agentTask.findUnique({ where: { idempotencyKey: key } });
      return r ? mapTaskToDomain(r) : null;
    },

    async listPendingByPriority(workspaceId, now, limit = 100) {
      const priorityOrder = ["critical", "high", "medium", "low"];
      const rows = await db.agentTask.findMany({
        where: { workspaceId, status: "PENDING", scheduledFor: { lte: now } },
        orderBy: [
          { priority: "asc" },
          { scheduledFor: "asc" },
        ],
        take: limit,
      });
      // Re-sort by explicit priority order since Prisma String ordering may not match business priority
      const priorityIndex = Object.fromEntries(priorityOrder.map((p, i) => [p, i]));
      rows.sort((a, b) => {
        const pa = priorityIndex[a.priority] ?? 99;
        const pb = priorityIndex[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        return a.scheduledFor.getTime() - b.scheduledFor.getTime();
      });
      return rows.map(mapTaskToDomain);
    },

    async listByWorkspace(workspaceId, limit = 100) {
      const rows = await db.agentTask.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(mapTaskToDomain);
    },

    async listPendingAcrossWorkspaces(now, limit = 500) {
      const priorityOrder = ["critical", "high", "medium", "low"];
      const rows = await db.agentTask.findMany({
        where: { status: "PENDING", scheduledFor: { lte: now } },
        orderBy: [
          { priority: "asc" },
          { scheduledFor: "asc" },
        ],
        take: limit,
      });
      const priorityIndex = Object.fromEntries(priorityOrder.map((p, i) => [p, i]));
      rows.sort((a, b) => {
        const pa = priorityIndex[a.priority] ?? 99;
        const pb = priorityIndex[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        return a.scheduledFor.getTime() - b.scheduledFor.getTime();
      });
      return rows.map(mapTaskToDomain);
    },
  };
}

export function createPrismaWorkspaceAgentConfigRepository(): WorkspaceAgentConfigRepository {
  return {
    async save(config) {
      const data = {
        workspaceId: config.workspaceId,
        agentId: config.agentId,
        enabled: config.enabled,
        intensity: config.intensity,
        settings: config.settings,
      };
      const r = await db.workspaceAgentConfig.upsert({
        where: {
          workspaceId_agentId: { workspaceId: config.workspaceId, agentId: config.agentId },
        },
        update: data,
        create: { id: config.id, ...data },
      });
      return mapConfigToDomain(r);
    },

    async findByWorkspaceAndAgent(workspaceId, agentId) {
      const r = await db.workspaceAgentConfig.findUnique({
        where: { workspaceId_agentId: { workspaceId, agentId } },
      });
      return r ? mapConfigToDomain(r) : null;
    },

    async listByWorkspace(workspaceId) {
      const rows = await db.workspaceAgentConfig.findMany({ where: { workspaceId } });
      return rows.map(mapConfigToDomain);
    },
  };
}
