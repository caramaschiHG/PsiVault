---
phase: 02-patient-and-agenda-core
plan: 02
subsystem: scheduling
tags: [prisma, nextjs, typescript, vitest, in-memory-store, domain-model]

requires:
  - phase: 01-vault-foundation
    provides: Workspace model, AuditEvent contract, AuditRepository, createAuditEvent
  - phase: 02-01
    provides: Patient aggregate, PatientRepository.listActive, workspace-scoped patient store

provides:
  - Appointment occurrence aggregate with IN_PERSON/ONLINE care mode and 5-state lifecycle
  - Hard-block conflict engine (checkConflicts) shared by all scheduling mutations
  - Archived-patient scheduling guard (assertPatientSchedulable)
  - Weekly series materialization into concrete occurrence rows (generateWeeklySeries)
  - Series edit scopes: THIS, THIS_AND_FUTURE, ALL — finalized occurrences are never overwritten
  - In-memory AppointmentRepository with date-range, series, and patient selectors
  - Appointment lifecycle audit helpers wired to Phase 1 AuditEvent contract (7 event types)
  - Server actions for create, reschedule, cancel, confirm, complete, no-show, editSeries
  - AppointmentForm (essentials-first + optional recurrence section)
  - RecurrenceScopeDialog (radio-group scope selector composable into series mutation forms)
  - Prisma schema extended with Appointment model and AppointmentCareMode/AppointmentStatus enums
  - 32 automated tests: 24 conflict/lifecycle + 8 recurrence

affects:
  - 02-03-agenda (will consume AppointmentRepository to build day/week agenda views and hydrate PatientOperationalSummary)
  - 03-clinical-record-core (will link clinical notes to appointment occurrences via appointmentId)

tech-stack:
  added: []
  patterns:
    - hard-block-overlap (pure domain function, no I/O, shared by all mutation paths)
    - weekly-series-materialization (N concrete rows at creation time, no rule expansion at render time)
    - finalized-occurrence-immutability (COMPLETED/CANCELED/NO_SHOW occurrences never overwritten by series edits)
    - tdd-red-green-commit (write failing tests first, implement to pass, commit each phase)
    - reschedule-history-linkage (rescheduled occurrence carries rescheduledFromId back to original)
    - lifecycle-status-transitions (explicit allow-list per transition, throws on invalid state)

key-files:
  created:
    - prisma/schema.prisma (Appointment model, AppointmentCareMode and AppointmentStatus enums added)
    - src/lib/appointments/model.ts
    - src/lib/appointments/repository.ts
    - src/lib/appointments/conflicts.ts
    - src/lib/appointments/recurrence.ts
    - src/lib/appointments/audit.ts
    - src/lib/appointments/store.ts
    - src/app/(vault)/appointments/actions.ts
    - src/app/(vault)/appointments/components/appointment-form.tsx
    - src/app/(vault)/appointments/components/recurrence-scope-dialog.tsx
    - tests/appointment-conflicts.test.ts
    - tests/appointment-recurrence.test.ts
  modified:
    - prisma/schema.prisma

key-decisions:
  - "HYBRID care mode is excluded from appointment booking — it is a practice-profile setting, not a per-occurrence value. Only IN_PERSON and ONLINE are valid appointment care modes."
  - "Rescheduling creates a new occurrence linked via rescheduledFromId rather than overwriting the original row — preserves visible history and audit trail."
  - "Weekly series are materialized as concrete rows at creation time so agenda queries read normal occurrence rows without expanding recurrence rules at render time."
  - "Finalized occurrences (COMPLETED, CANCELED, NO_SHOW) are immutable to series edits — they represent clinical history that must not be silently altered."
  - "Hard-block conflict check (checkConflicts) is pure domain code shared by all scheduling mutation paths — no duplication of overlap logic across actions."
  - "Self-id exclusion in checkConflicts supports reschedule scenarios where the updated occurrence re-checks the same time slot."

patterns-established:
  - "Conflict check pattern: call checkConflicts before every repo.save in any scheduling action — same domain function, no per-action overlap variants."
  - "Series edit pattern: applySeriesEdit resolves scope and filters finalized occurrences — callers don't need to replicate scope logic."
  - "Audit pattern: createAppointmentAuditEvent wraps Phase 1 createAuditEvent — appointment events share the same audit contract as patient and security events."

