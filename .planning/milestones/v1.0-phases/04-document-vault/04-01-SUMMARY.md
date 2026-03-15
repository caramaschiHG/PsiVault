---
phase: 04-document-vault
plan: "01"
subsystem: document-domain
tags: [typescript, domain-model, tdd, vitest, in-memory-repository, audit, templates]

# Dependency graph
requires:
  - phase: 01-vault-foundation
    provides: createAuditEvent, AuditActor, AuditEvent, AuditSubject from src/lib/audit/events.ts
  - phase: 03-clinical-record-core
    provides: clinical domain patterns (model/repository/store/audit) mirrored directly

provides:
  - PracticeDocument interface and full lifecycle functions (createPracticeDocument, updatePracticeDocument, archivePracticeDocument)
  - DocumentType union with 5 types
  - PracticeDocumentRepository interface + createInMemoryDocumentRepository
  - getDocumentRepository() singleton via globalThis.__psivaultDocumentRepository__
  - createDocumentAuditEvent with SECU-05 metadata constraint (documentType only, never content)
  - buildDocumentContent factory producing Portuguese prose for all 5 document types
  - DocumentPreFillContext interface for template pre-fill data

affects:
  - 04-document-vault-plan-02
  - 04-document-vault-plan-03

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD RED/GREEN: test file committed failing before any implementation
    - Domain model factory pattern: pure functions with injected deps (now, createId)
    - editedAt null-on-creation pattern: mirrors ClinicalNote.editedAt
    - Archive pattern: archivedAt + archivedByAccountId fields (explicit, reversible)
    - SECU-05 audit constraint: metadata contains only type identifier, never content
    - globalThis singleton store: same pattern as clinical/patient/appointment stores

key-files:
  created:
    - tests/document-domain.test.ts
    - src/lib/documents/model.ts
    - src/lib/documents/repository.ts
    - src/lib/documents/store.ts
    - src/lib/documents/audit.ts
    - src/lib/documents/templates.ts
  modified: []

key-decisions:
  - "Document content template factory uses switch on DocumentType — exhaustive, type-safe, no dynamic dispatch needed"
  - "archivePracticeDocument is a pure domain function (not a repository method) keeping archive logic in the model layer"
  - "Receipt template uses R$ ________ placeholder for amount — Phase 5 will enrich when finance domain arrives"
  - "createdByName is a snapshot field frozen at creation time — professional name changes do not retroactively affect documents"

patterns-established:
  - "buildDocumentContent: switch(type) with dedicated sub-builder per type, all returning Portuguese prose strings"
  - "signatureBlock: shared helper producing 'Profissional: [name] — [crp]\nData: [date]' footer"
  - "DocumentPreFillContext: all optional fields use ?/null to allow partial pre-fill from calling context"

requirements-completed: [DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06, DOCS-07, DOCS-08]

# Metrics
duration: 3min
completed: 2026-03-14
---

# Phase 4 Plan 01: Document Domain Summary

**TDD document domain with PracticeDocument model, workspace-scoped in-memory repository, SECU-05 audit helper, and Portuguese prose template factory for 5 document types**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-14T16:40:55Z
- **Completed:** 2026-03-14T16:43:15Z
- **Tasks:** 2 (RED + GREEN)
- **Files modified:** 6

## Accomplishments

- All 24 domain unit tests pass GREEN with zero regressions in the full 137-test suite
- TDD RED commit (c16124c) precedes GREEN commit (7adc701) — verifiable via git log
- SECU-05 enforced: `createDocumentAuditEvent` metadata contains only `documentType` — content field never included
- Five document type templates deliver pre-filled Portuguese prose with patient name, professional, CRP, and type-specific fields

## Task Commits

1. **Task 1 (RED): Write failing tests for document domain** - `c16124c` (test)
2. **Task 2 (GREEN): Implement document domain** - `7adc701` (feat)

**Plan metadata:** _(this summary commit)_

_Note: TDD tasks have two commits: test → feat_

## Files Created/Modified

- `tests/document-domain.test.ts` - 24 failing tests covering createPracticeDocument, updatePracticeDocument, archivePracticeDocument, repository, buildDocumentContent, createDocumentAuditEvent
- `src/lib/documents/model.ts` - PracticeDocument interface + create/update/archive pure functions
- `src/lib/documents/repository.ts` - PracticeDocumentRepository interface + createInMemoryDocumentRepository (Map-backed, workspace-scoped)
- `src/lib/documents/store.ts` - getDocumentRepository() singleton via globalThis.__psivaultDocumentRepository__
- `src/lib/documents/audit.ts` - createDocumentAuditEvent with DocumentAuditEventType union + SECU-05 metadata constraint
- `src/lib/documents/templates.ts` - buildDocumentContent factory + DocumentPreFillContext interface for 5 document types

## Decisions Made

- Receipt template uses `R$ ________` placeholder — Phase 5 finance domain will enrich with real payment data via `amountLabel` context field
- `createdByName` is a snapshot field: professional name frozen at creation time so documents remain accurate even if the professional updates their profile later
- Archive function is a pure model function (not a repository method) to keep domain logic in the model layer, consistent with the clinical domain pattern
- Template switch uses exhaustive matching on DocumentType — TypeScript will catch missing cases if the union expands

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All exports from `src/lib/documents/` are ready for Plan 02 (document composition) and Plan 03 (retrieval/listing)
- `getDocumentRepository()` singleton works across server actions without DB connection
- Template factory ready for UI integration — Plans 02/03 can call `buildDocumentContent` directly
- No blockers

---
*Phase: 04-document-vault*
*Completed: 2026-03-14*
