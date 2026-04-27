"use server";

import { resolveSession } from "@/lib/supabase/session";
import { getAppointmentRepository } from "@/lib/appointments/store";

export async function getTodayConfirmedAppointmentsAction(): Promise<
  { startsAt: string; endsAt: string }[]
> {
  const { workspaceId } = await resolveSession();
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);

  const appointments = await getAppointmentRepository().listByDateRange(workspaceId, from, to);

  return appointments
    .filter((a) => a.status === "CONFIRMED")
    .map((a) => ({ startsAt: a.startsAt.toISOString(), endsAt: a.endsAt.toISOString() }));
}
