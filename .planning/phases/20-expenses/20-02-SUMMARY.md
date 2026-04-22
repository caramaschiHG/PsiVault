---
phase: 20
plan: "02"
subsystem: expenses
tags: [domain, model, repository, series, audit, security]
dependency_graph:
  requires: [prisma/schema.prisma, src/lib/audit/events.ts, src/lib/db.ts]
  provides: [src/lib/expenses/model.ts, src/lib/expenses/series.ts, src/lib/expenses/repository.ts, src/lib/expenses/repository.prisma.ts, src/lib/expenses/store.ts, src/lib/expenses/audit.ts, src/lib/expenses/format.ts]
  affects: []
tech_stack:
  added: [date-fns (addMonths, addDays)]
  patterns: [repository pattern, InMemory + Prisma implementations, factory with injected deps, global store singleton, SECU-05 audit metadata sanitization]
key_files:
  created:
    - src/lib/expenses/model.ts
    - src/lib/expenses/series.ts
    - src/lib/expenses/repository.ts
    - src/lib/expenses/repository.prisma.ts
    - src/lib/expenses/store.ts
    - src/lib/expenses/audit.ts
    - src/lib/expenses/format.ts
    - tests/expenses/model.test.ts
    - tests/expenses/series.test.ts
    - tests/expenses/repository.test.ts
    - tests/expenses/audit.test.ts
  modified: []
decisions:
  - MaterializeSeriesInput omits dueDate (not just seriesId/seriesIndex) — firstOccurrenceDate is the entry point for series scheduling
  - End-of-month clamping tested with UTC noon timestamps to avoid local timezone shifting
  - softDeleteWithScope "this" path skips series lookup when seriesId is null
metrics:
  duration: "~12 minutes"
  completed: "2026-04-22"
  tasks_completed: 5
  files_created: 11
---

# Phase 20 Plan 02: Expenses Domain Summary

**One-liner:** Full expenses domain with recurrence series (MENSAL/QUINZENAL), SECU-05-compliant audit, and InMemory + Prisma repositories.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 20-02-01 | Create model.ts — Expense type, createExpense, updateExpense | 7d7f11f |
| 20-02-02 | Create series.ts — materializeSeries (12 occurrences), applySeriesEdit | 7d7f11f |
| 20-02-03 | Create repository.ts + repository.prisma.ts + store.ts | 7d7f11f |
| 20-02-04 | Create audit.ts (SECU-05) + format.ts (BRL formatting) | 7d7f11f |
| 20-02-05 | Create 4 test files — 30 tests total | ab75348 |

## Verification

- `pnpm tsc --noEmit` — clean (pre-existing errors in unrelated test file only)
- `pnpm vitest run tests/expenses/` — **30/30 tests pass**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] MaterializeSeriesInput missing dueDate in Omit**
- **Found during:** Task 20-02-02 (tsc check)
- **Issue:** `MaterializeSeriesInput` extends `Omit<CreateExpenseInput, "seriesId" | "seriesIndex">` but `dueDate` is required in `CreateExpenseInput` and should be replaced by `firstOccurrenceDate`
- **Fix:** Added `"dueDate"` to the Omit list
- **Files modified:** `src/lib/expenses/series.ts`

**2. [Rule 1 - Bug] End-of-month test failing due to local timezone**
- **Found during:** Task 20-02-05 (test run)
- **Issue:** `new Date("2026-01-31")` is midnight UTC but local timezone shifts it, causing `addMonths` to return March 1 instead of Feb 28
- **Fix:** Changed test to use `new Date("2026-01-31T12:00:00Z")` (UTC noon) and asserted with `getUTCMonth()/getUTCDate()` instead of deep equality
- **Files modified:** `tests/expenses/series.test.ts`

## Known Stubs

None — this is a pure domain layer with no UI stubs.

## Threat Flags

None — no new network endpoints or auth paths introduced. All audit metadata sanitization follows SECU-05.

## Self-Check: PASSED

- src/lib/expenses/model.ts — FOUND
- src/lib/expenses/series.ts — FOUND
- src/lib/expenses/repository.ts — FOUND
- src/lib/expenses/repository.prisma.ts — FOUND
- src/lib/expenses/store.ts — FOUND
- src/lib/expenses/audit.ts — FOUND
- src/lib/expenses/format.ts — FOUND
- Commit 7d7f11f — FOUND
- Commit ab75348 — FOUND
- 30 tests passing — CONFIRMED
