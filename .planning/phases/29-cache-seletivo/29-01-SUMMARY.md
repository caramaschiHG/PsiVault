---
phase: 29-cache-seletivo
plan: 01
subsystem: cache
 tags: [cache, unstable_cache, workspace-scoped, performance]
dependency_graph:
  requires: []
  provides: [CACHE_TAGS, buildCacheKey, cached-profile, cached-expense-categories]
  affects: [src/lib/setup/profile.ts, src/lib/expense-categories/repository.prisma.ts]
tech_stack:
  added: []
  patterns: [unstable_cache, workspace-scoped keys]
key_files:
  created: [src/lib/cache/tags.ts, tests/__mocks__/next/cache.ts]
  modified: [src/lib/setup/profile.ts, src/lib/expense-categories/repository.prisma.ts, tests/expenses/actions.test.ts]
decisions:
  - "D-01: usar unstable_cache (não React.cache) — React.cache é request-scoped"
  - "D-02: workspaceId obrigatório em toda chave de cache"
metrics:
  duration: "45 min"
  completed_date: "2026-04-23"
---

# Phase 29 Plan 01: Cache Foundation Summary

**One-liner:** Centralized cache tags and `unstable_cache` wrappers for practice profile and expense categories with workspace-scoped keys.

## What Was Built

1. **src/lib/cache/tags.ts** — Centralized cache tag registry (`CACHE_TAGS`) and `buildCacheKey` helper that enforces `workspaceId` in every key to prevent cross-tenant leakage.
2. **src/lib/setup/profile.ts** — `getPracticeProfileSnapshot` now delegates to `_getCachedPracticeProfile` via `unstable_cache` with 1h TTL and `practice-profile` tag.
3. **src/lib/expense-categories/repository.prisma.ts** — `findByWorkspace` and `findActiveByWorkspace` now use `unstable_cache` with 1h TTL and `expense-categories` tag. Mutations (`create`, `update`, `softDelete`) remain uncached.
4. **tests/__mocks__/next/cache.ts** — Global mock for `next/cache` in vitest to prevent test hangs from real `unstable_cache`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test timeout due to missing `unstable_cache` mock**
- **Found during:** Task 3 verification (full test suite)
- **Issue:** `tests/expenses/actions.test.ts` timed out because `createPrismaExpenseCategoryRepository()` now calls `unstable_cache` during module evaluation, and the test only mocked `revalidatePath`
- **Fix:** Added `tests/__mocks__/next/cache.ts` with `unstable_cache` passthrough mock; updated `actions.test.ts` to use `vi.mock("next/cache")` without factory
- **Files modified:** `tests/__mocks__/next/cache.ts`, `tests/expenses/actions.test.ts`
- **Commit:** 430abbc

## Known Stubs

None — all cache wrappers are fully wired to their data sources.

## Threat Flags

None — workspaceId is explicitly passed as argument to all cached functions, preventing cross-tenant leakage.

## Self-Check: PASSED

- [x] `src/lib/cache/tags.ts` exists and exports `CACHE_TAGS` + `buildCacheKey`
- [x] `src/lib/setup/profile.ts` contains `unstable_cache` wrapper
- [x] `src/lib/expense-categories/repository.prisma.ts` contains `unstable_cache` wrappers
- [x] Build passes (`pnpm build`)
- [x] All 419 tests pass (`pnpm test`)
- [x] Commit 430abbc exists
