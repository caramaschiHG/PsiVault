---
phase: "20"
plan: "04"
subsystem: financeiro
tags: [server-actions, expenses, receipt, api-route]
dependency_graph:
  requires: [20-02, 20-03]
  provides: [createExpenseCategoryAction, renameExpenseCategoryAction, archiveExpenseCategoryAction, createExpenseAction, updateExpenseAction, deleteExpenseAction, attachReceiptAction, replaceReceiptAction, removeReceiptAction]
  affects: [financeiro/actions.ts, financeiro/page.tsx, financeiro/page-client.tsx]
tech_stack:
  added: []
  patterns: [repository-pattern, server-actions, supabase-storage, signed-url-redirect]
key_files:
  created:
    - src/app/api/expenses/[expenseId]/receipt/route.ts
    - tests/expenses/actions.test.ts
  modified:
    - src/app/(vault)/financeiro/actions.ts
    - src/app/(vault)/financeiro/page.tsx
    - src/app/(vault)/financeiro/page-client.tsx
decisions:
  - Used @/ alias instead of relative path in test imports to handle parentheses in route group paths
  - materializeSeries input does not include dueDate field (it computes it from firstOccurrenceDate + recurrence)
metrics:
  duration: ~15min
  completed: "2026-04-22"
  tasks: 6
  files: 5
---

# Phase 20 Plan 04: Server Actions & API Route for Expenses Summary

Server actions for expense categories, expenses, and receipts added to financeiro/actions.ts; signed URL API route created; page.tsx extended to load expenses+categories in parallel.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 20-04-01 | Category actions (create/rename/archive) | e40818b |
| 20-04-02 | Expense actions (create/update/delete with series scope) | e40818b |
| 20-04-03 | Receipt actions (attach/replace/remove) | e40818b |
| 20-04-04 | API route GET /api/expenses/[expenseId]/receipt | e40818b |
| 20-04-05 | Extend page.tsx + page-client.tsx with expenses/categories props | e40818b |
| 20-04-06 | Tests for workspace scoping in expense actions | e40818b |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] materializeSeries input shape mismatch**
- **Found during:** Task 20-04-02
- **Issue:** The plan's `createExpenseAction` passed `dueDate` to `materializeSeries`, but `MaterializeSeriesInput` extends `CreateExpenseInput` omitting `dueDate` (since it's computed from `firstOccurrenceDate`)
- **Fix:** Removed `dueDate` from the `materializeSeries` call; only `firstOccurrenceDate` is passed
- **Files modified:** src/app/(vault)/financeiro/actions.ts

**2. [Rule 1 - Bug] Test import path with parentheses**
- **Found during:** Task 20-04-06
- **Issue:** Relative path `../src/app/(vault)/financeiro/actions` fails TypeScript module resolution
- **Fix:** Used `@/app/(vault)/financeiro/actions` alias (confirmed working pattern from auth-signup-action.test.ts)
- **Files modified:** tests/expenses/actions.test.ts

## Verification Results

- `pnpm tsc --noEmit`: Clean (pre-existing errors in bugfix-regressions.test.ts unrelated to this plan)
- `pnpm vitest run tests/expenses/actions.test.ts`: 3/3 tests pass
- `pnpm next build`: Succeeds — `/api/expenses/[expenseId]/receipt` route visible in output

## Self-Check: PASSED

- src/app/(vault)/financeiro/actions.ts: exists ✓
- src/app/api/expenses/[expenseId]/receipt/route.ts: exists ✓
- tests/expenses/actions.test.ts: exists ✓
- Commit e40818b: exists ✓
