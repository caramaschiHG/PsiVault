# Plan 34-03: Button Loading State — Summary

**Status:** Complete ✅
**Completed:** 2026-04-24
**Commit:** aa3a8ac

## What Changed

### `src/app/(vault)/agenda/components/calendar-grid.tsx`
- Changed `const [, startTransition] = useTransition()` to `const [isPending, startTransition] = useTransition()`
- Added visual feedback during drag-and-drop reagendamento:
  - `opacity: isPending ? 0.6 : 1` with `transition: "opacity var(--duration-100) ease-out"`
  - `cursor: isPending ? "wait" : "default"`

### `src/app/(vault)/agenda/components/week-calendar-grid.tsx`
- Same changes as calendar-grid.tsx — opacity dip + wait cursor during reagendamento

## Verification
- `pnpm test` — 419 tests passing, 0 failures
- Grep confirms zero remaining `const [, startTransition]` patterns in the vault

## Audit Results

All `useTransition` callers in `src/app/(vault)/` were audited:

| File | Status | Feedback Type |
|------|--------|---------------|
| `calendar-grid.tsx` | Fixed | opacity + cursor |
| `week-calendar-grid.tsx` | Fixed | opacity + cursor |
| `quick-create-wrapper.tsx` | Already correct | isPending for router.refresh() (no UI needed) |
| `quick-create-popover.tsx` | Already correct | disabled + opacity + label |
| `appointment-quick-actions.tsx` | Already correct | disabled + label |
| `workspace-backup-button.tsx` | Already correct | disabled + label |
| `reminders-section.tsx` | Already correct | `Button[isLoading]` |
| `export-section.tsx` | Already correct | disabled + label |
| `expense-category-modal.tsx` | Already correct | disabled |
| `expense-side-panel.tsx` | Already correct | disabled + label |
| `financeiro/page-client.tsx` | Already correct | `Button[isLoading]` |

## Requirements Covered
- FEED-02: Botões de Server Action exibem estado de loading visual via `useTransition` (opacity + spinner)

## Notes
- Calendar navigation uses subtle opacity dip (0.6) instead of full spinner — drag-and-drop reagendamento is fast and a spinner would be distracting.
- All other components already had `isPending` wired to appropriate visual feedback.
