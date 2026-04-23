---
phase: 26
fixed_at: 2026-04-23T00:00:00.000Z
review_path: .planning/phases/26-wave-4-n1-e-column-selection/26-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 26: Code Review Fix Report

**Fixed at:** 2026-04-23
**Source review:** `.planning/phases/26-wave-4-n1-e-column-selection/26-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### CR-01: Add `listAllByWorkspace` for backup with full patient data

**Files modified:** `src/lib/patients/repository.ts`, `src/lib/patients/repository.prisma.ts`, `src/app/api/backup/route.ts`
**Commit:** a34619b
**Applied fix:**
- Added `listAllByWorkspace(workspaceId)` to the `PatientRepository` interface with JSDoc noting backup/export-only use.
- Added in-memory implementation that returns all patients for the workspace without nulling `importantObservations`.
- Added Prisma implementation using `findMany` with no `select` override, mapping via full `mapToDomain`.
- Replaced the two-call `Promise.all([listActive, listArchived])` pattern in `route.ts` with a single `listAllByWorkspace` call, eliminating the data-loss path.

### WR-01: Remove `.filter(Boolean)` from Prisma `findByAppointmentIds`

**Files modified:** `src/lib/clinical/repository.prisma.ts`
**Commit:** 8ec366c
**Applied fix:** Removed `.filter(Boolean) as string[]` from the `rows.map((r) => r.appointmentId)` chain. The `appointmentId` column is `String` non-nullable in the Prisma schema so the cast and filter were dead code.

### WR-02: Add empty-array guard to in-memory `findByAppointmentIds`

**Files modified:** `src/lib/clinical/repository.ts`
**Commit:** 36fd7d6
**Applied fix:** Added `if (ids.length === 0) return new Set();` at the top of the in-memory `findByAppointmentIds` implementation, matching the guard already present in the Prisma implementation.

### WR-03: Mirror `importantObservations: null` in in-memory `listActive`/`listArchived`

**Files modified:** `src/lib/patients/repository.ts`
**Commit:** a34619b (committed atomically with CR-01 — same file)
**Applied fix:** Added `.map((p) => ({ ...p, importantObservations: null }))` to both `listActive` and `listArchived` in-memory implementations so their return shape matches the Prisma `mapListToDomain` behaviour.

---

_Fixed: 2026-04-23_
_Fixer: the agent (gsd-code-fixer)_
_Iteration: 1_
