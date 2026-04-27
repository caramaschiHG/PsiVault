import type { AgentTask, AgentTaskStatus } from "./model";
import type { AgentTaskRepository } from "./repository";
import type { AgentRegistry } from "./registry";

export interface ProcessResult {
  taskId: string;
  status: "DONE" | "ERROR" | "SKIPPED" | "STALLED" | "RETRIED";
  errorNote?: string;
}

export const MAX_RETRIES = 3;
export const RETRY_BACKOFF_MINUTES = [5, 15, 45]; // Exponential-ish per D-07

/**
 * Compute the next retry schedule based on current retryCount.
 * Returns null if max retries exhausted.
 */
export function computeRetrySchedule(retryCount: number, now: Date): Date | null {
  if (retryCount >= MAX_RETRIES) return null;
  const minutes = RETRY_BACKOFF_MINUTES[retryCount] ?? RETRY_BACKOFF_MINUTES[RETRY_BACKOFF_MINUTES.length - 1];
  return new Date(now.getTime() + minutes * 60_000);
}

/**
 * Detect stalled tasks: RUNNING for longer than a reasonable threshold.
 * Threshold: 10 minutes (generous for Vercel serverless runtime).
 */
export const STALL_THRESHOLD_MS = 10 * 60_000;

export function isStalled(task: AgentTask, now: Date): boolean {
  if (task.status !== "RUNNING") return false;
  // If processedAt is set and older than threshold, it's stalled
  if (task.processedAt && now.getTime() - task.processedAt.getTime() > STALL_THRESHOLD_MS) {
    return true;
  }
  return false;
}

export interface ProcessAgentTasksInput {
  workspaceId: string;
  registry: AgentRegistry;
  repo: AgentTaskRepository;
  now: Date;
  limit?: number;
}

/**
 * Process pending agent tasks for a workspace.
 * Tasks are fetched in priority order (already sorted by repository).
 * Each task is marked RUNNING, executed by its agent, then marked DONE/ERROR/SKIPPED.
 */
export async function processAgentTasks(
  input: ProcessAgentTasksInput,
): Promise<ProcessResult[]> {
  const { workspaceId, registry, repo, now, limit = 50 } = input;

  // Reclaim stalled tasks first
  const allRunning = await repo.listByWorkspace(workspaceId, 200);
  const stalled = allRunning.filter((t) => isStalled(t, now));
  for (const task of stalled) {
    const retryAt = computeRetrySchedule(task.retryCount, now);
    if (retryAt) {
      await repo.save({
        ...task,
        status: "PENDING",
        scheduledFor: retryAt,
        retryCount: task.retryCount + 1,
        errorNote: `Stalled after ${STALL_THRESHOLD_MS / 60000} min; requeued for retry`,
        updatedAt: now,
      });
    } else {
      await repo.save({
        ...task,
        status: "ERROR",
        errorNote: `Stalled after ${STALL_THRESHOLD_MS / 60000} min; max retries exhausted`,
        updatedAt: now,
      });
    }
  }

  // Fetch pending tasks
  const pending = await repo.listPendingByPriority(workspaceId, now, limit);
  const results: ProcessResult[] = [];

  for (const task of pending) {
    // Mark RUNNING immediately to prevent double-processing
    const runningTask: AgentTask = {
      ...task,
      status: "RUNNING",
      processedAt: now,
      updatedAt: now,
    };
    await repo.save(runningTask);

    const agent = registry.get(task.agentId);
    if (!agent) {
      await repo.save({
        ...runningTask,
        status: "ERROR",
        errorNote: `Agent "${task.agentId}" is not registered in the registry.`,
        updatedAt: now,
      });
      results.push({ taskId: task.id, status: "ERROR", errorNote: `Agent "${task.agentId}" not registered` });
      continue;
    }

    try {
      const outcome = await agent.executeTask(runningTask);

      if (outcome.status === "DONE") {
        await repo.save({
          ...runningTask,
          status: "DONE",
          updatedAt: now,
        });
        results.push({ taskId: task.id, status: "DONE" });
      } else if (outcome.status === "SKIPPED") {
        await repo.save({
          ...runningTask,
          status: "SKIPPED",
          updatedAt: now,
        });
        results.push({ taskId: task.id, status: "SKIPPED" });
      } else if (outcome.status === "ERROR") {
        const retryAt = computeRetrySchedule(runningTask.retryCount, now);
        if (retryAt) {
          await repo.save({
            ...runningTask,
            status: "PENDING",
            scheduledFor: retryAt,
            retryCount: runningTask.retryCount + 1,
            failedAt: now,
            errorNote: outcome.errorNote ?? "Agent returned ERROR",
            updatedAt: now,
          });
          results.push({ taskId: task.id, status: "RETRIED", errorNote: outcome.errorNote });
        } else {
          await repo.save({
            ...runningTask,
            status: "ERROR",
            failedAt: now,
            errorNote: outcome.errorNote ?? "Agent returned ERROR; max retries exhausted",
            updatedAt: now,
          });
          results.push({ taskId: task.id, status: "ERROR", errorNote: outcome.errorNote });
        }
      }
    } catch (err) {
      const errorNote = err instanceof Error ? err.message : String(err);
      const retryAt = computeRetrySchedule(runningTask.retryCount, now);
      if (retryAt) {
        await repo.save({
          ...runningTask,
          status: "PENDING",
          scheduledFor: retryAt,
          retryCount: runningTask.retryCount + 1,
          failedAt: now,
          errorNote: `Exception: ${errorNote}`,
          updatedAt: now,
        });
        results.push({ taskId: task.id, status: "RETRIED", errorNote: `Exception: ${errorNote}` });
      } else {
        await repo.save({
          ...runningTask,
          status: "ERROR",
          failedAt: now,
          errorNote: `Exception: ${errorNote}; max retries exhausted`,
          updatedAt: now,
        });
        results.push({ taskId: task.id, status: "ERROR", errorNote: `Exception: ${errorNote}` });
      }
    }
  }

  return results;
}
