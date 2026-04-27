import type { PrismaClient } from "@prisma/client";

export interface SlotSuggestion {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ...
  hour: number; // 0-23
  total: number;
  completed: number;
  rate: number;
}

export async function getPatientAttendanceBySlot(
  prisma: PrismaClient,
  patientId: string,
  workspaceId: string,
  lookbackDays = 90,
): Promise<SlotSuggestion[]> {
  // Validate lookbackDays to prevent SQL injection
  if (!Number.isInteger(lookbackDays) || lookbackDays < 1 || lookbackDays > 365) {
    throw new Error("lookbackDays must be an integer between 1 and 365");
  }

  const rows = await prisma.$queryRawUnsafe<{
    dayOfWeek: number;
    hour: number;
    total: number;
    completed: number;
  }[]>(`
    SELECT
      EXTRACT(DOW FROM starts_at)::int AS "dayOfWeek",
      EXTRACT(HOUR FROM starts_at)::int AS "hour",
      COUNT(*)::int AS "total",
      COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS "completed"
    FROM appointments
    WHERE patient_id = $1
      AND workspace_id = $2
      AND status IN ('COMPLETED', 'NO_SHOW', 'CANCELED')
      AND starts_at >= NOW() - INTERVAL '${lookbackDays} days'
    GROUP BY EXTRACT(DOW FROM starts_at), EXTRACT(HOUR FROM starts_at)
    HAVING COUNT(*) >= 5
    ORDER BY (COUNT(*) FILTER (WHERE status = 'COMPLETED')::float / COUNT(*)::float) DESC
    LIMIT 3
  `, patientId, workspaceId);

  return rows.map((r) => ({
    dayOfWeek: r.dayOfWeek,
    hour: r.hour,
    total: r.total,
    completed: r.completed,
    rate: r.total > 0 ? r.completed / r.total : 0,
  }));
}

export function getTopSuggestions(slots: SlotSuggestion[]): SlotSuggestion[] {
  return slots.filter((s) => s.rate >= 0.5).slice(0, 2);
}

const DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export function formatSuggestionLabel(slot: SlotSuggestion): string {
  const day = DAY_NAMES[slot.dayOfWeek] ?? "";
  const hour = String(slot.hour).padStart(2, "0") + "h";
  return `${day}s ${hour}`;
}
