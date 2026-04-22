---
phase: "20"
plan: "06"
subsystem: financeiro
tags: [filters, url-state, expenses, search]
key-files:
  created:
    - src/app/(vault)/financeiro/components/expense-filters.tsx
  modified:
    - src/app/(vault)/financeiro/components/expenses-section.tsx
decisions:
  - URL-based filter state via router.replace + useSearchParams (no local state for filters)
  - Debounce 300ms on text search to avoid excessive router.replace calls
  - Filter deleted expenses (deletedAt !== null) at the section level before passing to list components
metrics:
  duration: "~15min"
  completed: "2026-04-22"
  tasks: 1
  files: 2
---

# Phase 20 Plan 06: ExpenseFilters Component Summary

URL-based expense filters with debounced text search, category select, value range, month picker, and empty state with clear action.

## What Was Built

- **`expense-filters.tsx`** — "use client" component reading/writing `q`, `category`, `minValue`, `maxValue`, `month` URL params via `router.replace`. Desktop: flex row; mobile: `<details>` collapsible. Debounces `q` 300ms. Shows "Limpar filtros" btn-ghost when any filter active.
- **`expenses-section.tsx`** — updated to import `ExpenseFilters`, read all filter params via `useSearchParams`, filter the expenses array (description text search, categoryId match, value range in cents, month/year parse), filter out `deletedAt !== null`, and show empty state with clear button when filters return 0 results.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/app/(vault)/financeiro/components/expense-filters.tsx` — FOUND
- `src/app/(vault)/financeiro/components/expenses-section.tsx` — modified
- Commit `491302f` — FOUND
- `pnpm tsc --noEmit` — clean (pre-existing test file errors unrelated)
- `pnpm next build` — PASSED
