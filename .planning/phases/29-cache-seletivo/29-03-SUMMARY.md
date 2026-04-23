---
phase: 29-cache-seletivo
plan: 03
subsystem: cache
tags: [revalidateTag, cache-invalidation, mutations, data-cache]
dependency_graph:
  requires: [29-01, 29-02]
  provides: [domain-cache-invalidation]
  affects: [src/app/(vault)/financeiro/actions.ts, src/app/(vault)/setup/actions.ts, src/app/(vault)/appointments/actions.ts, src/app/(vault)/actions/reminders.ts, src/app/(vault)/settings/notificacoes/actions.ts]
tech_stack:
  added: []
  patterns: [revalidateTag + revalidatePath dual invalidation]
key_files:
  created: []
  modified: [src/app/(vault)/financeiro/actions.ts, src/app/(vault)/setup/actions.ts, src/app/(vault)/appointments/actions.ts, src/app/(vault)/actions/reminders.ts, src/app/(vault)/settings/notificacoes/actions.ts]
decisions:
  - "D-05: invalidação dupla em mutations — revalidatePath + revalidateTag"
metrics:
  duration: "35 min"
  completed_date: "2026-04-23"
---

# Phase 29 Plan 03: revalidateTag Integration Summary

**One-liner:** Added `revalidateTag` cache invalidation to all 23+ Server Action mutations across finance, setup, appointments, reminders, and notifications domains.

## What Was Built

1. **src/app/(vault)/financeiro/actions.ts** — 12 mutation actions now call `revalidateTag`:
   - `financeCharges` tag: markChargeAsPaid, undoChargePayment, createManualCharge
   - `expenseCategories` tag: create, rename, archive expense category
   - `expenses` tag: create, update, delete expense + attach/replace/remove receipt

2. **src/app/(vault)/setup/actions.ts** — 3 mutation actions now call `revalidateTag(CACHE_TAGS.practiceProfile)`

3. **src/app/(vault)/appointments/actions.ts** — 8 mutation actions now call `revalidateTag(CACHE_TAGS.appointments)`:
   - createAppointmentQuick, reschedule, cancel, confirm, complete, noShow, editMeetingLink, addRemoteIssueNote

4. **src/app/(vault)/actions/reminders.ts** — 2 mutation actions now call `revalidateTag(CACHE_TAGS.reminders)`

5. **src/app/(vault)/settings/notificacoes/actions.ts** — 1 mutation action now calls `revalidateTag(CACHE_TAGS.notifications)`

Total: **26 revalidateTag call sites added across 23 mutation actions**

## Verification

- Every mutation action that persists data calls `revalidateTag` of the corresponding domain
- `revalidateTag` is called AFTER persistence and BEFORE return
- `revalidatePath` calls were preserved (dual invalidation pattern)
- Read-only actions (`testSmtpConnectionAction`, `exportFinanceCSVAction`) do NOT have `revalidateTag`
- `pnpm build` passes with no TypeScript errors
- All 419 tests pass

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all revalidateTag calls are wired to real domain tags.

## Threat Flags

None.

## Self-Check: PASSED

- [x] revalidateTag present in all 5 mutation files
- [x] revalidateTag called after mutation and before return
- [x] revalidatePath preserved alongside revalidateTag
- [x] Read-only actions excluded
- [x] Build passes
- [x] All 419 tests pass
- [x] Commit 187635c exists
