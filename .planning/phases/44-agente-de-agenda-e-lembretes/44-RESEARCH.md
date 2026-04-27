# Phase 44: Agente de Agenda & Lembretes - Research

**Researched:** 2026-04-27
**Domain:** Background agent tasks, appointment analytics, proactive reminders, schedule optimization, Calm UX notifications
**Confidence:** HIGH

## Summary

Phase 44 builds the first production agent on top of the Phase 43 multi-agent foundation. The Agenda Agent operates asynchronously to detect no-show patterns, batch patient reminders, suggest optimal scheduling slots, and produce a daily summary — all without interrupting active clinical sessions.

The stack already provides everything needed: Prisma 6.6 + PostgreSQL (Supabase) for data and aggregation, Next.js 15 Route Handlers for cron endpoints, `date-fns` for timezone-safe date math, and the existing `AgentOrchestrator` + `AgentRegistry` for task lifecycle. No new runtime dependencies are required.

**Primary recommendation:** Implement the Agenda Agent as a registered agent in the existing registry, use Vercel Cron (already configured in `vercel.json`) for the daily reminder batch, and compute schedule suggestions via a Prisma raw query or in-memory aggregation over the patient's scoped appointment history.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Threshold de alerta: **2 no-shows seguidos** (status `NO_SHOW` consecutivos no histórico do paciente).
- **D-02:** Alerta aparece em **3 surfaces**: `PatientSummaryCards` (perfil do paciente), lista de pacientes (`/patients`), e card de atendimento na agenda (day/week/month views).
- **D-03:** Visual: **dot vermelho sólido de 8px** com tooltip ao hover explicando "2 faltas consecutivas detectadas".
- **D-04:** Auto-dismiss: alerta **desaparece automaticamente** após o próximo atendimento do paciente ser confirmado ou completado (`status` muda para `CONFIRMED` ou `COMPLETED`).
- **D-05:** Prioridade da tarefa de detecção: `high` (mapeia para badge/count na hierarquia Calm).
- **D-06:** Sugestão: badge **verde** indicando horários com **maior taxa de comparecimento** do paciente.
- **D-07:** Local: badge aparece **no slot vazio da agenda** quando o psicólogo está criando novo agendamento para o paciente.
- **D-08:** Interação: badge é **clicável** e **preenche o horário sugerido** no formulário de agendamento.
- **D-09:** Algoritmo: baseado **apenas no histórico do paciente específico** — não mistura dados de outros pacientes.
- **D-10:** Threshold de dados: sugestão aparece apenas após **mínimo de 5 atendimentos** no histórico do paciente.
- **D-11:** Granularidade: **dia da semana + faixa horária** (ex: "quartas 14h").
- **D-12:** Prioridade da tarefa: `medium` (mapeia para notification dropdown).
- **D-13:** Entrega: **mock/skeleton primeiro** — pipeline completo com sender que apenas loga/grava no banco. Integração real com WhatsApp/SMS (Twilio ou similar) é escopo de fase futura (v2.1+).
- **D-14:** Batch: **um lembrete por paciente por dia**, agregando todos os atendimentos do dia seguinte. Ex: "Você tem 2 atendimentos amanhã: 10h e 14h".
- **D-15:** Destinatário: **apenas paciente** — psicólogo já gerencia própria agenda.
- **D-16:** Timing: enviado **noite anterior às 20h** (horário padrão, configurável por paciente).
- **D-17:** Patient model ganha 2 campos novos: `reminderPhone` (telefone para lembretes, pode ser diferente de `phone`) e `preferredReminderTime` (hora do dia para receber lembretes, default 20h).
- **D-18:** Prioridade da tarefa: `medium` (mapeia para notification dropdown).
- **D-19:** Gatilho: aparece quando o **último atendimento do dia é marcado como `COMPLETED`**.
- **D-20:** Formato: **notificação no dropdown do sino** de notificações. Título: "Resumo do dia — {data}".
- **D-21:** Conteúdo: **apenas output do Agenda Agent** — faltas detectadas no dia, lembretes enviados, sugestões de horário geradas.
- **D-22:** Persistência: notificação **persiste como "lida"** no histórico do sino. Remove automaticamente após **7 dias**.
- **D-23:** Dias vazios: **não aparece** se não houver pelo menos 1 atendimento no dia.
- **D-24:** Audiência: **apenas o psicólogo** (`accountId` que criou os atendimentos), não todos os membros do workspace.
- **D-25:** Prioridade da tarefa: `low` (mapeia para daily digest).

