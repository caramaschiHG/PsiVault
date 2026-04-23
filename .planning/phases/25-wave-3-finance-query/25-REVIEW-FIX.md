---
phase: 25
fixed_at: 2026-04-22T00:00:00Z
review_path: .planning/phases/25-wave-3-finance-query/25-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 25: Code Review Fix Report

**Fixed at:** 2026-04-22  
**Source review:** `.planning/phases/25-wave-3-finance-query/25-REVIEW.md`  
**Iteration:** 1

**Summary:**
- Findings in scope: 5
- Fixed: 5
- Skipped: 0

## Fixed Issues

### HI-01: monthEnd off-by-one — midnight of last day misses same-second appointments

**Files modified:** `src/app/(vault)/financeiro/page.tsx`  
**Commit:** 829dca1  
**Applied fix:** Changed `monthEnd` from `new Date(Date.UTC(year, month, 0, 23, 59, 59))` to `new Date(Date.UTC(year, month, 1))` (exclusive upper bound = first instant of next month). Changed the Prisma `restOfMonth` query from `lte: monthEnd` to `lt: monthEnd` to match the exclusive boundary.

---

### WR-02: rangeEnd year-boundary branch is unnecessary

**Files modified:** `src/app/(vault)/financeiro/page.tsx`  
**Commit:** 829dca1  
**Applied fix:** Replaced the three-line manual branch (`rangeEndMonth`, `rangeEndYear`, `rangeEnd`) with the single-line form `new Date(Date.UTC(maxYear, maxMonth, 1))`, relying on `Date.UTC` auto-normalisation of month=12 → January of next year.

---

### WR-03: apptIds may contain duplicate appointment IDs

**Files modified:** `src/app/(vault)/financeiro/page.tsx`  
**Commit:** 829dca1  
**Applied fix:** Wrapped the `apptIds` array construction with `[...new Set(...)]` so duplicate appointment IDs (from multiple charges referencing the same appointment) are deduplicated before the `db.appointment.findMany` call.

---

### IN-01: `computeBreakdown` returns unused `charges` field

**Files modified:** `src/app/(vault)/financeiro/page.tsx`  
**Commit:** 829dca1  
**Applied fix:** Removed `charges` from the `computeBreakdown` return value. The function now returns `{ enriched, summary }` only. The local `charges` variable is still computed internally (needed to derive `enriched`), it just isn't exported in the return object since no call-site reads it.

---

### IN-02: No comment explaining intentional per-month query in `exportFinanceCSVAction`

**Files modified:** `src/app/(vault)/financeiro/actions.ts`  
**Commit:** 829dca1  
**Applied fix:** Added inline comment before `financeRepo.listByWorkspaceAndMonth(...)` in `exportFinanceCSVAction` clarifying that the single-month query is intentional and not an oversight of the batch-range pattern used by the page loader.

---

_Fixed: 2026-04-22_  
_Fixer: gsd-code-fixer_  
_Iteration: 1_
