---
phase: 33-micro-interacoes-em-componentes-base
plan: "01"
subsystem: ui
tags: [css, micro-interactions, accessibility, motion]
requires: []
provides: [micro-interaction-css-foundation]
affects: [auth-forms, vault-forms, card-component]
tech-stack:
  added: []
  patterns: [css-focus-rings, floating-labels, error-shake]
key-files:
  created: []
  modified:
    - src/app/globals.css
    - src/styles/motion.css
    - src/components/ui/card.tsx
key-decisions:
  - Replaced outline with box-shadow focus rings for consistency and better styling control
  - Consolidated duplicate legacy CSS blocks into single canonical rules
  - Floating labels use CSS sibling selector (~) requiring specific DOM structure
  - Card auto-applies card-hover class when interactive (onClick or asLink)
requirements-completed:
  - MICR-01
  - MICR-02
  - MICR-03
  - MICR-04
  - MICR-05
duration: "15 min"
completed: "2026-04-23T21:05:00Z"
---

# Phase 33 Plan 01: Micro-interaction CSS Foundation Summary

**One-liner:** Established the complete CSS foundation for micro-interactions — focus ring system, card hover, button active states, input error shake, floating labels, and sidebar nav transitions; updated Card component with asLink prop and auto card-hover class.

## Duration
- **Start:** 2026-04-23T20:50:00Z
- **End:** 2026-04-23T21:05:00Z
- **Elapsed:** ~15 min

## Tasks Completed

### Task 1: Consolidate and extend globals.css with micro-interaction system
- **Files:** `src/app/globals.css`
- Replaced global `:focus-visible` with box-shadow ring using motion tokens
- Refined input focus-visible rules for `.input-field`, `.auth-input`, `.auth-otp-digit`
- Added sidebar focus ring override with warm accent color
- Replaced tab focus ring with inset box-shadow
- Added bottom nav focus ring
- Updated `.card-hover` base rule with `--ease-out` and added `.card-hover:hover` with `translateY(-2px)`
- Removed duplicate legacy Micro-interactions & Polish block and duplicate button active states
- Added consolidated button active states with `scale(0.97)`
- Added `.input-error` and `.input-error-shake` classes
- Added floating label system with `.input-floating-label-wrap`, `.input-floating-label`, and sibling selectors
- Added auth-specific floating label override (`top: 1.875rem` for `.auth-input`)
- Refined sidebar nav transitions with `duration-300` on hover

### Task 2: Add inputShake keyframe and reduced-motion coverage to motion.css
- **Files:** `src/styles/motion.css`
- Added `@keyframes inputShake` with 4 keyframes (0%, 25%, 75%, 100%)
- Added `.input-error-shake` to the `@media (prefers-reduced-motion: reduce)` selector list

### Task 3: Update Card component with asLink prop and auto card-hover class
- **Files:** `src/components/ui/card.tsx`
- Added `asLink?: boolean` to `CardProps` interface
- Updated `Card` function to destructure `asLink` and compute `isInteractive = !!onClick || !!asLink`
- Auto-applies `"card-hover"` class when `isInteractive` is true
- Removed inline `transition` and `cursor` from `interactive` variant style (now handled by CSS)
- Component renders with `combinedClassName` instead of raw `className`

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| Focus ring in globals.css | `Select-String "box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-accent)"` | PASS (line 632) |
| inputShake keyframe | `Select-String "@keyframes inputShake"` | PASS (line 131) |
| input-error-shake in motion.css | `Select-String "input-error-shake"` | PASS (line 156) |
| asLink in card.tsx | `Select-String "asLink"` | PASS (4 matches) |
| card-hover in card.tsx | `Select-String "card-hover"` | PASS (line 67) |
| Tests | `pnpm test` | PASS (419/419) |

## Deviations from Plan

None — plan executed exactly as written.

## Next Step

Ready for Plan 33-02 (auth forms floating labels). Wave 1 complete.
