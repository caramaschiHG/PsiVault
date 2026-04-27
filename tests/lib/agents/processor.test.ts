import { describe, it, expect, beforeEach } from "vitest";
import { processAgentTasks, computeRetrySchedule, isStalled, MAX_RETRIES } from "../../../src/lib/agents/processor";
import { createInMemoryAgentTaskRepository } from "../../../src/lib/agents/repository";
import { createAgentRegistry } from "../../../src/lib/agents/registry";
import { createAgentTask } from "../../../src/lib/agents/model";
import type { Agent } from "../../../src/lib/agents/model";

describe("computeRetrySchedule", () => {
  const now = new Date("2026-04-27T10:00:00Z");

  it("returns +5min for retryCount 0", () => {
    const result = computeRetrySchedule(0, now);
    expect(result).toEqual(new Date("2026-04-27T10:05:00Z"));
  });

  it("returns +15min for retryCount 1", () => {
    const result = computeRetrySchedule(1, now);
    expect(result).toEqual(new Date("2026-04-27T10:15:00Z"));
  });

  it("returns +45min for retryCount 2", () => {
    const result = computeRetrySchedule(2, now);
    expect(result).toEqual(new Date("2026-04-27T10:45:00Z"));
  });

  it("returns null when max retries reached", () => {
    const result = computeRetrySchedule(MAX_RETRIES, now);
    expect(result).toBeNull();
  });
});

describe("isStalled", () => {
  const now = new Date("2026-04-27T10:00:00Z");

  it("returns false for PENDING task", () => {
    const task = createAgentTask(
      { workspaceId: "ws", agentId: "a", type: "t", scheduledFor: now, idempotencyKey: "k" },
      { now, createId: () => "id1" },
    );
    expect(isStalled(task, now)).toBe(false);
  });

  it("returns true for RUNNING task older than 10 minutes", () => {
    const task = createAgentTask(
      { workspaceId: "ws", agentId: "a", type: "t", scheduledFor: now, idempotencyKey: "k" },
      { now, createId: () => "id1" },
    );
    const running = { ...task, status: "RUNNING" as const, processedAt: new Date("2026-04-27T09:00:00Z") };
    expect(isStalled(running, now)).toBe(true);
  });
});

describe("processAgentTasks", () => {
  const now = new Date("2026-04-27T10:00:00Z");

  function makeDeps() {
    return { now, createId: (() => { let i = 0; return () => `id_${++i}`; })() };
  }

  const successAgent: Agent = {
    id: "success",
    name: "Success Agent",
    description: "...",
    defaultPriority: "medium",
    version: "1.0.0",
    capabilities: [],
    async executeTask() {
      return { status: "DONE" };
    },
  };

  const errorAgent: Agent = {
    id: "error",
    name: "Error Agent",
    description: "...",
    defaultPriority: "medium",
    version: "1.0.0",
    capabilities: [],
    async executeTask() {
      return { status: "ERROR", errorNote: " simulated failure" };
    },
  };

  it("processes pending tasks and marks them DONE", async () => {
    const repo = createInMemoryAgentTaskRepository();
    const registry = createAgentRegistry();
    registry.register(successAgent);

    const deps = makeDeps();
    const task = createAgentTask(
      { workspaceId: "ws", agentId: "success", type: "t", scheduledFor: now, idempotencyKey: "k1" },
      deps,
    );
    await repo.save(task);

    const results = await processAgentTasks({ workspaceId: "ws", registry, repo, now });
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("DONE");

    const saved = await repo.findById(task.id, "ws");
    expect(saved?.status).toBe("DONE");
  });

  it("retries ERROR tasks up to max retries, then marks ERROR", async () => {
    const repo = createInMemoryAgentTaskRepository();
    const registry = createAgentRegistry();
    registry.register(errorAgent);

    const deps = makeDeps();
    const task = createAgentTask(
      { workspaceId: "ws", agentId: "error", type: "t", scheduledFor: now, idempotencyKey: "k2" },
      deps,
    );
    await repo.save(task);

    // First run → RETRIED
    const r1 = await processAgentTasks({ workspaceId: "ws", registry, repo, now });
    expect(r1[0].status).toBe("RETRIED");

    // Advance time past retry schedule and run again
    const t1 = new Date(now.getTime() + 6 * 60_000);
    const r2 = await processAgentTasks({ workspaceId: "ws", registry, repo, now: t1 });
    expect(r2[0].status).toBe("RETRIED");

    const t2 = new Date(t1.getTime() + 16 * 60_000);
    const r3 = await processAgentTasks({ workspaceId: "ws", registry, repo, now: t2 });
    expect(r3[0].status).toBe("RETRIED");

    const t3 = new Date(t2.getTime() + 46 * 60_000);
    const r4 = await processAgentTasks({ workspaceId: "ws", registry, repo, now: t3 });
    expect(r4[0].status).toBe("ERROR");

    const saved = await repo.findById(task.id, "ws");
    expect(saved?.status).toBe("ERROR");
    expect(saved?.retryCount).toBe(MAX_RETRIES);
  });

  it("reclaims stalled tasks and requeues them for retry", async () => {
    const repo = createInMemoryAgentTaskRepository();
    const registry = createAgentRegistry();
    registry.register(successAgent);

    const deps = makeDeps();
    const task = createAgentTask(
      { workspaceId: "ws", agentId: "success", type: "t", scheduledFor: now, idempotencyKey: "k3" },
      deps,
    );
    // Pre-seed as RUNNING with old processedAt
    await repo.save({ ...task, status: "RUNNING", processedAt: new Date("2026-04-27T08:00:00Z") });

    const results = await processAgentTasks({ workspaceId: "ws", registry, repo, now });
    // Stalled tasks are reclaimed to PENDING with future scheduled time;
    // they are not processed in the same run (retry is scheduled for future)
    expect(results).toHaveLength(0);

    const saved = await repo.findById(task.id, "ws");
    expect(saved?.status).toBe("PENDING");
    expect(saved?.retryCount).toBe(1);
    expect(saved?.scheduledFor.getTime()).toBeGreaterThan(now.getTime());
  });
});
