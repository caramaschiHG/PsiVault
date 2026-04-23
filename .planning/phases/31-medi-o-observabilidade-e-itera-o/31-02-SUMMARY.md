---
phase: 31-medi-o-observabilidade-e-itera-o
plan: 02
subsystem: observability
tags: [rum, cwv, percentile, postgresql, prisma, nextjs, feature-flag]

requires:
  - phase: 31-01
    provides: CwvCollector and performance metric infrastructure
provides:
  - MetricsRepository with p75 aggregation via percentile_cont
  - MetricsRepository with typed cleanupOldMetrics via deleteMany
  - /admin/performance Server Component dashboard with HTML tables
  - scripts/cleanup-metrics.mjs for 30-day retention
  - pnpm metrics:cleanup command
affects:
  - 31-03

tech-stack:
  added: []
  patterns:
    - "Feature flag via process.env + notFound() for internal dashboards"
    - "PostgreSQL percentile_cont via Prisma $queryRaw for analytics"
    - "Standalone cleanup script with PrismaClient for cron/CI jobs"

key-files:
  created:
    - scripts/cleanup-metrics.mjs
    - src/app/(vault)/admin/performance/page.tsx
  modified:
    - src/lib/metrics/model.ts
    - src/lib/metrics/repository.ts
    - src/lib/metrics/repository.prisma.ts
    - package.json

key-decisions:
  - "percentile_cont via $queryRaw: Prisma ORM does not support percentile functions natively; raw SQL is acceptable for internal analytics queries"
  - "deleteMany typed over raw SQL for cleanup: safer, Prisma-validated, prevents accidental unscoped deletions"
  - "Build-time feature flag (ENABLE_PERF_DASHBOARD): simpler than runtime toggle for an internal dev tool; requires rebuild to enable"
  - "Standalone script instead of API route for cleanup: intended for cron/CI scheduling, not user-triggered"

patterns-established:
  - "Repository aggregation methods: add analytics queries to domain repository, keep raw SQL isolated in Prisma implementation"
  - "Cleanup scripts: standalone .mjs with direct PrismaClient, not imported from app code, for independent scheduling"

requirements-completed:
  - OBS-02

duration: 6min
completed: 2026-04-23
---

# Phase 31 Plan 02: RUM Dashboard & Metrics Cleanup Summary

**Internal Real User Monitoring dashboard at `/admin/performance` with p75 CWV aggregation and automated 30-day metric retention cleanup.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-04-23T17:42:20Z
- **Completed:** 2026-04-23T17:48:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Extended `MetricsRepository` with `getP75ByPagePath(days)` using PostgreSQL `percentile_cont(0.75)` via Prisma `$queryRaw`
- Added `cleanupOldMetrics(retentionDays)` using typed Prisma `deleteMany` for safe bulk deletion
- Created `scripts/cleanup-metrics.mjs` standalone cleanup script with 30-day default retention
- Added `pnpm metrics:cleanup` npm script for cron/CI integration
- Built `/admin/performance` Server Component page rendering p75 tables per page path for the last 7 days
- Protected dashboard behind `ENABLE_PERF_DASHBOARD=1` feature flag with `notFound()` fallback

## Task Commits

Each task was committed atomically:

1. **Task 1: Estender MetricsRepository com agregações p75 e cleanup** — `de3a494` (feat)
2. **Task 2: Criar página /admin/performance com dashboard RUM** — `6c3cf51` (feat)

**Plan metadata:** `TBD` (docs: complete plan)

## Files Created/Modified

- `src/lib/metrics/model.ts` — Added `P75Metric` interface
- `src/lib/metrics/repository.ts` — Extended `MetricsRepository` with `getP75ByPagePath` and `cleanupOldMetrics`
- `src/lib/metrics/repository.prisma.ts` — Implemented aggregation and cleanup methods
- `scripts/cleanup-metrics.mjs` — Standalone 30-day cleanup script
- `package.json` — Added `metrics:cleanup` script
- `src/app/(vault)/admin/performance/page.tsx` — Server Component RUM dashboard

## Decisions Made

- Used `db.$queryRaw` for `percentile_cont` because Prisma ORM lacks native percentile support; query is scoped by `created_at >=` and uses existing `@@index([createdAt])`
- Used typed `deleteMany` instead of raw SQL for cleanup to leverage Prisma's type safety and prevent accidental unscoped deletions
- Feature flag evaluated at build time via `process.env` — appropriate for an internal dev tool that requires rebuild/redeploy to toggle
- Empty state renders instructional message when no metrics exist instead of a generic blank page

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None — all data paths are wired to the repository; empty state is handled explicitly.

## Threat Flags

None — all security-relevant surface is covered by the plan's threat model:
- Feature flag mitigates T-31-04 (Information Disclosure)
- Indexed query mitigates T-31-05 (DoS on aggregation)
- Typed `deleteMany` mitigates T-31-06 (DoS/destructive cleanup)

## User Setup Required

None — no external service configuration required.

## Self-Check: PASSED

- [x] All 6 created/modified files exist on disk
- [x] Task commits `de3a494` and `6c3cf51` verified in git history
- [x] Build passes with zero TypeScript errors
- [x] All 419 tests continue passing

## Next Phase Readiness

- RUM dashboard is ready for use by the development team
- Cleanup script can be scheduled via cron or CI pipeline
- Next plan (31-03) can build on the metrics aggregation infrastructure

---
*Phase: 31-medi-o-observabilidade-e-itera-o*
*Completed: 2026-04-23*