### the agent's Discretion
- Estratégia exata de cálculo da taxa de comparecimento (ex: janela de 90 dias, peso por recência)
- Formato exato da mensagem de lembrete mock (template string)
- CSS exato do dot vermelho (8px, cor, posicionamento)
- Estrutura do payload JSON para cada tipo de tarefa do Agenda Agent
- Lógica exata para detectar "último atendimento do dia" (comparação de `startsAt` no mesmo dia)
- Estratégia de persistência do Resumo do Dia no notification storage (novo tipo ou reuse)
- Schema migration para campos `reminderPhone` e `preferredReminderTime` no Patient

### Deferred Ideas (OUT OF SCOPE)
- **Integração real WhatsApp/SMS** (Twilio, etc.) — v2.1+, quando mock estiver validado
- **Integração Google Calendar/Outlook** (AGEND-05) — v2.1+
- **Previsão de cancelamento com ML** (AGEND-06) — v2.1+
- **Resumo do Dia com output de outros agentes** — quando Calm UX Agent e Monitoramento Agent existirem
- **Plugin system para agentes de terceiros** (ARCH-05) — v2.1+
- **Push notifications real-time** — v2.2+, requer Supabase Realtime ou service workers
- **Lembretes para psicólogo** — pode ser adicionado futuramente como opção configurável
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AGEND-01 | Sistema detecta padrões de faltas e no-shows por paciente e exibe alerta periférico (status light) no card do paciente, nunca como modal ou popup | Use existing `AppointmentRepository.listByPatient` + status scan; render dot in 3 UI surfaces (D-02, D-03). Auto-dismiss via status transition (D-04). |
| AGEND-02 | Agente envia lembretes proativos para pacientes via WhatsApp/SMS com batching diário, respeitando horário de preferência do paciente | Mock sender first (D-13). Daily batch at patient `preferredReminderTime` (D-16, D-17). Aggregate next-day appointments per patient. Use Vercel/Supabase Cron. |
| AGEND-03 | Agente sugere otimização de horários baseada em histórico de disponibilidade do psicólogo e padrões de comparecimento dos pacientes | Compute `(dayOfWeek, hour)` completion ratio from patient history (D-09, D-10, D-11). Prisma raw query with `EXTRACT(DOW/HOUR FROM startsAt)` recommended for repository layer. |
| AGEND-04 | Notificações de agenda são agrupadas em "Resumo do Dia" exibido após o último atendimento do dia, nunca durante sessão | Trigger on last appointment `COMPLETED` (D-19). Server-side summary generation, client-side notification injection (D-20..D-24). |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| No-show detection logic | API / Backend | Browser / Client | History scan is a data query; UI only renders the resulting boolean/dot. |
| Peripheral alert (dot) | Browser / Client | — | DOM element rendered by React component, no server involvement after hydration. |
| Reminder batching & mock sending | API / Backend | — | Cron-triggered task runs on server, queries DB, invokes sender interface. |
| Schedule suggestion algorithm | API / Backend | — | Aggregation over historical appointments belongs in repository/backend. |
| Resumo do Dia generation | API / Backend | Browser / Client | Backend determines content and eligibility; client displays in notification dropdown. |
| Notification persistence | Browser / Client | API / Backend | Current `LocalNotificationStorage` is client-side; server may generate content via API. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.2.4 | App Router, Route Handlers, Server Actions | Project standard [VERIFIED: package.json] |
| Prisma | 6.6.0 | ORM, migrations, raw SQL | Project standard [VERIFIED: package.json] |
| PostgreSQL (Supabase) | 15+ | Persistence, cron extension | Project standard [VERIFIED: Supabase docs] |
| date-fns | 4.1.0 | Timezone-safe date math, `isSameDay`, `getDay`, `format` | Already installed, best for JS date manipulation [VERIFIED: package.json] |
| Vercel Cron | N/A | Time-based HTTP triggers | Already used (`vercel.json` has `/api/cron/notifications`) [VERIFIED: vercel.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Supabase pg_cron | N/A | Native Postgres cron jobs | Alternative to Vercel Cron if tighter DB integration needed; can invoke Edge Function or HTTP [CITED: supabase.com/docs/guides/cron] |
| Prisma `$queryRaw` | 6.6.0 | Raw SQL for date-part extraction | When `groupBy` cannot express `EXTRACT(DOW FROM startsAt)` [CITED: prisma.io/docs] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel Cron | Inngest / QStash | More features (retries, observability), but adds vendor dependency and cost. Vercel Cron is sufficient for daily batching. |
| Prisma raw query | In-memory JS aggregation | Simpler type safety, but loads all patient history into memory. Acceptable for small histories (<200 appts/patient), but raw SQL scales better. |
| Mock sender (console log) | Twilio API | Real integration is deferred to v2.1 per CONTEXT.md. Mock validates pipeline first. |

**Installation:**
No new packages required. `date-fns` and Prisma are already installed.

**Version verification:**
- `next`: 15.2.4 (published 2025-03) [VERIFIED: package.json]
- `prisma`: 6.6.0 (published 2025-04) [VERIFIED: package.json]
- `date-fns`: 4.1.0 (published 2024-09) [VERIFIED: package.json]

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER / CLIENT                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Patient List    │  │ Patient Profile │  │ Agenda Views    │ │
│  │ (dot alert)     │  │ (dot + tooltip) │  │ (badge suggest) │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │          │
│  ┌────────▼────────────────────▼────────────────────▼────────┐ │
│  │            Notification Dropdown (localStorage)           │ │
│  │              • Resumo do Dia (agent_summary)              │ │
│  └─────────────────────────────┬─────────────────────────────┘ │
└────────────────────────────────┼────────────────────────────────┘
                                 │ fetch / Server Action
┌────────────────────────────────▼────────────────────────────────┐
│                      NEXT.JS API / BACKEND                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Route Handlers                                          │  │
│  │  • /api/cron/agents (existing, every 15 min)             │  │
│  │  • /api/cron/reminders (new, daily at 20h UTC)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AgentOrchestrator.enqueueTask()                         │  │
│  │  • On appointment status change → enqueue detection task │  │
│  │  • On last appointment completed → enqueue summary task  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AgendaAgent.executeTask()                               │  │
│  │  • no_show_detection → scan history → emit alert flag    │  │
│  │  • reminder_batch → query next-day → MockReminderSender  │  │
│  │  • schedule_suggestion → aggregate → store suggestion    │  │
│  │  • daily_summary → build payload → return to caller      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Prisma / Raw SQL
┌────────────────────────────────▼────────────────────────────────┐
│                     POSTGRESQL (SUPABASE)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ appointments │  │ agent_tasks  │  │ patients (+new cols) │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
src/
├── lib/
│   ├── agents/
│   │   ├── agenda/
│   │   │   ├── agent.ts              # AgendaAgent implementation (Agent interface)
│   │   │   ├── no-show-detector.ts   # scan history, return alert state
│   │   │   ├── reminder-sender.ts    # ReminderSender interface + MockReminderSender
│   │   │   ├── schedule-optimizer.ts # aggregate history, return suggestions
│   │   │   └── daily-summary.ts      # build Resumo do Dia payload
│   │   ├── model.ts                  # existing
│   │   ├── orchestrator.ts           # existing
│   │   ├── processor.ts              # existing
│   │   └── registry.ts               # existing
│   ├── appointments/
│   │   └── repository.ts             # add listByPatientWithDateRange if needed
│   └── notifications/
│       └── types.ts                  # extend AppNotification with agent_summary
├── app/
│   ├── api/
│   │   └── cron/
│   │       ├── agents/route.ts       # register AgendaAgent + process tasks
│   │       └── reminders/route.ts    # NEW: daily batch trigger (Vercel Cron)
│   └── (vault)/
│       ├── patients/
│       │   ├── page.tsx              # inject noShowAlert into list items
│       │   └── components/
│       │       └── patient-summary-cards.tsx  # render 8px dot
│       └── agenda/
│           └── components/
│               └── ...               # render suggestion badge
```

### Pattern 1: Agent Task Enqueue on State Change
**What:** When an appointment mutates to `NO_SHOW`, `CONFIRMED`, or `COMPLETED`, the Server Action enqueues an Agenda Agent task via `AgentOrchestrator.enqueueTask()`.
**When to use:** All reactive agent behaviors (no-show detection, daily summary trigger, auto-dismiss).
**Example:**
```typescript
// Source: src/lib/agents/orchestrator.ts (project pattern)
await orchestrator.enqueueTask({
  workspaceId: appointment.workspaceId,
  agentId: "agenda",
  type: "no_show_detection",
  priority: "high",
  payload: { patientId: appointment.patientId },
  idempotencyKey: `agenda:no-show:${appointment.patientId}:${appointment.id}`,
});
```

### Pattern 2: Peripheral Alert (Calm UX Status Light)
**What:** A small, non-interruptive visual indicator (8px solid red dot) with native tooltip (`title` attribute) explaining the alert.
**When to use:** AGEND-01 requires peripheral alert, never modal/popup.
**Example:**
```tsx
// Source: CLAUDE.md (Calm UX anti-patterns)
<span
  title="2 faltas consecutivas detectadas"
  style={{
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "var(--color-red-mid)",
    display: "inline-block",
  }}
/>
```

### Pattern 3: Daily Batch Cron
**What:** A dedicated Vercel Cron job that triggers a Route Handler once per day to batch-remind patients of next-day appointments.
**When to use:** AGEND-02 requires daily batching at a configurable hour.
**Configuration:**
```json
// Source: Vercel Cron docs (vercel.com/docs/cron-jobs)
{
  "crons": [
    { "path": "/api/cron/reminders", "schedule": "0 20 * * *" }
  ]
}
```
**Handler:**
```typescript
// Source: Next.js Route Handlers docs
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  // Auth via CRON_SECRET
  // Query all CONFIRMED appointments for tomorrow
  // Group by patient
  // Enqueue one reminder task per patient
}
```

### Anti-Patterns to Avoid
- **Polling the DB from the client for no-show status:** Never call `listByPatient` from a React component. The alert must be hydrated server-side (Server Component query or Server Action) and passed as props.
- **Modal/popup for no-show alert:** Violates Calm UX hierarchy (status light > badge > dropdown > modal).
- **Sending reminders during business hours:** Must respect patient `preferredReminderTime` (default 20h) and never batch during active sessions.
- **Using `transition: all` for the dot/badge animations:** Violates project motion.css rules. Use explicit `opacity` / `transform` only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron scheduling | Custom `setInterval` in Node.js | Vercel Cron or Supabase pg_cron | Vercel Cron is free, reliable, and already used. Custom intervals die on serverless cold starts. |
| No-show prediction ML | TensorFlow / custom model | Simple heuristic (2 consecutive no-shows) | CONTEXT.md defers ML to v2.1. A heuristic is explainable, fast, and sufficient for a peripheral alert. |
| Date math (timezone, DOW) | Native `Date` methods | `date-fns` (`getDay`, `isSameDay`, `format`) | Already installed, handles edge cases (DST, locale) correctly. |
| Notification protocol | WebSockets / SSE for reminders | Extend existing `AppNotification` union | Real-time push is deferred to v2.2+. Batch + cron satisfies current requirements. |
| SMS/WhatsApp sender | Direct Twilio integration | `ReminderSender` interface with `MockReminderSender` | Real integration is v2.1. Interface-first design allows swap later. |

**Key insight:** The hard part of this phase is not the algorithms (they are simple heuristics) but the **orchestration wiring** — ensuring every appointment status change enqueues the right task, the cron fires reliably, and the UI surfaces remain Calm-compliant.

## Common Pitfalls

### Pitfall 1: Timezone Mismatch in "Last Appointment of the Day"
**What goes wrong:** `startsAt` is stored in UTC (or ISO 8601). Comparing `startsAt` to "today" using `new Date()` on the server (which may be in US-EAST) produces wrong day boundaries for Brazil (UTC-3).
**Why it happens:** Serverless runtimes default to UTC. The client's "today" is different.
**How to avoid:** Always use `date-fns` `isSameDay` with explicit timezone awareness, or store/compare using the workspace's configured timezone. If no timezone is stored, assume `America/Sao_Paulo` (pt-BR default) and document the assumption.
**Warning signs:** Daily summary triggers at 21h UTC (midnight BRT) instead of after the last session; unit tests passing locally but failing in CI.

### Pitfall 2: Prisma `groupBy` Cannot Extract Date Parts
**What goes wrong:** Attempting `prisma.appointment.groupBy({ by: ['startsAt'] })` groups by the full timestamp, not by day-of-week or hour.
**Why it happens:** Prisma `groupBy` groups by exact field values. It does not support `EXTRACT(DOW FROM startsAt)` natively.
**How to avoid:** Use `$queryRaw` with typed raw SQL for the schedule optimizer query, or fetch the filtered history and aggregate in-memory. For the typical psychology practice (<200 appointments per patient), in-memory is acceptable and type-safe.
**Warning signs:** TypeScript errors on `groupBy` fields; runtime groups that are all size 1.

### Pitfall 3: Race Condition on Daily Summary Trigger
**What goes wrong:** Two appointments ending at nearly the same time both trigger "last appointment of the day" checks, producing duplicate Resumo do Dia notifications.
**Why it happens:** Concurrent Server Actions for `completeAppointmentAction` may run in parallel.
**How to avoid:** Use an idempotency key based on `workspaceId`, `accountId`, and `date` when enqueuing the daily summary task. The `AgentTaskRepository.findByIdempotencyKey` check in `enqueueTask` prevents duplicates if the orchestrator checks before saving.
**Warning signs:** Duplicate notifications in the dropdown; multiple `agent_summary` tasks with same date.

### Pitfall 4: N+1 Queries in Patient List with No-Show Alerts
**What goes wrong:** Rendering a list of 50 patients and calling `listByPatient` for each to check no-show status results in 51 queries.
**Why it happens:** Each patient card independently fetches appointment history.
**How to avoid:** Compute no-show alerts in the parent Server Component (or in a dedicated repository method) and pass the alert flag as part of the patient list item DTO. A single raw SQL query can return all active patients plus a boolean `hasNoShowAlert`.
**Warning signs:** Slow page loads (>500ms TTFB); Prisma query logs showing 50+ `SELECT` statements.

## Code Examples

### Prisma Raw Query for Schedule Optimization
```typescript
// Source: Prisma docs ($queryRaw) + PostgreSQL EXTRACT
import type { PrismaClient } from "@prisma/client";

