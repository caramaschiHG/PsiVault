import { describe, it, expect, beforeEach } from "vitest";
import { createAgentOrchestrator } from "../../../src/lib/agents/orchestrator";
import { createAgentRegistry } from "../../../src/lib/agents/registry";
import { createInMemoryAgentTaskRepository, createInMemoryWorkspaceAgentConfigRepository } from "../../../src/lib/agents/repository";
import type { Agent } from "../../../src/lib/agents/model";

describe("AgentOrchestrator", () => {
  function makeDeps() {
    return {
      now: new Date("2026-04-27T10:00:00Z"),
      createId: (() => { let i = 0; return () => `id_${++i}`; })(),
    };
  }

  const stubAgent: Agent = {
    id: "agenda",
    name: "Agente de Agenda",
    description: "...",
    defaultPriority: "medium",
    version: "1.0.0",
    capabilities: ["reminder"],
    async executeTask() {
      return { status: "DONE" };
    },
  };

  beforeEach(() => {
    // Reset global singletons between tests
    globalThis.__psivaultAgentTasks__ = undefined;
    globalThis.__psivaultAgentConfigs__ = undefined;
  });

  it("creates default workspace config with enabled=false when missing", async () => {
    globalThis.__psivaultAgentTasks__ = createInMemoryAgentTaskRepository();
    globalThis.__psivaultAgentConfigs__ = createInMemoryWorkspaceAgentConfigRepository();

    const registry = createAgentRegistry();
    registry.register(stubAgent);
    const orchestrator = createAgentOrchestrator(registry, makeDeps());

    const result = await orchestrator.enqueueTask({
      workspaceId: "ws_1",
      agentId: "agenda",
      type: "test",
      idempotencyKey: "k1",
    });

    expect(result.status).toBe("skipped_agent_disabled");
    const config = await orchestrator.getConfig("ws_1", "agenda");
    expect(config).not.toBeNull();
    expect(config!.enabled).toBe(false);
  });

  it("enqueues task when workspace has enabled=true", async () => {
    const deps = makeDeps();

    // Seed the global config store with an enabled config before creating orchestrator
    const configRepo = createInMemoryWorkspaceAgentConfigRepository();
    const { createWorkspaceAgentConfig } = await import("../../../src/lib/agents/config-model");
    const config = createWorkspaceAgentConfig(
      { workspaceId: "ws_1", agentId: "agenda", enabled: true },
      deps,
    );
    await configRepo.save(config);

    globalThis.__psivaultAgentTasks__ = createInMemoryAgentTaskRepository();
    globalThis.__psivaultAgentConfigs__ = configRepo;

    const registry = createAgentRegistry();
    registry.register(stubAgent);
    const orchestrator = createAgentOrchestrator(registry, deps);

    const result = await orchestrator.enqueueTask({
      workspaceId: "ws_1",
      agentId: "agenda",
      type: "test",
      idempotencyKey: "k2",
    });

    expect(result.status).toBe("enqueued");
  });

  it("returns error when agent is not registered", async () => {
    globalThis.__psivaultAgentTasks__ = createInMemoryAgentTaskRepository();
    globalThis.__psivaultAgentConfigs__ = createInMemoryWorkspaceAgentConfigRepository();

    const registry = createAgentRegistry();
    const orchestrator = createAgentOrchestrator(registry, makeDeps());

    const result = await orchestrator.enqueueTask({
      workspaceId: "ws_1",
      agentId: "unknown",
      type: "test",
      idempotencyKey: "k3",
    });

    expect(result.status).toBe("error");
  });
});
