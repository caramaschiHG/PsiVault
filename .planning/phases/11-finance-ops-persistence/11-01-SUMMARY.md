---
phase: 11-finance-ops-persistence
plan: "01"
subsystem: persistence
tags: [schema, prisma, repository, async, finance, audit, reminders]
dependency_graph:
  requires: []
  provides: [SessionCharge schema model, AuditEvent schema model, Reminder schema model, async SessionChargeRepository, async ReminderRepository, async AuditEventRepository]
  affects: [appointments/actions, financeiro/page, patients/[patientId]/page, actions/reminders, api/backup/route, inicio/page, api/export route, actions/search, settings/security/page]
tech_stack:
  added: []
  patterns: [Prisma model with back-relations, Promise.resolve() async wrapper in in-memory repos, Promise.all() for concurrent async calls in pages]
key_files:
  created:
    - prisma/migrations/20260318025800_add_finance_audit_reminders/migration.sql
  modified:
    - prisma/schema.prisma
    - src/lib/finance/repository.ts
    - src/lib/reminders/repository.ts
    - src/lib/audit/repository.ts
    - tests/audit-events.test.ts
    - tests/finance-domain.test.ts
    - tests/reminder-domain.test.ts
    - src/app/(vault)/appointments/actions.ts
    - src/app/(vault)/financeiro/page.tsx
    - src/app/(vault)/patients/[patientId]/page.tsx
    - src/app/(vault)/actions/reminders.ts
    - src/app/api/backup/route.ts
    - src/app/(vault)/inicio/page.tsx
    - src/app/api/export/patient/[patientId]/route.ts
    - src/app/(vault)/actions/search.ts
    - src/app/(vault)/settings/security/page.tsx
key_decisions:
  - "[Phase 11-01]: Migration SQL created manually (DIRECT_URL is a placeholder) — apply with npx prisma migrate deploy after configuring Supabase password"
  - "[Phase 11-01]: AuditEvent.append() stays sync (returns event synchronously); only listForWorkspace is async — consistent with append-only immutable audit trail semantics"
  - "[Phase 11-01]: SecuritySettingsPage converted to async Server Component to support await on listForWorkspace"
metrics:
  duration_seconds: 357
  completed_date: "2026-03-18"
  tasks_completed: 2
  files_modified: 16
---

# Phase 11 Plan 01: Schema Extension & Async Interface Migration Summary

Extends Prisma schema with three new models (SessionCharge, AuditEvent, Reminder), migrates all three repository interfaces from sync to async, and updates every call site across the codebase.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend schema.prisma with SessionCharge, AuditEvent, Reminder | aec4a52 | prisma/schema.prisma, migration.sql |
| 2 | Migrate repository interfaces to async + update callers | 66c847d | 15 files across src/ and tests/ |

## What Was Built

**Schema additions:** Three new Prisma models appended to `prisma/schema.prisma`:
- `SessionCharge` — FK to Workspace, Patient (Cascade), Appointment (Cascade, unique)
- `AuditEvent` — append-only (no updatedAt), FK to Workspace (Cascade)
- `Reminder` — optional patientId FK, linkType/linkId for polymorphic links

Back-relations added to Workspace (`sessionCharges`, `auditEvents`, `reminders`), Patient (`sessionCharges`, `reminders`), and Appointment (`sessionCharge`).

**Interface migration:** All three repository interfaces updated to return `Promise<T>`:
- `SessionChargeRepository`: all 6 methods async
- `ReminderRepository`: all 6 methods async
- `AuditEventRepository`: `listForWorkspace` async; `append` stays sync

In-memory implementations wrapped each return with `Promise.resolve()`.

**Call site updates:** 8 app files updated to `await` repository calls. Pages with multiple calls consolidated into `Promise.all()` for concurrency (`financeiro/page`, `inicio/page`, `patients/[patientId]/page`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Tests in finance-domain.test.ts and reminder-domain.test.ts used sync calls on now-async repositories**
- **Found during:** Task 2 (test execution)
- **Issue:** Repository tests called `repo.save()`, `repo.findById()`, etc. without `await`, returning `Promise` objects instead of resolved values
- **Fix:** Added `async/await` to all `it()` blocks in the `SessionChargeRepository` and `ReminderRepository` describe blocks in both test files
- **Files modified:** `tests/finance-domain.test.ts`, `tests/reminder-domain.test.ts`
- **Commit:** 66c847d

**2. [Rule 1 - Bug] actions/search.ts and settings/security/page.tsx still had sync calls**
- **Found during:** Task 2 (`npx tsc --noEmit`)
- **Issue:** `chargeRepo.listByPatient()` used in `flatMap` (sync), `repository.listForWorkspace()` called without `await`
- **Fix:** Converted to `Promise.all().flat()` pattern; made `SecuritySettingsPage` and `buildSecurityPageModel` async
- **Files modified:** `src/app/(vault)/actions/search.ts`, `src/app/(vault)/settings/security/page.tsx`
- **Commit:** 66c847d

## Deferred Issues

Pre-existing TypeScript errors in test files (`appointment-conflicts.test.ts`, `agenda-view-model.test.ts`, `appointment-defaults.test.ts`) — not caused by this plan. Documented in `deferred-items.md`.

## Verification

- `npx prisma validate` — passed
- `npx prisma generate` — passed (Prisma client includes SessionCharge, AuditEvent, Reminder)
- `npx vitest run tests/finance-domain.test.ts tests/audit-events.test.ts tests/reminder-domain.test.ts` — 70 tests passed
- `npx tsc --noEmit` — no errors in `src/` (pre-existing test file errors deferred)

## Self-Check: PASSED

All created/modified files exist on disk. Both task commits (aec4a52, 66c847d) verified in git log.
