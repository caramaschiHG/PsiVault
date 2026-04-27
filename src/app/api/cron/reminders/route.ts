/**
 * GET /api/cron/reminders
 *
 * Pre-enqueues reminder_batch tasks for all patients with appointments tomorrow.
 * Called by Vercel Cron daily at 17:00 UTC (14:00 BRT) to prepare for 20:00 BRT delivery.
 *
 * Auth: Authorization: Bearer $CRON_SECRET header
 */

export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { getAppointmentRepository } from "../../../../lib/appointments/store";
import { getPatientRepository } from "../../../../lib/patients/store";
import { getAgentTaskRepository } from "../../../../lib/agents/store";
import { createAgentOrchestrator } from "../../../../lib/agents/orchestrator";
import { buildAgentRegistry } from "../../../../lib/agents/build-registry";

export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const appointmentRepo = getAppointmentRepository();
  const patientRepo = getPatientRepository();
  const taskRepo = getAgentTaskRepository();
  const orchestrator = createAgentOrchestrator(buildAgentRegistry(), {
    now,
    createId: () => crypto.randomUUID(),
  });

  // Find all workspaces with appointments tomorrow
  const from = new Date(tomorrow);
  from.setHours(0, 0, 0, 0);
  const to = new Date(tomorrow);
  to.setHours(23, 59, 59, 999);

  // Query all appointments for tomorrow across all workspaces
  const pendingTasks = await taskRepo.listPendingAcrossWorkspaces(now, 500);
  const workspaceIds = new Set(pendingTasks.map((t) => t.workspaceId));

  // Also check for appointments tomorrow to discover active workspaces
  // For MVP: iterate known workspaces from pending tasks
  let enqueued = 0;

  for (const workspaceId of workspaceIds) {
    const appointments = await appointmentRepo.listByDateRange(workspaceId, from, to);
    const patientIds = new Set(appointments.map((a) => a.patientId));

    for (const patientId of patientIds) {
      const patient = await patientRepo.findById(patientId, workspaceId);
      if (!patient) continue;

      const preferredHour = patient.preferredReminderTime ?? 20;
      const scheduledFor = new Date(tomorrow);
      scheduledFor.setHours(preferredHour, 0, 0, 0);

      // Convert to UTC for storage (BRT = UTC-3, so 20h BRT = 23h UTC)
      // Simple approach: store as-is and let processor handle timezone
      const result = await orchestrator.enqueueTask({
        workspaceId,
        agentId: "agenda",
        type: "reminder_batch",
        priority: "medium",
        payload: { patientId, date: tomorrow.toISOString() },
        scheduledFor,
        idempotencyKey: `agenda:reminder:${workspaceId}:${patientId}:${tomorrow.toISOString().slice(0, 10)}`,
      });

      if (result.status === "enqueued") enqueued++;
    }
  }

  return Response.json({ ok: true, enqueued, date: tomorrow.toISOString().slice(0, 10) });
}
