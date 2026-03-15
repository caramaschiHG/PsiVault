---
phase: 06-retrieval-recovery-and-launch-polish
plan: 01
subsystem: domain
tags: [reminders, tdd, vitest, in-memory-repository, audit, wave-0-scaffolds]

# Dependency graph
requires:
  - phase: 05-finance-and-assisted-operations
    provides: SessionChargeRepository pattern, audit event factory pattern, in-memory store pattern
  - phase: 03-clinical-record-core
    provides: ClinicalNote types used in export-backup scaffold fixture
  - phase: 04-document-vault
    provides: PracticeDocument types used in export-backup scaffold fixture
provides:
  - Reminder domain module (model, repository, store, audit) with full TDD coverage
  - ReminderRepository with listActive, listCompleted, listActiveByPatient, listCompletedByPatient
  - getReminderRepository globalThis singleton (__psivaultReminders__)
  - createReminderAuditEvent with SECU-05 whitelist enforcement
  - finance/repository.ts extended with listByWorkspaceAndMonth for DASH-02 aggregation
  - Wave 0 test scaffolds for Plans 02 (dashboard), 03 (search), and 04 (export)
affects:
  - 06-02 (dashboard aggregation — imports from src/lib/dashboard/aggregation.ts)
  - 06-03 (search domain — imports from src/lib/search/search.ts)
  - 06-04 (export/backup — imports from src/lib/export/serializer.ts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD RED-GREEN cycle for domain modules
    - Wave 0 scaffold test files (fail on import; implementations in downstream plans)
    - globalThis singleton pattern for reminder repository (__psivaultReminders__)
    - Immutable update pattern for completeReminder (spread, no mutation)

key-files:
  created:
    - src/lib/reminders/model.ts
    - src/lib/reminders/repository.ts
    - src/lib/reminders/store.ts
    - src/lib/reminders/audit.ts
    - tests/reminder-domain.test.ts
    - tests/dashboard-aggregation.test.ts
    - tests/search-domain.test.ts
  modified:
    - src/lib/finance/repository.ts
    - tests/export-backup.test.ts

key-decisions:
  - "createReminderAuditEvent accepts flat input (eventType, reminderId, workspaceId, accountId, now) — no charge/subject object needed, simpler API for one-step audit calls"
  - "completeReminder is idempotent — always sets completedAt to new now even if already completed"
  - "listByWorkspaceAndMonth uses UTC boundaries matching existing listByMonth pattern (Date.UTC boundaries, createdAt-based)"
  - "Wave 0 scaffolds reference future import paths directly (no mocks) so downstream plan executors have exact contracts to implement against"

patterns-established:
  - "Reminder audit SECU-05: only reminderId and workspaceId in metadata — title never included"
  - "Wave 0 scaffold header comment: // Wave 0 scaffold — implementation created in Plan 06-XX"
  - "listActiveByPatient: filters workspaceId + completedAt === null + link.type === 'patient' + link.id === patientId"

requirements-completed: [TASK-01, TASK-03]

# Metrics
duration: 177min
completed: 2026-03-15
---

# Phase 6 Plan 1: Reminders Domain and Wave 0 Test Scaffolds Summary

**Immutable Reminder domain (model/repository/store/audit) with 33 TDD tests green, finance repo extended with workspace-level monthly selector, and Wave 0 scaffold tests for Plans 02/03/04**

## Performance

- **Duration:** ~177 min (session interrupted, resumed)
- **Started:** 2026-03-15T00:12:23Z
- **Completed:** 2026-03-15T00:09:13Z
- **Tasks:** 2 of 2
- **Files modified:** 9

## Accomplishments
- Created full reminders domain module with model, repository, store, and audit (4 files)
- Achieved 33/33 TDD tests green using RED-GREEN cycle with full immutability test for completeReminder
- Extended `src/lib/finance/repository.ts` with `listByWorkspaceAndMonth` for DASH-02 dashboard aggregation (no regressions in 33 existing finance tests)
- Created Wave 0 scaffold tests for dashboard aggregation (Plan 02) and search domain (Plan 03); confirmed export-backup scaffold (Plan 04) already complete
- All 261 non-scaffold tests pass; only 2 Wave 0 scaffolds fail on import as expected

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Reminder domain tests (failing)** - `b38ca97` (test)
2. **Task 1 GREEN: Reminders domain module** - `dac548e` (feat)
3. **Task 2: Wave 0 scaffolds + finance extension** - `50567b0` (test)

_Note: TDD tasks have multiple commits (test RED → feat GREEN)_

## Files Created/Modified
- `src/lib/reminders/model.ts` — Reminder/ReminderLink types, createReminder/completeReminder factories (immutable spread)
- `src/lib/reminders/repository.ts` — ReminderRepository interface + createInMemoryReminderRepository (Map-backed, 6 methods)
- `src/lib/reminders/store.ts` — getReminderRepository globalThis singleton (__psivaultReminders__)
- `src/lib/reminders/audit.ts` — createReminderAuditEvent with SECU-05 whitelist (reminderId + workspaceId only, no title)
- `tests/reminder-domain.test.ts` — 33 tests covering all behavior points (createReminder, completeReminder, repository, audit)
- `src/lib/finance/repository.ts` — listByWorkspaceAndMonth added to interface and in-memory impl
- `tests/dashboard-aggregation.test.ts` — Wave 0 scaffold for filterTodayAppointments, countPendingCharges
- `tests/search-domain.test.ts` — Wave 0 scaffold for searchAll with SECU-05 guards
- `tests/export-backup.test.ts` — Wave 0 header comment added (content was already complete)

## Decisions Made
- `createReminderAuditEvent` uses a flat input shape (no nested charge/subject object) — simpler API consistent with the plan's description of "accepts eventType, reminderId, workspaceId, accountId"
- `completeReminder` is idempotent by design — sets `completedAt` to new `now` even if previously completed, consistent with plan spec
- Wave 0 scaffold tests reference actual future import paths without mocks — downstream executors have exact contracts to implement against, no exploration needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## Next Phase Readiness
- Plan 06-02 (dashboard aggregation): `tests/dashboard-aggregation.test.ts` provides exact contracts for `filterTodayAppointments` and `countPendingCharges` in `src/lib/dashboard/aggregation.ts`; `listByWorkspaceAndMonth` ready on `SessionChargeRepository`; `getReminderRepository()` ready for active reminder count
- Plan 06-03 (search domain): `tests/search-domain.test.ts` provides exact contract for `searchAll` and `SearchResultItem` in `src/lib/search/search.ts` with SECU-05 requirements enforced
- Plan 06-04 (export/backup): `tests/export-backup.test.ts` provides full contract for `buildPatientExport`, `buildWorkspaceBackup`, `validateBackupSchema` in `src/lib/export/serializer.ts`

---
*Phase: 06-retrieval-recovery-and-launch-polish*
*Completed: 2026-03-15*
