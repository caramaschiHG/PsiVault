---
phase: 03-clinical-record-core
plan: "01"
subsystem: clinical
tags: [clinical-notes, tdd, repository, audit, session-number]

# Dependency graph
requires:
  - phase: 02-patient-and-agenda-core
    provides: Appointment interface and status enum used by deriveSessionNumber
  - phase: 01-vault-foundation
    provides: AuditActor, AuditEvent, createAuditEvent from src/lib/audit/events.ts
provides:
  - ClinicalNote interface with freeText + 5 nullable structured fields
  - createClinicalNote (editedAt=null on first creation)
  - updateClinicalNote (sets editedAt+updatedAt=now, createdAt immutable)
  - deriveSessionNumber (1-based index among COMPLETED appointments sorted by startsAt)
  - ClinicalNoteRepository interface + createInMemoryClinicalRepository
  - getClinicalNoteRepository() singleton store
  - createClinicalNoteAuditEvent (SECU-05 compliant: no clinical content in metadata)
affects:
  - 03-02-PLAN (note composer UI builds on this domain contract)
  - 03-03-PLAN (patient timeline reads from repository)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD Red-Green cycle: test files committed before implementation
    - Repository pattern: ClinicalNoteRepository interface decouples domain from storage
    - Singleton store via globalThis lazy init (mirrors appointments/patients store pattern)
    - Audit metadata security: only appointmentId allowed, never clinical content (SECU-05)

key-files:
  created:
    - src/lib/clinical/model.ts
    - src/lib/clinical/repository.ts
    - src/lib/clinical/store.ts
    - src/lib/clinical/audit.ts
    - tests/clinical-domain.test.ts
    - tests/clinical-session-number.test.ts
  modified: []

key-decisions:
  - "ClinicalNote structured fields (demand, observedMood, themes, clinicalEvolution, nextSteps) default to null — not empty strings — so the contract stays honest when not filled by the clinician."
  - "deriveSessionNumber filters strictly to COMPLETED status only — CANCELED and NO_SHOW appointments do not count toward session numbering."
  - "Audit metadata is restricted to appointmentId only (SECU-05): clinical content must never leak into audit or log surfaces."
  - "updateClinicalNote always sets editedAt=now on every update — distinguishing 'never edited' (null) from 'edited at least once'."

patterns-established:
  - "Clinical store pattern: getClinicalNoteRepository() mirrors getAppointmentRepository() via globalThis.__psivaultClinicalNoteRepository__"
  - "Audit wrapper pattern: createClinicalNoteAuditEvent mirrors createAppointmentAuditEvent with subject.kind = 'clinical_note'"
  - "Repository sort: listByPatient returns notes sorted by createdAt descending (most recent first)"

requirements-completed: [CLIN-01, CLIN-02, CLIN-03, CLIN-04, CLIN-05]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 3 Plan 01: Clinical Domain Module Summary

**TypeScript clinical note domain with TDD-verified createClinicalNote, updateClinicalNote, deriveSessionNumber (COMPLETED-only 1-based index), in-memory repository, singleton store, and SECU-05-compliant audit helper**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-14T10:45:41Z
- **Completed:** 2026-03-14T10:47:58Z
- **Tasks:** 2 (RED + GREEN TDD cycle)
- **Files modified:** 6

## Accomplishments

- 18 unit tests written first (RED) covering all CLIN-01 through CLIN-05 behaviors
- 4 implementation files make all 18 tests pass (GREEN) with zero regressions across full 113-test suite
- SECU-05 enforced at the audit layer: only appointmentId appears in metadata, never freeText or structured field content
- deriveSessionNumber correctly ignores CANCELED/NO_SHOW and counts only COMPLETED appointments sorted by startsAt ascending

## Task Commits

Each task was committed atomically:

1. **RED — Failing tests** - `8dfaaff` (test)
2. **GREEN — Implementation** - `39dcb04` (feat)

_Note: TDD plan — test commit preceded implementation commit._

**Plan metadata:** (docs commit follows this summary creation)

## Files Created/Modified

- `tests/clinical-domain.test.ts` - 13 tests: createClinicalNote, updateClinicalNote, repository, audit event metadata (CLIN-01 to CLIN-04)
- `tests/clinical-session-number.test.ts` - 5 tests: deriveSessionNumber correctness, null case, filtering, edge cases (CLIN-05)
- `src/lib/clinical/model.ts` - ClinicalNote interface, createClinicalNote, updateClinicalNote, deriveSessionNumber, AppointmentForSessionNumber
- `src/lib/clinical/repository.ts` - ClinicalNoteRepository interface + createInMemoryClinicalRepository (Map-backed, workspace-scoped)
- `src/lib/clinical/store.ts` - getClinicalNoteRepository() singleton via globalThis lazy init
- `src/lib/clinical/audit.ts` - createClinicalNoteAuditEvent with SECU-05 metadata restriction

## Decisions Made

- Structured fields default to null (not empty strings) — matches plan spec and keeps the contract semantically honest
- deriveSessionNumber only counts COMPLETED appointments — CANCELED and NO_SHOW are excluded per plan spec
- Audit metadata restricted to appointmentId — SECU-05 compliance hard-coded in the helper function
- editedAt is null on creation and set to now on every updateClinicalNote call, distinguishing pristine notes from edited ones

## Deviations from Plan

None — plan executed exactly as written. All four source files match the implementation spec and all 18 tests pass on first green run.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `src/lib/clinical/` module is complete and fully tested — Plans 02 and 03 can import from it immediately
- `getClinicalNoteRepository()` singleton is available for server actions in the note composer (Plan 02)
- `deriveSessionNumber` is ready for use in the patient timeline session counter (Plan 03)
- No blockers or concerns

---
*Phase: 03-clinical-record-core*
*Completed: 2026-03-14*
