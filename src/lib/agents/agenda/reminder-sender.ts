import type { Appointment } from "../../appointments/model";
import type { Patient } from "../../patients/model";

export interface ReminderSender {
  send(patientId: string, phone: string | null, message: string): Promise<{ sent: boolean; log: string }>;
}

export class MockReminderSender implements ReminderSender {
  async send(patientId: string, phone: string | null, message: string): Promise<{ sent: boolean; log: string }> {
    const log = `[MOCK] To: ${phone ?? "N/A"} | Patient: ${patientId} | Msg: ${message}`;
    // eslint-disable-next-line no-console
    console.log(log);
    return { sent: true, log };
  }
}

export interface NextDayAppointment {
  patientId: string;
  patientName: string;
  reminderPhone: string | null;
  startsAt: Date;
}

export function buildReminderMessage(
  patientName: string,
  appointments: { startsAt: Date }[],
): string {
  const count = appointments.length;
  const times = appointments
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .map((a) =>
      a.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
    );
  if (count === 1) {
    return `Olá ${patientName}, lembrete: você tem 1 atendimento amanhã às ${times[0]}.`;
  }
  return `Olá ${patientName}, lembrete: você tem ${count} atendimentos amanhã: ${times.join(" e ")}.`;
}

export async function batchRemindersForDay(
  workspaceId: string,
  date: Date,
  deps: {
    listByDateRange: (workspaceId: string, from: Date, to: Date) => Promise<Appointment[]>;
    findPatientById: (id: string, workspaceId: string) => Promise<Patient | null>;
    sender: ReminderSender;
  },
): Promise<{ sent: number; failed: number; logs: string[] }> {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  const to = new Date(date);
  to.setHours(23, 59, 59, 999);

  const appointments = await deps.listByDateRange(workspaceId, from, to);
  const byPatient = new Map<string, Appointment[]>();
  for (const appt of appointments) {
    const list = byPatient.get(appt.patientId) ?? [];
    list.push(appt);
    byPatient.set(appt.patientId, list);
  }

  const logs: string[] = [];
  let sent = 0;
  let failed = 0;

  for (const [patientId, appts] of byPatient) {
    const patient = await deps.findPatientById(patientId, workspaceId);
    if (!patient) continue;
    const message = buildReminderMessage(patient.fullName, appts);
    const result = await deps.sender.send(patientId, patient.reminderPhone ?? patient.phone, message);
    logs.push(result.log);
    if (result.sent) sent++; else failed++;
  }

  return { sent, failed, logs };
}
