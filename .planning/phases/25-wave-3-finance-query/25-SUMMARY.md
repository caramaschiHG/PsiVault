# Phase 25 — Wave 3: Finance Query Consolidation

**one_liner**: Consolidou ~40 queries individuais do /financeiro em 3 queries totais via range batch + in-memory grouping.

## Summary

### What was built

- Added `listByWorkspaceAndDateRange(workspaceId, from, to)` to `SessionChargeRepository` interface, in-memory implementation, and Prisma implementation
- Refactored `/financeiro/page.tsx` to use a single date-range query covering all months (trend 6× + year 12× + prev), batching all appointment lookups into one `findMany` call
- Added `groupChargesByMonth` and `computeBreakdown` pure helpers for in-memory month breakdown computation
- Removed `loadMonthBreakdown` function (was making 1–2 DB queries per month, called 20 times)
- Deduplicated `current` and `prev` month data from the batch (no longer fetched separately)
- Fixed all 13 `revalidatePath("/financeiro")` → `revalidatePath("/financeiro", "page")` in actions.ts

### Decisions

- `listByWorkspaceAndDateRange` returns all charges in a date range — grouping/filtering done in memory
- `current` and `prev` extracted from batch — eliminates 2 redundant DB calls
- `monthEnd` forecast boundary uses exclusive next-month start (`Date.UTC(year, month, 1)` + `lt:`) — consistent with other range patterns in codebase
- `revalidatePath` with `"page"` type — preserves vault layout cache on finance mutations

### Metrics

- DB queries on `/financeiro` load: ~40 → 3 (1 range charges, 1 batch apptIds, 1 restOfMonth)
- Tests: 407/407 passing

### Review findings resolved

- HI-01: `monthEnd` boundary fixed (exclusive bound, `lt:` instead of `lte:`)
- WR-02: `rangeEnd` simplified using `Date.UTC` auto-normalization
- WR-03: apptIds deduplicated with `Set` before `findMany`
- IN-01: Dead `charges` field removed from `computeBreakdown` return
- IN-02: Comment added to `exportFinanceCSVAction` explaining intentional single-month query
