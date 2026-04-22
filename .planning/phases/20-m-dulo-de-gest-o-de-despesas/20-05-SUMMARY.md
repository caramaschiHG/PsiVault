---
phase: 20
plan: "05"
subsystem: financeiro/despesas
tags: [ui, components, expenses, drawer, modal]
dependency_graph:
  requires: [20-04]
  provides: [expense-ui-components]
  affects: [financeiro-page]
tech_stack:
  added: []
  patterns: [focus-trap, two-step-drawer, segmented-control, drop-zone]
key_files:
  created:
    - src/app/(vault)/financeiro/components/expense-stat-cards.tsx
    - src/app/(vault)/financeiro/components/expense-view-toggle.tsx
    - src/app/(vault)/financeiro/components/expense-list.tsx
    - src/app/(vault)/financeiro/components/expense-grouped-list.tsx
    - src/app/(vault)/financeiro/components/recurrence-scope-dialog.tsx
    - src/app/(vault)/financeiro/components/expense-category-modal.tsx
    - src/app/(vault)/financeiro/components/receipt-drop-zone.tsx
    - src/app/(vault)/financeiro/components/expense-side-panel.tsx
    - src/app/(vault)/financeiro/components/expenses-section.tsx
  modified:
    - src/app/(vault)/financeiro/page-client.tsx
decisions:
  - "Plain input with manual BRL formatting instead of MaskedInput (MaskedInput only supports phone/crp)"
  - "DropZoneState type excludes drag-over variant (isDragOver boolean is separate state)"
  - "onSaved callback receives minimal Expense object built client-side on create (avoids extra server round-trip)"
metrics:
  duration: ~35min
  completed: "2026-04-22"
  tasks: 10
  files: 10
---

# Phase 20 Plan 05: Despesas UI Components Summary

**One-liner:** Nine interactive UI components for the Despesas module — stat cards, flat/grouped lists, two-step create drawer with receipt upload, category CRUD modal, and recurrence scope dialog — wired into a new Despesas tab in `/financeiro`.

## Tasks Completed

| Task | Component | Commit |
|------|-----------|--------|
| 1 | ExpenseStatCards | 36645a4 |
| 2 | ExpenseViewToggle | d9b4076 |
| 3 | ExpenseList | f0c6cac |
| 4 | ExpenseGroupedList | f0c6cac |
| 5 | RecurrenceScopeDialog | 1636257 |
| 6 | ExpenseCategoryModal | 1636257 |
| 7 | ReceiptDropZone | 1636257 |
| 8 | ExpenseSidePanel | bd0965a |
| 9 | ExpensesSection | bd0965a |
| 10 | page-client.tsx Despesas tab | bd0965a |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DropZoneState type had unreachable "drag-over" variant**
- **Found during:** Task 7 (TypeScript check)
- **Issue:** `DropZoneState` union included `"drag-over"` which could never be assigned (isDragOver is separate boolean state), causing TS2367 comparison error
- **Fix:** Removed `"drag-over"` from the union; isDragOver boolean is used directly in style computation
- **Files modified:** `receipt-drop-zone.tsx`
- **Commit:** 1636257

## Known Stubs

- `ExpenseSidePanel.onSaved` builds a minimal `Expense` object client-side (empty `workspaceId`, `createdByAccountId`) — these fields are not rendered in UI but are structurally present. The real data is fetched on next `router.refresh()`.

## Self-Check: PASSED

Files created:
- expense-stat-cards.tsx ✓
- expense-view-toggle.tsx ✓  
- expense-list.tsx ✓
- expense-grouped-list.tsx ✓
- recurrence-scope-dialog.tsx ✓
- expense-category-modal.tsx ✓
- receipt-drop-zone.tsx ✓
- expense-side-panel.tsx ✓
- expenses-section.tsx ✓
- page-client.tsx (modified) ✓

Build: PASSED (`pnpm next build` clean)
TypeScript: PASSED (only pre-existing errors in tests/bugfix-regressions.test.ts)