requirements-completed: [SCHD-01, SCHD-02, SCHD-03, SCHD-04, SCHD-06]

duration: 6min
completed: 2026-03-13
---

# Phase 2 Plan 2: Appointment Domain Summary

**Appointment occurrence aggregate with hard-block conflict engine, weekly series materialization, 5-state lifecycle transitions, and audited mutation surface covering create/reschedule/cancel/confirm/complete/no-show — 32 TDD tests**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-13T23:20:25Z
- **Completed:** 2026-03-13T23:26:25Z
- **Tasks:** 3 completed
- **Files modified:** 12

## Accomplishments

- Appointment occurrence model with workspace-scoped ownership, IN_PERSON/ONLINE care modes, and explicit SCHEDULED/CONFIRMED/COMPLETED/CANCELED/NO_SHOW lifecycle with guarded state transitions
- Hard-block conflict engine as pure domain code shared by all mutation paths, plus archived-patient scheduling guard
- Weekly recurrence materialization into concrete occurrence rows with THIS/THIS_AND_FUTURE/ALL edit scopes that preserve finalized historical occurrences

## Task Commits

Each task was committed atomically:

1. **Task 1: Define appointment occurrences, lifecycle status, and overlap rules** - `d0c81cb` (feat)
2. **Task 2: Implement weekly recurrence materialization and edit scopes** - `22ee3cc` (feat)
3. **Task 3: Build audited appointment mutations for lifecycle changes and recurrence editing** - `7545831` (feat)

## Files Created/Modified

- `prisma/schema.prisma` - Added Appointment model with Workspace/Patient relations, AppointmentCareMode and AppointmentStatus enums, indexes on [workspaceId, startsAt], [workspaceId, patientId], [seriesId]
- `src/lib/appointments/model.ts` - Appointment aggregate, createAppointment, rescheduleAppointment, cancelAppointment, confirmAppointment, completeAppointment, noShowAppointment
- `src/lib/appointments/repository.ts` - AppointmentRepository interface and in-memory implementation with listByDateRange, listBySeries, listByPatient
- `src/lib/appointments/conflicts.ts` - checkConflicts (hard-block overlap rule, SCHEDULED+CONFIRMED only, self-id excluded), assertPatientSchedulable
- `src/lib/appointments/recurrence.ts` - generateWeeklySeries, applySeriesEdit with THIS/THIS_AND_FUTURE/ALL scopes
- `src/lib/appointments/audit.ts` - Appointment lifecycle audit helpers (7 event types) wired to Phase 1 AuditEvent contract
- `src/lib/appointments/store.ts` - Module-level in-memory store (globalThis singleton)
- `src/app/(vault)/appointments/actions.ts` - Server actions: createAppointment, rescheduleAppointment, cancelAppointment, confirmAppointment, completeAppointment, noShowAppointment, editSeries
- `src/app/(vault)/appointments/components/appointment-form.tsx` - Essentials-first create/reschedule form with optional recurrence section
- `src/app/(vault)/appointments/components/recurrence-scope-dialog.tsx` - Radio-group scope selector composable into any series mutation form
- `tests/appointment-conflicts.test.ts` - 24 TDD tests: occurrence creation, care-mode validation, overlap rules, reschedule, cancel, lifecycle transitions
- `tests/appointment-recurrence.test.ts` - 8 TDD tests: series generation, shared seriesId, scope edits, finalized-occurrence immutability

## Decisions Made

- HYBRID care mode is excluded from appointments — only IN_PERSON and ONLINE are valid booking values. This prevents ambiguous care-mode data in clinical records.
- Rescheduling creates a new occurrence linked via `rescheduledFromId` — original row stays immutable. Visible history is preserved for both patient and agenda surfaces.
- Weekly series are materialized at creation time so agenda queries are simple range scans rather than rule expansions.
- Finalized occurrences are never overwritten by series edits — they represent completed clinical facts.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Appointment domain is complete and stable. Phase 2 Plan 3 (02-03 agenda) can safely use `AppointmentRepository.listByDateRange` for agenda views and `listByPatient` to hydrate `PatientOperationalSummary.lastSession` and `nextSession`.
- `generateWeeklySeries` is ready for consumption by the quick next-session flow.
- All 75 tests pass (32 new + 43 from Phases 1 and 2-01).

---
*Phase: 02-patient-and-agenda-core*
*Completed: 2026-03-13*
