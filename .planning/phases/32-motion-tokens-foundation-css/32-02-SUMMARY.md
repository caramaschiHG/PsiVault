---
phase: 32-motion-tokens-foundation-css
plan: 02
subsystem: ui
tags: [css, motion, migration, tokens, refactoring]

requires:
  - phase: 32-motion-tokens-foundation-css
    plan: 01
    provides: "Motion tokens in :root and motion.css with keyframes/utilities"

provides:
  - "globals.css with zero hardcoded transition durations"
  - "All keyframes consolidated in motion.css"
  - "Deprecated tokens removed from :root"
affects:
  - "All components using .card-hover, .tab-panel, .notif-dropdown, etc."

tech-stack:
  added: []
  patterns:
    - "Tokenized transitions: var(--duration-*) and var(--ease-*)"
    - "Keyframe consolidation in motion.css"
    - "Migration mapping table for duration rounding"

key-files:
  created: []
  modified:
    - "src/app/globals.css"
    - "src/styles/motion.css"

key-decisions:
  - "80ms/100ms/120ms/0.12s → --duration-100; 150ms/180ms/200ms/0.15s → --duration-200; 250ms → --duration-300"
  - "Preserve cubic-bezier(0.16, 1, 0.3, 1) in .notif-dropdown and .side-panel-drawer"
  - "Preserve 1.4s in skeleton-shimmer and 60ms in button active press"
  - "Remove deprecated --transition-* tokens after migration complete"

patterns-established:
  - "All transitions use motion tokens"
  - "All animations use tokenized durations"
  - "Zero @keyframes in globals.css — all in motion.css"

requirements-completed: [MOTF-01, MOTF-03]

# Metrics
duration: 30min
completed: 2026-04-23
---

# Phase 32 Plan 02: Migration of Existing Animations Summary

**Migrated all 30+ hardcoded transitions and 13 keyframes to canonical motion tokens, consolidating keyframes into motion.css**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-04-23T16:05:00Z
- **Completed:** 2026-04-23T16:35:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced all hardcoded transition durations in globals.css with --duration-* tokens
- Migrated 13 app-specific @keyframes from globals.css to motion.css
- Updated 11 animation declarations to use tokenized durations
- Removed deprecated --transition-fast, --transition-normal, --transition-slow from :root
- Preserved exceptions: skeleton-shimmer 1.4s, button active 60ms, cubic-bezier custom easings

## Task Commits

1. **Task 1: Migrate all transition declarations to motion tokens** — part of `e94abd1` (feat)
2. **Task 2: Migrate keyframes to motion.css and update animation declarations** — part of `e94abd1` (feat)

## Files Created/Modified
- `src/app/globals.css` — Zero hardcoded durations; all transitions use tokens; zero @keyframes; deprecated tokens removed
- `src/styles/motion.css` — Added 13 app-specific keyframes (skeleton-shimmer, vaultPageIn, spin, toastSlideIn, fabEnter, searchDropdownIn, badgeDotPulse, tabFadeIn, kbdFadeIn, notifDropdownIn, sidePanelFadeIn, sidePanelSlideIn, popoverFadeIn)

## Decisions Made
- Used exact string replacement for animation declarations to avoid regex pitfalls
- Script-based bulk replacement for transitions with careful exception handling
- 150ms → --duration-200 (closest canonical token) per D-02 granularity decision

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed script regex that corrupted token definitions**
- **Found during:** Task 1
- **Issue:** First migration script replaced durations inside :root token definitions, creating circular references like `--duration-100: var(--duration-100)`
- **Fix:** Restored files from git, rewrote script to remove deprecated tokens BEFORE applying transition replacements, and added :root block skipping
- **Verification:** Verified tokens remained intact after second script run
- **Committed in:** e94abd1 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed keyframe extraction regex that broke keyframe blocks**
- **Found during:** Task 2
- **Issue:** First script's regex `[╠s\S]*?\}` stopped at first `}` (inside keyframe rule), cutting off closing braces and corrupting both globals.css and motion.css
- **Fix:** Restored files, used improved regex `/@keyframes\s+[\w-]+\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g` that properly matches nested `{...}` pairs inside keyframes
- **Verification:** Confirmed all 13 keyframes intact with proper closing braces in motion.css, zero remaining in globals.css
- **Committed in:** e94abd1 (Task 2 commit)

**3. [Rule 1 - Bug] Fixed transition replacement missing comma-separated durations**
- **Found during:** Task 1 verification
- **Issue:** Regex lookahead `(?=[ ;}])` missed durations followed by comma in multi-property transitions like `transition: background 0.12s, color 0.12s;`
- **Fix:** Changed lookahead to `(?=[ ;},])` to include comma
- **Verification:** Confirmed `transition: background var(--duration-100), color var(--duration-100);`
- **Committed in:** e94abd1 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 1 - bugs)
**Impact on plan:** All fixes necessary for correctness. No scope creep.

## Issues Encountered
- PowerShell string escaping interfered with `node -e` regex testing; resolved by writing test scripts to files
- CRLF line endings in motion.css caused regex insertion failures; resolved with `indexOf`-based insertion

## Next Phase Readiness
- Migration complete, ready for Plan 03 accessibility audit and verification
- All motion consolidated in tokens — downstream phases can use utilities or tokens directly

---
*Phase: 32-motion-tokens-foundation-css*
*Completed: 2026-04-23*
