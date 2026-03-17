---
phase: 10-clinical-document-persistence
plan: "03"
subsystem: database
tags: [prisma, documents, repository, persistence]

# Dependency graph
requires:
  - phase: 10-01
    provides: PracticeDocument Prisma schema (practice_documents table with workspace/patient relations)

provides:
  - PrismaDocumentRepository implementing all 4 PracticeDocumentRepository methods (save, findById, listByPatient, listActiveByPatient)
  - getDocumentRepository() returns Prisma-backed instance — documents persist across server restarts

affects:
  - All callers of getDocumentRepository() (document actions, patient profile page, search, backup, export)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - PrismaDocumentRepository uses upsert for save (create-or-update by id)
    - listActiveByPatient uses archivedAt: null Prisma filter (IS NULL idiom)
    - type field stored as String in Prisma, cast to DocumentType in mapToDomain()
    - Promise-based repository interface mirrors PatientRepository/AppointmentRepository pattern

key-files:
  created:
    - src/lib/documents/repository.prisma.ts
  modified:
    - src/lib/documents/store.ts
    - src/lib/documents/repository.ts
    - src/app/(vault)/patients/[patientId]/documents/new/actions.ts
    - src/app/(vault)/patients/[patientId]/documents/[documentId]/actions.ts
    - src/app/(vault)/patients/[patientId]/documents/[documentId]/edit/actions.ts
    - src/app/(vault)/actions/search.ts
    - src/app/(vault)/patients/[patientId]/page.tsx
    - src/app/api/backup/route.ts
    - src/app/api/export/patient/[patientId]/route.ts
    - tests/document-domain.test.ts

key-decisions:
  - "PracticeDocumentRepository interface updated to Promise<> return types — required for Prisma async implementation, mirrors PatientRepository pattern"
  - "All document repo callers updated to await async methods — correctness requirement for Prisma-backed implementation"

patterns-established:
  - "Repository interface uses Promise<> return types — consistent with PatientRepository and AppointmentRepository"
  - "Prisma upsert pattern: update payload excludes createdAt/updatedAt (managed by Prisma @default and @updatedAt)"

requirements-completed:
  - REPO-04

# Metrics
duration: 3min
completed: 2026-03-17
---

# Phase 10 Plan 03: Prisma Document Repository Summary

**PrismaDocumentRepository persisting practice documents to Postgres via Prisma upsert, with Promise-based interface contract and all callers updated to await async methods**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-17T22:44:17Z
- **Completed:** 2026-03-17T22:48:02Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Created `src/lib/documents/repository.prisma.ts` with all 4 `PracticeDocumentRepository` methods using Prisma upsert, findFirst, and findMany patterns
- Swapped `src/lib/documents/store.ts` to use `createPrismaDocumentRepository()` — documents now persist to database across server restarts
- Updated `PracticeDocumentRepository` interface to use `Promise<>` return types and fixed all callers to properly await async repository methods

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement PrismaDocumentRepository** - `3095243` (feat)
2. **Task 2: Swap document store to use Prisma repository** - `c9da14e` (feat)

## Files Created/Modified

- `src/lib/documents/repository.prisma.ts` - Prisma-backed implementation of PracticeDocumentRepository with upsert, findFirst, findMany, and archivedAt: null filter
- `src/lib/documents/store.ts` - Updated to use createPrismaDocumentRepository instead of createInMemoryDocumentRepository
- `src/lib/documents/repository.ts` - Interface updated to Promise<> return types; in-memory implementation updated to async methods
- `src/app/(vault)/patients/[patientId]/documents/new/actions.ts` - Added await to repo.save()
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/actions.ts` - Added await to repo.findById() and repo.save()
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/edit/actions.ts` - Added await to repo.save()
- `src/app/(vault)/actions/search.ts` - Changed to await Promise.all for documentRepo.listByPatient calls
- `src/app/(vault)/patients/[patientId]/page.tsx` - Added await to docRepo.listActiveByPatient()
- `src/app/api/backup/route.ts` - Changed to await Promise.all for docRepo.listByPatient calls
- `src/app/api/export/patient/[patientId]/route.ts` - Added await to docRepo.listActiveByPatient()
- `tests/document-domain.test.ts` - Updated repository tests to use await on async methods

## Decisions Made

- Updated `PracticeDocumentRepository` interface to `Promise<>` return types — the in-memory interface had sync signatures but Prisma requires async; updating the interface to async is the correct approach that makes the contract honest and consistent with `PatientRepository`/`AppointmentRepository`
- All callers fixed to properly await repository methods — this was necessary for correctness with Prisma; callers that don't await would silently discard saved data

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated PracticeDocumentRepository interface to use Promise<> return types**
- **Found during:** Task 1 (Implement PrismaDocumentRepository)
- **Issue:** The interface declared sync return types (`PracticeDocument`, `PracticeDocument | null`, `PracticeDocument[]`) but the Prisma implementation requires async methods. TypeScript would reject the implementation as not satisfying the interface.
- **Fix:** Updated all 4 interface method signatures to use `Promise<>` return types. Updated `createInMemoryDocumentRepository` to use `async` methods. Updated all callers in server actions, pages, and API routes to `await` async calls.
- **Files modified:** repository.ts, new/actions.ts, [documentId]/actions.ts, edit/actions.ts, search.ts, patients/[patientId]/page.tsx, backup/route.ts, export/patient/[patientId]/route.ts, document-domain.test.ts
- **Verification:** npx tsc --noEmit passes (no errors in src/). All 24 document domain tests pass.
- **Committed in:** 3095243 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** The interface update was required for the Prisma implementation to type-check. No scope creep — all changes directly enable the document persistence task.

## Issues Encountered

None — the interface async migration was handled automatically per deviation rules.

## User Setup Required

None - no external service configuration required beyond applying the Prisma migration (handled in Phase 10-01).

## Next Phase Readiness

- Document persistence is complete — practice documents are stored in Postgres via Prisma
- `getDocumentRepository()` returns the Prisma-backed instance with correct workspace isolation
- `listActiveByPatient` uses `archivedAt: null` Prisma filter matching the domain semantics
- Ready for remaining Phase 10 plans

---
*Phase: 10-clinical-document-persistence*
*Completed: 2026-03-17*
