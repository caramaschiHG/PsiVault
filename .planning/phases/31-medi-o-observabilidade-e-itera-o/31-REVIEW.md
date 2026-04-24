---
phase: 31
reviewed: 2026-04-23T21:15:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - package.json
  - lighthouserc.js
  - tests/memory/patient-navigation.scenario.js
  - src/components/react-scan.tsx
  - src/app/(vault)/layout.tsx
  - src/lib/metrics/model.ts
  - src/lib/metrics/repository.ts
  - src/lib/metrics/repository.prisma.ts
  - src/app/(vault)/admin/performance/page.tsx
  - scripts/cleanup-metrics.mjs
  - scripts/generate-performance-report.mjs
findings:
  critical: 0
  warning: 1
  info: 4
  total: 5
status: issues_found
---

# Phase 31: Code Review Report

**Reviewed:** 2026-04-23T21:15:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 31 introduces observability tooling (Lighthouse CI, memlab, react-scan), a RUM metrics repository with p75 aggregation, an internal `/admin/performance` dashboard, and standalone cleanup/reporting scripts. The code is generally well-structured, follows project conventions, and applies appropriate security mitigations (feature flags, dynamic imports gated by `NODE_ENV`, safe Prisma queries).

Most findings are low-severity quality issues: dead code, inconsistent Prisma client initialization patterns, missing graceful error handling in the dashboard, and fixed timeouts in test scenarios. No critical security vulnerabilities or logic bugs were found.

## Critical Issues

_None._

## Warnings

### WR-01: process.exit(1) in `.catch()` prevents `.finally()` cleanup in standalone scripts

**File:** `scripts/cleanup-metrics.mjs:15`, `scripts/generate-performance-report.mjs:152`
**Issue:** Both scripts chain `.catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect())`. Since `process.exit()` terminates the process synchronously, the `.finally()` handler never executes on error paths. The Prisma connection pool is not closed gracefully, which can leave hanging connections or prevent flush of pending operations.
**Fix:** Set `process.exitCode = 1` in the catch handler so the process continues to `.finally()` before exiting:

```js
main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
```

## Info

### IN-01: Unused `__dirname` variable in report generator

**File:** `scripts/generate-performance-report.mjs:6`
**Issue:** `const __dirname = path.dirname(fileURLToPath(import.meta.url));` is declared but never referenced elsewhere in the script.
**Fix:** Remove the unused variable.

### IN-02: Fixed `waitForTimeout` in memlab scenario instead of event-based waits

**File:** `tests/memory/patient-navigation.scenario.js:6,10,14`
**Issue:** The scenario uses `page.waitForTimeout(2000)` after each click. Fixed sleeps make the scenario brittle if navigation or rendering takes longer than 2 seconds, and slower than necessary if it finishes earlier.
**Fix:** Prefer `page.waitForNavigation({ waitUntil: 'networkidle' })` or `page.waitForSelector()` after clicks to wait for actual page state instead of arbitrary delays.

### IN-03: Dashboard data fetch lacks try/catch for graceful degradation

**File:** `src/app/(vault)/admin/performance/page.tsx:10-11`
**Issue:** `const rows = await repo.getP75ByPagePath(7);` is unguarded. If the database is unreachable, the Server Component throws an unhandled error and Next.js renders the error boundary instead of a friendly message.
**Fix:** Wrap the repository call in `try/catch` and render an error state or empty state when the query fails.

### IN-04: Standalone scripts bypass app Prisma singleton and extensions

**File:** `scripts/cleanup-metrics.mjs:3`, `scripts/generate-performance-report.mjs:7`
**Issue:** Both scripts instantiate `new PrismaClient()` directly rather than importing the singleton from `src/lib/db.ts`. This skips the query-performance extension (slow-query logging) and creates a separate connection pool. While acceptable for isolated CLI execution, it deviates from the codebase's established singleton pattern.
**Fix:** Consider importing `db` from `src/lib/db.ts` if the scripts run in the same Node process as the app, or document the intentional divergence in a code comment.

---

_Reviewed: 2026-04-23T21:15:00Z_
_Reviewer: gsd-code-reviewer_
_Depth: standard_
