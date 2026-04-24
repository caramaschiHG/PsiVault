# Plan 34-01: Toast Animation — Summary

**Status:** Complete ✅
**Completed:** 2026-04-24
**Commit:** 59bd4dc

## What Changed

### `src/styles/motion.css`
- Added `@keyframes toastFadeOut` for toast exit animation (fade out, 300ms)
- Added `.toast-exit` utility class using `--duration-300` and `--ease-out` tokens
- Updated `prefers-reduced-motion: reduce` media query to include `.toast-exit`
- Added specific rule `.toast-exit { opacity: 0 !important; }` inside reduced-motion media query so toasts disappear instantly when reduced motion is active

### `src/components/ui/toast-provider.tsx`
- Changed toast item `className` from `t.fading ? "" : "toast-enter"` to `t.fading ? "toast-exit" : "toast-enter"`
- Removed inline `transition: t.fading ? "opacity 500ms ease" : "none"` from toast item style
- Removed `transition: "opacity 500ms ease"` from `toastStyle` constant
- Aligned DOM removal timeout from 3500ms to 3300ms (3000ms visible + 300ms fade)

## Verification
- `pnpm test` — 419 tests passing, 0 failures
- Toast enter animation: slide+fade via existing `.toast-enter` class (≤300ms)
- Toast exit animation: fade via new `.toast-exit` class (≤300ms)
- Reduced motion fallback: toasts disappear instantly when `prefers-reduced-motion: reduce` is active

## Requirements Covered
- FEED-01: Toasts entram com slide+fade e saem com fade — duração ≤300ms, sem bloquear interação

## Notes
- No breaking changes. Toast behavior is visually improved but functionally identical.
- The `toast-enter` class already existed and was unchanged — only exit animation was missing.
