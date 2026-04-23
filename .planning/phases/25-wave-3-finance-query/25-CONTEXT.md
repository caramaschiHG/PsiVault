# Phase 25 — Wave 3: Finance Query Consolidation

## Problem

`/financeiro/page.tsx` calls `loadMonthBreakdown` 20 times (current + prev + 6 trend + 12 year).
Each call issues 1–2 DB queries → ~40 queries total on every page load.

Root causes:
1. `current` month is computed 3× (standalone + trendBreakdowns[5] + yearBreakdowns[month-1])
2. `prev` month is computed 2× (standalone + trendBreakdowns[4])
3. Each `loadMonthBreakdown` does its own `listByWorkspaceAndMonth` + optional `appointment.findMany`
4. All 13 server actions call `revalidatePath("/financeiro")` without type → revalidates vault layout

## Decisions

- **Area 1 (batch query)**: Add `listByWorkspaceAndDateRange` to repository interface. One query covers the full range of months needed (trend + year). All individual per-month DB calls eliminated.
- **Area 2 (deduplication)**: Remove standalone `current` and `prev` calls. Extract from batch data in memory using `groupChargesByMonth` helper.
- **Area 3 (revalidatePath)**: Change all 13 `revalidatePath("/financeiro")` → `revalidatePath("/financeiro", "page")`.

## Target files

- `src/lib/finance/repository.ts` — add interface method + in-memory impl
- `src/lib/finance/repository.prisma.ts` — add Prisma impl
- `src/app/(vault)/financeiro/page.tsx` — batch refactor
- `src/app/(vault)/financeiro/actions.ts` — revalidatePath type fix

## Expected outcome

- ~40 DB queries → 3 (1 range charges + 1 batch apptIds + 1 restOfMonth appointments)
- Zero redundant month computations
- Layout cache preserved on finance mutations