interface SlotSuggestion {
  dayOfWeek: number; // 0 = Sunday
  hour: number;
  total: number;
  completed: number;
  rate: number;
}

export async function getPatientAttendanceBySlot(
  prisma: PrismaClient,
  patientId: string,
  workspaceId: string,
): Promise<SlotSuggestion[]> {
  const rows = await prisma.$queryRaw<SlotSuggestion[]>`
    SELECT
      EXTRACT(DOW FROM starts_at)::int AS "dayOfWeek",
      EXTRACT(HOUR FROM starts_at)::int AS "hour",
      COUNT(*)::int AS "total",
      COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS "completed"
    FROM appointments
    WHERE patient_id = ${patientId}
      AND workspace_id = ${workspaceId}
      AND status IN ('COMPLETED', 'NO_SHOW', 'CANCELED')
      AND starts_at >= NOW() - INTERVAL '90 days'
    GROUP BY EXTRACT(DOW FROM starts_at), EXTRACT(HOUR FROM starts_at)
    HAVING COUNT(*) >= 5
    ORDER BY (COUNT(*) FILTER (WHERE status = 'COMPLETED')::float / COUNT(*)::float) DESC
    LIMIT 3
  `;
  return rows.map((r) => ({
    ...r,
    rate: r.completed / r.total,
  }));
}
```

### Detecting Consecutive No-Shows
```typescript
// Source: project pattern (repository + model)
import type { Appointment } from "@/lib/appointments/model";

