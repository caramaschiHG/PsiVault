import { NextRequest, NextResponse } from "next/server";
import { getMetricsRepository } from "@/lib/metrics/store";
import { resolveSession } from "@/lib/supabase/session";

interface MetricPayload {
  metricName: string;
  value: number;
  rating: string;
  pagePath: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payloads: MetricPayload[] = Array.isArray(body) ? body : [body];

    let workspaceId: string | null = null;
    try {
      const session = await resolveSession();
      workspaceId = session.workspaceId;
    } catch {
      // anonymous session — store with null workspaceId
    }

    const repo = getMetricsRepository();
    const now = new Date();

    await Promise.all(
      payloads.map((payload) =>
        repo.save({
          id: crypto.randomUUID(),
          metricName: payload.metricName,
          value: payload.value,
          rating: payload.rating ?? null,
          pagePath: payload.pagePath,
          workspaceId,
          sessionId: null,
          createdAt: now,
        })
      )
    );

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }
}
