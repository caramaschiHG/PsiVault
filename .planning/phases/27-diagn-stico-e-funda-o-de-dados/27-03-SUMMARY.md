---
phase: 27-diagn-stico-e-funda-o-de-dados
plan: "03"
subsystem: performance
tags:
  - query-logging
  - prisma-extension
  - search-optimization
  - column-selection
dependency_graph:
  requires:
    - 27-01-PLAN.md
  provides:
    - Slow query logging in development
    - Database-level patient search
    - Query plan documentation
  affects:
    - src/lib/db.ts
    - src/lib/patients/repository.ts
    - src/lib/patients/repository.prisma.ts
    - src/app/(vault)/actions/search.ts
tech_stack:
  added: []
  patterns:
    - Prisma $extends middleware for observability
    - LIST_SELECT for excluding sensitive fields
key_files:
  created:
    - src/lib/db/QUERY_PLANS.md
  modified:
    - src/lib/db.ts
    - src/lib/patients/repository.ts
    - src/lib/patients/repository.prisma.ts
    - src/app/(vault)/actions/search.ts
decisions:
  - Query logging threshold set to 500ms to catch genuinely slow queries without noise
  - searchByName uses database-level ILIKE search with mode insensitive instead of loading all patients to memory
  - importantObservations explicitly excluded via LIST_SELECT in all list/search queries
metrics:
  duration: "15 min"
  completed_date: "2026-04-23"
---

# Phase 27 Plan 03: Query Logging e Column Selection Summary

**One-liner:** Prisma query logging extension for slow query detection and database-level patient search optimization with sensitive field exclusion.

## What Was Built

- **Prisma query logging extension** in `src/lib/db.ts` using `$extends({ query: { $allOperations } })`.
- **Slow query detection**: queries taking >500ms in development log `[Slow Query] model.operation took Xms` to console.
- **searchByName** method added to `PatientRepository` interface with implementations in both Prisma and in-memory repositories.
- **Database-level search** using Prisma `contains` with `mode: "insensitive"` on fullName, socialName, email, and phone.
- **LIST_SELECT** enforcement ensures `importantObservations` is never returned in search results.
- **searchAllAction** optimized to use `searchByName` instead of loading all active + archived patients into memory.
- **QUERY_PLANS.md** documentation with 3 EXPLAIN ANALYZE queries to validate index usage.

## Deviations from Plan

None — plan executed exactly as written.

## Auth Gates

None.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- [x] `src/lib/db.ts` contains `$extends` with `$allOperations` middleware
- [x] `src/lib/patients/repository.ts` interface includes `searchByName`
- [x] `src/lib/patients/repository.ts` in-memory implementation includes `searchByName`
- [x] `src/lib/patients/repository.prisma.ts` implements `searchByName` with `select: LIST_SELECT`
- [x] `src/app/(vault)/actions/search.ts` uses `patientRepo.searchByName(workspaceId, query)`
- [x] `src/lib/db/QUERY_PLANS.md` exists with 3 documented EXPLAIN ANALYZE queries
- [x] `pnpm test` passes (407 tests)
- [x] `pnpm build` completes without errors

## Commits

- `ee4d362`: feat(27-03): add Prisma query logging extension
- `120ad4f`: feat(27-03): add searchByName to PatientRepository
- `649af36`: perf(27-03): optimize search action and document query plans
