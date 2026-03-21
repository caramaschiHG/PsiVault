import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  const startsAtStr = searchParams.get("startsAt");
  const durationMinutes = parseInt(searchParams.get("durationMinutes") ?? "50", 10);
  const excludeId = searchParams.get("excludeId");

  if (!workspaceId || !startsAtStr) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  // Validate workspace ownership
  const workspace = await db.workspace.findFirst({
    where: {
      id: workspaceId,
      ownerAccountId: user.id,
    },
    select: { id: true },
  });
  if (!workspace) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const startsAt = new Date(startsAtStr);
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

  const conflicting = await db.appointment.findFirst({
    where: {
      workspaceId,
      status: { in: ["SCHEDULED", "CONFIRMED"] },
      id: excludeId ? { not: excludeId } : undefined,
      AND: [
        { startsAt: { lt: endsAt } },
        { endsAt: { gt: startsAt } },
      ],
    },
    include: {
      patient: { select: { fullName: true, socialName: true } },
    },
  });

  if (!conflicting) {
    return NextResponse.json({ hasConflict: false });
  }

  const patientName = conflicting.patient?.socialName ?? conflicting.patient?.fullName ?? "Paciente";

  return NextResponse.json({
    hasConflict: true,
    conflictingAppointment: {
      id: conflicting.id,
      patientName,
      startsAt: conflicting.startsAt.toISOString(),
    },
  });
}
