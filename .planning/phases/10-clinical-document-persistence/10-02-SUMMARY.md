---
phase: 10-clinical-document-persistence
plan: 02
subsystem: database
tags: [prisma, clinical, repository, persistence, async]

requires:
  - phase: 10-01
    provides: ClinicalNote Prisma schema model and migration SQL

provides:
  - PrismaClinicalRepository — 4-method Prisma-backed implementation of ClinicalNoteRepository
  - getClinicalNoteRepository() returns Prisma-backed instance instead of in-memory stub
  - ClinicalNoteRepository interface updated to Promise<T> return types

affects:
  - 10-03-documents (same async interface pattern applied)
  - 11-finance-ops-persistence
  - any phase that reads clinical notes

tech-stack:
  added: []
  patterns:
    - "PrismaClinicalRepository mirrors PrismaAppointmentRepository: upsert for save, findFirst for lookups, findMany with orderBy for lists"
    - "ClinicalNoteRepository interface uses Promise<T> return types matching AppointmentRepository"
    - "Promise.all() used in UI pages to fetch notes for multiple appointments concurrently"

key-files:
  created:
    - src/lib/clinical/repository.prisma.ts
  modified:
    - src/lib/clinical/store.ts
    - src/lib/clinical/repository.ts
    - src/app/(vault)/sessions/[appointmentId]/actions.ts
    - src/app/(vault)/sessions/[appointmentId]/note/page.tsx
    - src/app/(vault)/patients/[patientId]/page.tsx
    - src/app/(vault)/agenda/page.tsx
    - src/app/api/backup/route.ts
    - src/app/api/export/patient/[patientId]/route.ts
    - tests/clinical-domain.test.ts

key-decisions:
  - "ClinicalNoteRepository interface updated to async (Promise<T>) — required for Prisma implementation; in-memory implementation also made async to satisfy interface"
  - "Promise.all() used to fetch notes per appointment in UI pages — avoids sequential DB calls for completed appointments list"
  - "listByPatient uses orderBy: createdAt desc — matches in-memory sort behavior, satisfies domain test assertions"

patterns-established:
  - "Async repository interface pattern: all methods return Promise<T> so both in-memory and Prisma implementations are type-safe"
  - "findByAppointmentId uses findFirst with {appointmentId, workspaceId} — appointmentId is unique but workspaceId checked for defense in depth"

requirements-completed:
  - REPO-03

duration: 15min
completed: 2026-03-17
---

# Phase 10 Plan 02: Clinical Persistence Summary

**Prisma-backed ClinicalNoteRepository with async interface, replacing in-memory store so clinical notes persist across server restarts**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-17T22:43:29Z
- **Completed:** 2026-03-17T22:48:27Z
- **Tasks:** 2
- **Files modified:** 9 (plus 1 created)

## Accomplishments

- Created `src/lib/clinical/repository.prisma.ts` implementing all 4 `ClinicalNoteRepository` methods backed by Prisma (`upsert`, `findFirst`, `findMany` with `orderBy: createdAt desc`)
- Updated `ClinicalNoteRepository` interface to `Promise<T>` return types and made in-memory implementation async to match
- Updated `src/lib/clinical/store.ts` to return `createPrismaClinicalRepository()` — clinical notes now persist to the database
- Fixed all callers (session actions, note page, patient profile, agenda page, backup route, export route) to `await` async repo calls
- Updated `clinical-domain.test.ts` to await async in-memory repository calls — all 18 clinical tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement PrismaClinicalRepository** - `3095243` (feat — included in 10-03 parallel execution)
2. **Task 2: Swap clinical store.ts to use Prisma repository** - `7791d38` (feat)

Note: Task 1 files were committed as part of the 10-03 parallel agent execution (commit `3095243`), which ran concurrently and included the clinical repository implementation alongside the document repository work.

## Files Created/Modified

- `src/lib/clinical/repository.prisma.ts` — New Prisma-backed implementation of ClinicalNoteRepository with 4 methods
- `src/lib/clinical/repository.ts` — Interface updated to async Promise<T> return types; in-memory implementation made async
- `src/lib/clinical/store.ts` — Swapped from createInMemoryClinicalRepository to createPrismaClinicalRepository
- `src/app/(vault)/sessions/[appointmentId]/actions.ts` — Awaited findByAppointmentId, findById, save calls
- `src/app/(vault)/sessions/[appointmentId]/note/page.tsx` — Awaited findByAppointmentId call
- `src/app/(vault)/patients/[patientId]/page.tsx` — Converted sequential loop to Promise.all for note lookups
- `src/app/(vault)/agenda/page.tsx` — Converted sequential loop to Promise.all for note lookups
- `src/app/api/backup/route.ts` — Converted flatMap to Promise.all for async clinical note loading
- `src/app/api/export/patient/[patientId]/route.ts` — Awaited listByPatient call
- `tests/clinical-domain.test.ts` — Added await to all repository method calls

## Decisions Made

- Updated the `ClinicalNoteRepository` interface to use `Promise<T>` return types (required for Prisma; mirrors `AppointmentRepository` pattern). The in-memory implementation was also made async so a single interface covers both implementations.
- Used `Promise.all()` in UI pages where multiple notes are fetched per appointment — avoids N sequential DB calls for completed appointment lists.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated ClinicalNoteRepository interface to async and fixed all callers**

- **Found during:** Task 1 (PrismaClinicalRepository implementation)
- **Issue:** The `ClinicalNoteRepository` interface declared synchronous return types (`ClinicalNote`, not `Promise<ClinicalNote>`), but Prisma operations are async. TypeScript rejected the async Prisma methods since they don't match the sync interface. All callers also used the repo without `await`.
- **Fix:** Updated interface to `Promise<T>` return types; made in-memory implementation async; added `await` to all callers in server actions, pages, and API routes; updated test file to await repo calls.
- **Files modified:** `src/lib/clinical/repository.ts`, `src/app/(vault)/sessions/[appointmentId]/actions.ts`, `src/app/(vault)/sessions/[appointmentId]/note/page.tsx`, `src/app/(vault)/patients/[patientId]/page.tsx`, `src/app/(vault)/agenda/page.tsx`, `src/app/api/backup/route.ts`, `src/app/api/export/patient/[patientId]/route.ts`, `tests/clinical-domain.test.ts`
- **Verification:** `npx tsc --noEmit` passes (no src/ errors); all 18 clinical tests pass
- **Committed in:** `3095243` (included in parallel 10-03 execution)

---

**Total deviations:** 1 auto-fixed (Rule 1 - interface async mismatch)
**Impact on plan:** Required fix for TypeScript correctness — Prisma is inherently async and the interface must reflect this. No scope creep.

## Issues Encountered

The 10-02 and 10-03 plans ran concurrently. The parallel 10-03 agent committed the `repository.prisma.ts` and interface async changes (Task 1 of this plan) as part of its commit `3095243`. This plan's commit (`7791d38`) covers only the store.ts swap (Task 2), as Task 1 was already committed.

## Next Phase Readiness

- Clinical notes are now DB-persisted — satisfies the core requirement (REPO-03)
- The `ClinicalNoteRepository` async interface pattern is established for the document repository (already done by 10-03) and will be used for any future domain repos
- Phase 11 (Finance & Ops Persistence) can follow the same pattern

---
*Phase: 10-clinical-document-persistence*
*Completed: 2026-03-17*
