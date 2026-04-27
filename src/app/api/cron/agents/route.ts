/**
 * GET /api/cron/agents
 *
 * Processes pending agent tasks across all workspaces.
 * Called by Vercel Cron every 15 minutes (per D-02).
 *
 * Auth: Authorization: Bearer $CRON_SECRET header
 */

export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getAgentTaskRepository } from "../../../../lib/agents/store";
import { createAgentRegistry } from "../../../../lib/agents/registry";
import { processAgentTasks } from "../../../../lib/agents/processor";
import { buildAgentTaskAuditPayload } from "../../../../lib/agents/audit";
import { getAuditRepository } from "../../../../lib/audit/store";
import { createAuditEvent } from "../../../../lib/audit/events";

export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  const now = new Date();
  const taskRepo = getAgentTaskRepository();
  const auditRepo = getAuditRepository();

  // ── Build agent registry ────────────────────────────────────────────────
  // For Phase 43, we register the "agenda" agent stub.
  // Future phases will register additional agents here or via dynamic imports.
  const registry = createAgentRegistry();

  // Stub agenda agent — Phase 44 will replace with real implementation
  registry.register({
    id: "agenda",
    name: "Agente de Agenda",
    description: "Detecta padrões de faltas, envia lembretes e sugere otimizações de horários.",
    defaultPriority: "medium",
    version: "1.0.0",
    capabilities: ["no_show_detection", "reminder_batching", "schedule_suggestion"],
    async executeTask(task) {
      // Phase 44 will implement actual logic
      // For now, mark as SKIPPED to avoid false errors
      return { status: "SKIPPED", errorNote: "Agenda agent not yet implemented — Phase 44" };
    },
  });

  // ── Discover workspaces with pending tasks ──────────────────────────────
  const pendingTasks = await taskRepo.listPendingAcrossWorkspaces(now, 500);

  if (pendingTasks.length === 0) {
    return Response.json({ ok: true, processed: 0, done: 0, error: 0, skipped: 0, retried: 0, stalled: 0, failed: 0 });
  }

  // Group by workspace to process each workspace independently
  const tasksByWorkspace = new Map<string, typeof pendingTasks>();
  for (const task of pendingTasks) {
    const list = tasksByWorkspace.get(task.workspaceId) ?? [];
    list.push(task);
    tasksByWorkspace.set(task.workspaceId, list);
  }

  // ── Process each workspace concurrently ─────────────────────────────────
  const workspaceResults = await Promise.allSettled(
    Array.from(tasksByWorkspace.entries()).map(async ([workspaceId, tasks]) => {
      const results = await processAgentTasks({ workspaceId, registry, repo: taskRepo, now, limit: 50 });

      // Emit audit events for non-DONE results
      for (const result of results) {
        const task = tasks.find((t) => t.id === result.taskId);
        if (!task) continue;

        let eventType: Parameters<typeof buildAgentTaskAuditPayload>[0];
        if (result.status === "DONE") eventType = "agent.task.completed";
        else if (result.status === "ERROR") eventType = "agent.task.failed";
        else if (result.status === "SKIPPED") eventType = "agent.task.skipped";
        else if (result.status === "RETRIED") eventType = "agent.task.retried";
        else if (result.status === "STALLED") eventType = "agent.task.stalled_reclaimed";
        else continue;

        const payload = buildAgentTaskAuditPayload(eventType, task, {
          errorNote: result.errorNote,
        });

        const auditEvent = createAuditEvent(
          {
            type: payload.type,
            actor: {
              accountId: payload.actorAccountId,
              workspaceId: payload.workspaceId,
              sessionId: null,
              displayName: "Sistema",
            },
            subject: {
              kind: payload.subjectKind,
              id: payload.subjectId,
              label: `${task.agentId}:${task.type}`,
            },
            summary: payload.summary,
            metadata: payload.metadata,
          },
          { now: payload.occurredAt },
        );

        auditRepo.append(auditEvent);
      }

      return results;
    }),
  );

  // ── Aggregate metrics ───────────────────────────────────────────────────
  let done = 0;
  let error = 0;
  let skipped = 0;
  let retried = 0;
  let stalled = 0;
  let processed = 0;

  for (const wsResult of workspaceResults) {
    if (wsResult.status === "fulfilled") {
      for (const r of wsResult.value) {
        processed++;
        if (r.status === "DONE") done++;
        else if (r.status === "ERROR") error++;
        else if (r.status === "SKIPPED") skipped++;
        else if (r.status === "RETRIED") retried++;
        else if (r.status === "STALLED") stalled++;
      }
    }
  }

  const failed = workspaceResults.filter((r) => r.status === "rejected").length;

  return Response.json({
    ok: true,
    processed,
    done,
    error,
    skipped,
    retried,
    stalled,
    failed,
  });
}
