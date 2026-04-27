---
phase: 43-arquitetura-multi-agent-foundation
plan: 03
subsystem: agents
tags: [processor, cron, retry, audit, tests]
dependency_graph:
  requires: [43-02]
  provides: []
  affects: [src/lib/agents/*, src/app/api/cron/agents/route.ts, tests/lib/agents/*]
tech-stack:
  added: []
  patterns: [cron-endpoint, retry-backoff, stall-detection, audit-trail]
key-files:
  created:
    - src/lib/agents/processor.ts
    - src/lib/agents/audit.ts
    - src/app/api/cron/agents/route.ts
    - tests/lib/agents/orchestrator.test.ts
    - tests/lib/agents/processor.test.ts
decisions:
  - "Retry backoff: 5min, 15min, 45min (up to 3 retries total)"
  - "Stall threshold: 10 minutes for RUNNING tasks"
  - "Cron endpoint groups tasks by workspace and processes via Promise.allSettled"
  - "Audit events use Portuguese summaries per project vocabulary rules"
metrics:
  duration: "~25 min"
  completed_date: "2026-04-27"
---

# Phase 43 Plan 03: Processor, Cron & Audit Summary

**One-liner:** Background task processor with retry backoff and stall detection, cron endpoint with workspace-scoped concurrent execution, Portuguese audit trail, and 12 passing unit tests.

## What Was Built

- **Task processor** (`processor.ts`) — Full lifecycle management: PENDING → RUNNING → DONE|ERROR|SKIPPED. Retry backoff (5/15/45 min up to 3 retries). Stall detection reclaims RUNNING tasks older than 10 minutes. Handles agent exceptions gracefully.
- **Audit helpers** (`audit.ts`) — `buildAgentTaskAuditPayload` for all 9 agent lifecycle events with Portuguese summaries consistent with clinical app vocabulary.
- **Cron endpoint** (`api/cron/agents/route.ts`) — CRON_SECRET Bearer auth. Registers stub `agenda` agent. Fetches pending tasks across workspaces, groups by workspace, processes concurrently via `Promise.allSettled`. Emits audit events for non-DONE outcomes. Returns aggregated metrics.
- **Unit tests** — 12 tests covering orchestrator config logic, retry schedule math, stall detection, DONE processing, ERROR retry exhaustion, and stalled task reclamation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] Adapted cron endpoint to actual audit repository API**
- **Found during:** Task 3
- **Issue:** Plan referenced `getAuditEventRepository()` and `auditRepo.save()`, but the actual codebase exports `getAuditRepository()` with `append(event)` (synchronous).
- **Fix:** Used `getAuditRepository()` and `auditRepo.append(auditEvent)` with `createAuditEvent` from `lib/audit/events`.
- **Files modified:** `src/app/api/cron/agents/route.ts`

**2. [Rule 1 - Bug] Fixed orchestrator tests to use in-memory singletons**
- **Found during:** Task 4 (test execution)
- **Issue:** Orchestrator tests failed because `createAgentOrchestrator` calls `getAgentTaskRepository()` and `getWorkspaceAgentConfigRepository()`, which defaulted to Prisma implementations and failed with DB auth errors.
- **Fix:** Set `globalThis.__psivaultAgentTasks__` and `globalThis.__psivaultAgentConfigs__` to in-memory repos in `beforeEach` and before each test that needs them.
- **Files modified:** `tests/lib/agents/orchestrator.test.ts`

**3. [Rule 1 - Bug] Fixed stalled task test expectation**
- **Found during:** Task 4 (test execution)
- **Issue:** Test expected a `RETRIED` or `DONE` result for stalled tasks, but the processor reclaims stalled tasks to `PENDING` with a future scheduled time and does not process them in the same run.
- **Fix:** Updated test to assert that the stalled task status becomes `PENDING`, `retryCount` becomes 1, and `scheduledFor` is in the future. No result is expected from the current run.
- **Files modified:** `tests/lib/agents/processor.test.ts`

## Known Stubs

| File | Line | Reason |
|------|------|--------|
| src/app/api/cron/agents/route.ts | ~107-115 | Agenda agent `executeTask` returns SKIPPED with note "Agenda agent not yet implemented — Phase 44". This is intentional; Phase 44 will replace with real logic. |

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: spoofing | src/app/api/cron/agents/route.ts | Cron endpoint protected by CRON_SECRET env var Bearer token. 401 returned on mismatch. |
| threat_flag: denial_of_service | src/lib/agents/processor.ts | Promise.allSettled isolates workspace failures. Limit=50 per workspace prevents runaway processing. |

## Self-Check: PASSED

- [x] Processor compiles without TypeScript errors
- [x] Cron endpoint compiles without TypeScript errors
- [x] Audit helpers compile without TypeScript errors
- [x] All 12 unit tests pass
- [x] `computeRetrySchedule` produces exact minute offsets verified in tests
- [x] `isStalled` correctly identifies old RUNNING tasks

## Commits

- `9e1c55f`: feat(43-03): implement agent task processor
- `0188a54`: feat(43-03): create agent audit trail helpers
- `c761f3b`: feat(43-03): create cron endpoint for agent task processing
- `77a590f`: test(43-03): add unit tests for orchestrator and processor
