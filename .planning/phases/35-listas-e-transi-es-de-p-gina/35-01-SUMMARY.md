---
phase: 35-listas-e-transi-es-de-p-gina
plan: 01
subsystem: ui
tags: [css, motion, animation, stagger, accessibility]

requires:
  - phase: 32-motion-tokens
    provides: "--duration-* and --ease-* tokens, motion.css file"

provides:
  - "slideUp stagger animation via .motion-stagger"
  - "Expand/collapse animation for <details> elements"
  - "List item enter/exit animations with @starting-style"
  - "Vault page transition reduced to 150ms"

affects:
  - "Plan 35-02: Server Component list stagger"
  - "Plan 35-03: Details expand/collapse in agenda/prontuário"
  - "Plan 35-04: Details expand/collapse in financeiro/patients"
  - "Plan 35-05: Client-side list add/remove feedback"

tech-stack:
  added: []
  patterns:
    - "CSS-only animations — zero animation libraries"
    - "prefers-reduced-motion: reduce covers all new classes"
    - "grid-template-rows technique for smooth height animation"

key-files:
  created: []
  modified:
    - "src/styles/motion.css"
    - "src/app/globals.css"

key-decisions:
  - "Hardcoded 150ms for vault page transitions instead of adding a new token — specific to page transitions"
  - "Used @starting-style for list-item-start to enable CSS-only entry animations without JS"

patterns-established:
  - "Expand/collapse: .details-animated + .details-animated-content with grid-template-rows"
  - "Add/remove: .list-item-start / .list-item-exit with @starting-style"
  - "Stagger cap: i < 10 limit on --stagger-index to prevent excessive delays"

requirements-completed:
  - LIST-02

duration: 15min
completed: 2026-04-24
---

# Phase 35 Plan 01: CSS Foundation for List and Transition Animations

**CSS-only animation foundation with slideUp stagger, expand/collapse grid animation, list item enter/exit, and reduced-motion compliance**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-24T15:39:00Z
- **Completed:** 2026-04-24T15:54:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Updated `.motion-stagger > *` to use `slideUp` keyframe (fadeIn + translateY)
- Added `.details-animated` and `.details-animated-content` for smooth height expand/collapse
- Added `.list-item-start` (with `@starting-style`) and `.list-item-exit` for client-side list animations
- Reduced vault page transition duration from 200ms to 150ms
- All new classes covered by `prefers-reduced-motion: reduce`

## Task Commits

1. **Task 1: Update motion.css with list, expand/collapse, and add/remove animation classes** + **Task 2: Adjust vault page transition duration to 150ms** — `96b921a` (feat)

## Files Created/Modified
- `src/styles/motion.css` — Added expand/collapse classes, list item enter/exit animations, updated stagger to slideUp, extended reduced-motion coverage
- `src/app/globals.css` — Reduced `.vault-page-enter` and `.vault-page-transition` from 200ms to 150ms

## Decisions Made
- Hardcoded `150ms` for page transitions rather than adding a `--duration-150` token — page transitions are the only consumer
- Used `@starting-style` for `.list-item-start` to enable pure CSS entry animations without React state management

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CSS foundation complete and ready for all Wave 2 plans
- No blockers — Plans 35-02 through 35-05 can proceed

---
*Phase: 35-listas-e-transi-es-de-p-gina*
*Completed: 2026-04-24*
