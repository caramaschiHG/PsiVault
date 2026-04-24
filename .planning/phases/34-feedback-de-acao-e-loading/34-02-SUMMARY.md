# Plan 34-02: Spinner + Skeleton Shimmer — Summary

**Status:** Complete ✅
**Completed:** 2026-04-24
**Commit:** 6983832

## What Changed

### `src/components/ui/spinner.tsx` (new)
- Created standalone `Spinner` component with 3 sizes: sm (14px), md (20px), lg (28px)
- Based on the previous inline `SpinnerIcon` from `button.tsx`
- Added accessibility: `role="status"`, default `aria-label="Carregando..."`, conditional `aria-hidden`
- Uses CSS `spin` keyframe from `motion.css` for animation

### `src/components/ui/button.tsx`
- Added `import { Spinner } from "./spinner";`
- Removed inline `SpinnerIcon()` function
- Replaced 2 occurrences of `<SpinnerIcon />` with `<Spinner size="sm" aria-hidden="true" />`

### `src/app/globals.css`
- Refined `.skeleton-shimmer` animation:
  - Duration: `1.4s` → `1.6s` (more organic, less mechanical)
  - Easing: `ease` → `ease-in-out` (smoother bidirectional transition)
  - Colors unchanged (`#f0ebe2`, `#e8e2d9`) — already match app background

## Verification
- `pnpm test` — 419 tests passing, 0 failures
- `Spinner` component is importable and renders correctly
- `Button` still shows spinner during `isLoading` state
- Skeleton shimmer uses updated duration and easing

## Requirements Covered
- FEED-03: Skeletons exibem shimmer gradient orgânico em vez de pulse mecânico de opacidade
- FEED-04: Spinner leve (SVG + CSS) disponível para todos os estados de loading

## Notes
- Zero breaking changes. The `Spinner` API is additive — existing code using `Button` with `isLoading` works identically.
- The `Spinner` component can now be used outside of `Button` (e.g., in loading states for other components).
