---
phase: 45-calm-ux-modo-foco-tipografia
plan: 01
subsystem: ui
tags: [react-context, keyboard-shortcuts, css-transitions, prefers-reduced-motion]

requires:
  - phase: 44
    provides: Documentos e agenda foundation
provides:
  - FocusModeContext with useFocusMode hook
  - Ctrl/Cmd+Shift+F keyboard shortcut via KeyboardShortcutsProvider
  - CSS transitions for sidebar and top-bar hide/show
  - prefers-reduced-motion support for focus mode
  - VaultLayout wired with FocusModeProvider and FocusModeShell
affects:
  - 45-02
  - note-composer-form
  - document-composer-form
  - rich-text-editor

tech-stack:
  added: []
  patterns:
    - "Client-only UI state via React Context (no persistence)"
    - "CSS attribute selector [data-focus-mode] for global UI state"
    - "KeyboardShortcutsProvider as centralized shortcut handler"

key-files:
  created:
    - src/app/(vault)/components/focus-mode-context.tsx
    - src/app/(vault)/components/focus-mode-shell.tsx
  modified:
    - src/app/(vault)/components/keyboard-shortcuts-provider.tsx
    - src/app/(vault)/layout.tsx
    - src/app/globals.css

key-decisions:
  - "Focus mode state is ephemeral (useState only, no localStorage/cookies) per D-09"
  - "FocusModeProvider wraps KeyboardShortcutsProvider so后者 can consume useFocusMode"
  - "FocusModeShell is a separate client component to avoid marking VaultLayout as use client"
  - "CSS uses [data-focus-mode=\"true\"] attribute selector rather than class for specificity"

patterns-established:
  - "Context + Shell pattern: provider manages state, shell component applies CSS-targetable attribute"
  - "Keyboard shortcut extension: add new shortcuts to existing KeyboardShortcutsProvider without local hooks"

requirements-completed:
  - CALM-01

duration: 8min
completed: 2026-04-27
---

# Phase 45 Plan 01: Focus Mode Core Infrastructure Summary

**Focus mode state management with Ctrl/Cmd+Shift+F shortcut, CSS transitions for sidebar/top-bar, and VaultLayout wiring via React Context**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-27T17:14:29Z
- **Completed:** 2026-04-27T17:22:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created FocusModeContext with useFocusMode hook (throws outside provider)
- Extended KeyboardShortcutsProvider with Ctrl/Cmd+Shift+F toggle
- Added CSS transitions (200ms ease-out) for sidebar translateX(-100%) and top-bar translateY(-100%)
- Added .focus-mode-hideable utility class for conditional element hiding
- Wired VaultLayout with FocusModeProvider → KeyboardShortcutsProvider → FocusModeShell
- Added prefers-reduced-motion override disabling all focus mode transitions

## Task Commits

1. **Task 1: Create FocusModeContext and extend keyboard shortcuts** - `7fbb49f` (feat)
2. **Task 2: Add focus mode CSS rules and wire VaultLayout** - `924e55f` (feat)

## Files Created/Modified
- `src/app/(vault)/components/focus-mode-context.tsx` - React context with focusMode boolean, toggleFocusMode, setFocusMode
- `src/app/(vault)/components/focus-mode-shell.tsx` - Client component applying data-focus-mode attribute to shell div
- `src/app/(vault)/components/keyboard-shortcuts-provider.tsx` - Added Ctrl/Cmd+Shift+F shortcut handler
- `src/app/(vault)/layout.tsx` - Wrapped with FocusModeProvider, FocusModeShell, and vault-top-bar-wrapper
- `src/app/globals.css` - Focus mode CSS rules with transitions and prefers-reduced-motion

## Decisions Made
- Focus mode state is ephemeral (no persistence) — resets on page reload per D-09
- FocusModeProvider wraps KeyboardShortcutsProvider so the latter can call useFocusMode()
- FocusModeShell is a separate "use client" file to keep VaultLayout as a Server Component
- Toasts and bottom nav are NOT targeted by focus mode CSS (remain visible per D-02/D-03)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Focus mode infrastructure is ready for editor integration in Plan 45-02
- All downstream components can consume useFocusMode() hook

---
*Phase: 45-calm-ux-modo-foco-tipografia*
*Completed: 2026-04-27*