export function hasConsecutiveNoShows(
  appointments: Appointment[],
  threshold = 2,
): boolean {
  // appointments sorted newest first (from listByPatient)
  let count = 0;
  for (const appt of appointments) {
    if (appt.status === "NO_SHOW") {
      count++;
      if (count >= threshold) return true;
    } else if (appt.status === "COMPLETED" || appt.status === "CONFIRMED") {
      // Any completed/confirmed appointment breaks the streak
      return false;
    }
    // Ignore SCHEDULED/CANCELED? Per D-01: "consecutivos no histórico"
    // Interpretation: consecutive NO_SHOWs with no COMPLETED/CONFIRMED in between.
  }
  return false;
}
```

### Date Boundary Check for Daily Summary
```typescript
// Source: date-fns docs (date-fns.org)
import { isSameDay, parseISO } from "date-fns";

export function isLastAppointmentOfDay(
  completedAppointment: { startsAt: Date },
  allTodayAppointments: { startsAt: Date; status: string }[],
): boolean {
  const today = completedAppointment.startsAt;
  const laterToday = allTodayAppointments.filter(
    (a) =>
      isSameDay(parseISO(a.startsAt.toISOString()), today) &&
      a.startsAt > completedAppointment.startsAt &&
      (a.status === "SCHEDULED" || a.status === "CONFIRMED"),
  );
  return laterToday.length === 0;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phase 43 stub agent | Real Agenda Agent with task types | Phase 44 | Replaces `SKIPPED` stub with production logic. |
| LocalStorage-only notifications | Hybrid server-generated + client-stored | Phase 44 | Resumo do Dia requires server-side generation; can reuse `LocalNotificationStorage` if client fetches and injects. |
| Manual reminder sending | Batched mock sender pipeline | Phase 44 | Automates reminder workflow without real SMS cost yet. |

**Deprecated/outdated:**
- **Stub agent inline in `/api/cron/agents/route.ts`:** Moving agent registration to a dedicated factory/builder (e.g., `buildAgentRegistry()`) keeps the cron route clean and testable.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `startsAt` is stored in UTC and the workspace operates in `America/Sao_Paulo` | Pitfall 1 | Daily summary and reminder timing will be off by 3 hours. |
| A2 | In-memory aggregation over patient history is performant enough because psychologists have <200 appointments per patient | Standard Stack | If a patient has thousands of appointments, UI latency increases. Raw SQL fallback exists. |
| A3 | The existing `LocalNotificationStorage` can be extended to accept server-generated notifications via a fetch/Server Action | Architecture Patterns | If localStorage quota is exceeded or the user clears it, Resumo do Dia is lost. A server-side `Notification` table may be needed later. |
| A4 | `NO_SHOW` status is reliably set by `noShowAppointmentAction` and `COMPLETED` by `completeAppointmentAction` | Patterns | If status mutations bypass actions, agent tasks won't fire. |

## Open Questions

1. **Where should agent registry registration live?**
   - What we know: The stub registers inline in `/api/cron/agents/route.ts`.
   - What's unclear: Whether Phase 44 should extract this to `src/lib/agents/build-registry.ts` so multiple entry points (cron, tests, manual triggers) share the same registry.
   - Recommendation: Create a `buildAgentRegistry()` factory that registers all production agents. Use it in the cron route and in tests.

2. **How should Resumo do Dia persist?**
   - What we know: `LocalNotificationStorage` is client-side only.
   - What's unclear: Whether to add a `Notification` Prisma model now, or generate summaries on-the-fly via API and inject into localStorage.
   - Recommendation: Hybrid approach — API endpoint generates summary; client calls it after last appointment completion and saves to localStorage. This avoids a schema migration for notifications and respects the existing architecture. Flag for v2.1 if cross-device sync is needed.

3. **Should reminder batching use a separate cron job or reuse `/api/cron/agents`?**
   - What we know: `/api/cron/agents` runs every 15 minutes and processes `PENDING` tasks.
   - What's unclear: Whether reminder tasks should be pre-enqueued with `scheduledFor = 20h` and picked up by the existing cron, or triggered by a dedicated daily cron.
   - Recommendation: Pre-enqueue reminder tasks with `scheduledFor` set to each patient's preferred time. The existing 15-minute cron will pick them up. This avoids a second cron definition and leverages the priority queue already built.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Next.js 15 | App Router, Route Handlers | ✓ | 15.2.4 | — |
| Prisma 6 | ORM, migrations | ✓ | 6.6.0 | — |
| PostgreSQL (Supabase) | Persistence, pg_cron | ✓ | 15+ | — |
| Vercel Cron | Daily batch trigger | ✓ | N/A | Supabase pg_cron |
| date-fns | Date math | ✓ | 4.1.0 | — |
| Vitest | Unit tests | ✓ | 3.0.9 | — |

**Missing dependencies with no fallback:**
- None identified.

**Missing dependencies with fallback:**
- None identified.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.0.9 |
| Config file | `vitest.config.ts` (inferred from project standard) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AGEND-01 | Detects 2 consecutive NO_SHOWs | unit | `vitest run src/lib/agents/agenda/no-show-detector.test.ts` | ❌ Wave 0 |
| AGEND-01 | Dot renders in PatientSummaryCards | unit | `vitest run src/app/(vault)/patients/components/patient-summary-cards.test.tsx` | ❌ Wave 0 |
| AGEND-02 | Enqueues reminder task for tomorrow | unit | `vitest run src/lib/agents/agenda/reminder-sender.test.ts` | ❌ Wave 0 |
| AGEND-02 | MockSender logs expected message | unit | `vitest run src/lib/agents/agenda/reminder-sender.test.ts` | ❌ Wave 0 |
| AGEND-03 | Returns top slot by completion rate | unit | `vitest run src/lib/agents/agenda/schedule-optimizer.test.ts` | ❌ Wave 0 |
| AGEND-04 | Triggers summary only after last appointment | unit | `vitest run src/lib/agents/agenda/daily-summary.test.ts` | ❌ Wave 0 |
| AGEND-04 | Idempotency prevents duplicate summaries | unit | `vitest run src/lib/agents/agenda/daily-summary.test.ts` | ❌ Wave 0 |
| ARCH-01 | AgendaAgent registers and executes tasks | integration | `vitest run src/lib/agents/agenda/agent.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test --run --reporter=verbose`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/agents/agenda/no-show-detector.test.ts` — covers AGEND-01
- [ ] `src/lib/agents/agenda/schedule-optimizer.test.ts` — covers AGEND-03
- [ ] `src/lib/agents/agenda/reminder-sender.test.ts` — covers AGEND-02
- [ ] `src/lib/agents/agenda/daily-summary.test.ts` — covers AGEND-04
- [ ] `src/lib/agents/agenda/agent.test.ts` — covers ARCH-01 integration

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Cron uses `CRON_SECRET` bearer token (already implemented) |
| V3 Session Management | no | No user sessions in cron context |
| V4 Access Control | yes | Agent tasks MUST be scoped to `workspaceId`; repositories already enforce this |
| V5 Input Validation | yes | Validate `patientId`, `workspaceId`, and phone numbers (`reminderPhone`) before persistence |
| V6 Cryptography | no | No new crypto in this phase |
| V7 Error Handling | yes | Agent tasks must not leak stack traces to client; errors go to `agent_tasks.errorNote` |
| V10 Malicious Code | yes | Raw SQL (`$queryRaw`) must use tagged template literals (parameterized) — never string concatenation |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL Injection in schedule optimizer | Tampering | Use Prisma `$queryRaw` tagged templates with inline variables (e.g., `${patientId}`) — Prisma auto-parameterizes |
| Unauthorized cron invocation | Spoofing | Verify `Authorization: Bearer ${CRON_SECRET}` in every cron Route Handler (already implemented) |
| Cross-workspace data leakage | Information Disclosure | Every repository query MUST include `workspaceId` filter; existing pattern in `AppointmentRepository` |
| Phone number enumeration | Information Disclosure | `reminderPhone` is workspace-scoped; never return it in patient list DTOs unless necessary |

## Sources

### Primary (HIGH confidence)
- `src/lib/agents/model.ts` — AgentTask interface, priorities, status lifecycle
- `src/lib/agents/orchestrator.ts` — enqueueTask, config checks, idempotency
- `src/lib/agents/processor.ts` — retry logic, stall detection, processAgentTasks
- `src/lib/agents/repository.ts` — listPendingByPriority, listPendingAcrossWorkspaces
- `src/lib/appointments/repository.ts` — listByPatient, listByDateRange
- `src/lib/patients/model.ts` — Patient shape, updatePatient factory
- `src/lib/notifications/types.ts` — AppNotification union
- `src/app/api/cron/agents/route.ts` — existing cron auth and registry stub
- `package.json` — dependency versions
- `vercel.json` — existing cron configuration

### Secondary (MEDIUM confidence)
- [Prisma Aggregation docs](https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing) — `groupBy` limitations, `$queryRaw` usage
- [Vercel Cron Jobs docs](https://vercel.com/docs/cron-jobs) — schedule syntax, UTC constraint
- [Supabase Cron docs](https://supabase.com/docs/guides/cron) — pg_cron alternative
- [Next.js Route Handlers docs](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) — `runtime = "nodejs"`, request handling

### Tertiary (LOW confidence)
- `date-fns` timezone behavior with `isSameDay` — assumed to work correctly with Date objects from Prisma (which are UTC). Verified locally recommended.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are already in use and versions verified.
- Architecture: HIGH — Phase 43 foundation is solid and well-documented in code.
- Pitfalls: MEDIUM-HIGH — timezone and Prisma `groupBy` limitations are verified via docs; race condition is inferred from existing code patterns.

**Research date:** 2026-04-27
**Valid until:** 2026-05-27 (30 days for stable stack)
