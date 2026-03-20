/**
 * GET /api/cron/notifications
 *
 * Processes pending notification jobs and sends emails via SMTP.
 * Called by Vercel Cron twice daily (09:00 and 12:00 UTC).
 *
 * Auth: Authorization: Bearer $CRON_SECRET header
 */

export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import { getNotificationJobRepository } from "../../../../lib/notifications/store";
import { getSmtpConfigRepository } from "../../../../lib/notifications/smtp-config-store";
import { getAppointmentRepository } from "../../../../lib/appointments/store";
import { getPatientRepository } from "../../../../lib/patients/store";
import { sendEmail } from "../../../../lib/notifications/mailer";
import {
  buildConfirmationEmail,
  buildReminderEmail,
  buildCancellationEmail,
} from "../../../../lib/notifications/templates";

const SKIP_STATUSES = new Set(["CANCELED", "COMPLETED", "NO_SHOW"]);

export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  // ── Load due jobs ────────────────────────────────────────────────────────
  const now = new Date();
  const jobRepo = getNotificationJobRepository();
  const smtpRepo = getSmtpConfigRepository();
  const appointmentRepo = getAppointmentRepository();
  const patientRepo = getPatientRepository();

  const dueJobs = await jobRepo.listDue(now);

  if (dueJobs.length === 0) {
    return Response.json({ ok: true, sent: 0, failed: 0, skipped: 0 });
  }

  // ── Group by workspace to reuse SMTP config per workspace ────────────────
  const smtpByWorkspace = new Map<string, Awaited<ReturnType<typeof smtpRepo.findByWorkspace>>>();
  const uniqueWorkspaceIds = [...new Set(dueJobs.map((j) => j.workspaceId))];
  await Promise.all(
    uniqueWorkspaceIds.map(async (wsId) => {
      smtpByWorkspace.set(wsId, await smtpRepo.findByWorkspace(wsId));
    }),
  );

  const tz = "America/Sao_Paulo";
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: tz });
  const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: tz });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const job of dueJobs) {
    const smtpConfig = smtpByWorkspace.get(job.workspaceId);

    if (!smtpConfig) {
      skipped++;
      continue;
    }

    // Verify appointment status
    const appointment = await appointmentRepo.findById(job.appointmentId, job.workspaceId);
    if (!appointment || SKIP_STATUSES.has(appointment.status)) {
      // Cancel job and skip
      await jobRepo.save({ ...job, status: "CANCELED", updatedAt: now });
      skipped++;
      continue;
    }

    // Resolve patient name
    const patient = await patientRepo.findById(job.patientId, job.workspaceId);
    const patientName = patient ? (patient.socialName ?? patient.fullName) : "Paciente";

    const appointmentDate = dateFormatter.format(appointment.startsAt);
    const appointmentTime = timeFormatter.format(appointment.startsAt);
    const fromName = smtpConfig.fromName;

    try {
      let emailData: { subject: string; html: string };

      switch (job.type) {
        case "CONFIRMATION":
          emailData = buildConfirmationEmail({ patientName, appointmentDate, appointmentTime, fromName });
          break;
        case "REMINDER_24H":
          emailData = buildReminderEmail({ patientName, appointmentDate, appointmentTime, fromName, hoursAhead: 24 });
          break;
        case "REMINDER_1H":
          emailData = buildReminderEmail({ patientName, appointmentDate, appointmentTime, fromName, hoursAhead: 1 });
          break;
        case "CANCELLATION":
          emailData = buildCancellationEmail({ patientName, appointmentDate, appointmentTime, fromName });
          break;
        default:
          skipped++;
          continue;
      }

      await sendEmail(smtpConfig, { to: job.recipientEmail, ...emailData });
      await jobRepo.save({ ...job, status: "SENT", sentAt: now, updatedAt: now });
      sent++;
    } catch (err) {
      const errorNote = err instanceof Error ? err.message : String(err);
      await jobRepo.save({ ...job, status: "FAILED", failedAt: now, errorNote, updatedAt: now });
      failed++;
      console.error(`[cron/notifications] Job ${job.id} failed:`, err);
    }
  }

  return Response.json({ ok: true, sent, failed, skipped });
}
