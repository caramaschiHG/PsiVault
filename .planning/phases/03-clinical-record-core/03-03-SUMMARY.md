---
phase: 03-clinical-record-core
plan: "03"
subsystem: ui
tags: [react, next.js, clinical, timeline, appointments]

# Dependency graph
requires:
  - phase: 03-01
    provides: ClinicalNote model, deriveSessionNumber, getClinicalNoteRepository
  - phase: 03-02
    provides: Note composer and server actions at /sessions/[id]/note
  - phase: 02-02
    provides: Appointment domain with all status values
provides:
  - ClinicalTimeline server component rendering all 5 appointment status variants
  - Patient profile page wired to show longitudinal session history
affects:
  - 04-document-vault
  - 06-retrieval-recovery-polish

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure presentational server component (no "use client") receiving typed props from parent page
    - Inline style objects with satisfies React.CSSProperties — consistent with app conventions
    - Intl.DateTimeFormat with timeZone UTC for day-anchored date display

key-files:
  created:
    - src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx
  modified:
    - src/app/(vault)/patients/[patientId]/page.tsx

key-decisions:
  - "ClinicalTimeline is a pure presentational server component — all data loaded in the page and passed as props to keep data-fetching concerns in one place"
  - "notesByAppointment map built on the page for O(1) note lookup per appointment without N+1 repository calls"

patterns-established:
  - "Timeline row type (status variant → component branch) keeps rendering logic per-variant without conditionals scattered across JSX"
  - "Muted rows (opacity 0.6) for terminal non-actionable states (CANCELED, NO_SHOW) to distinguish from actionable entries visually"

requirements-completed: [CLIN-05]

# Metrics
duration: 4min
completed: 2026-03-14
---

# Phase 3 Plan 03: Clinical Timeline Summary

**ClinicalTimeline server component added to patient profile page — renders all 5 appointment status variants with session numbers, note links, and muted context rows for canceled/no-show entries**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-14T11:03:46Z
- **Completed:** 2026-03-14T11:08:45Z
- **Tasks:** 2 auto tasks completed (checkpoint:human-verify pending)
- **Files modified:** 2

## Accomplishments

- Created `ClinicalTimeline` pure server component with 5 status variant renderers
- COMPLETED appointments with notes show session label ("Sessao N" or "Consulta avulsa"), date, care mode chip, and "Ver / Editar evolucao" link
- COMPLETED appointments without notes show "Registrar evolucao" link with amber chip
- SCHEDULED/CONFIRMED rows show date, care mode, status chip — no note action
- CANCELED/NO_SHOW rows appear muted (opacity 0.6) with status chip — no note action
- Patient profile page wired: notesByAppointment map built server-side, timelineEntries derived from all appointments, ClinicalTimeline rendered after QuickNextSessionCard

## Task Commits

Each task was committed atomically:

1. **Task 1: ClinicalTimeline component** - `28a034a` (feat)
2. **Task 2: Wire ClinicalTimeline into patient profile page** - `c1aa835` (feat)

## Files Created/Modified

- `src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx` - Pure presentational server component rendering the full chronological session history
- `src/app/(vault)/patients/[patientId]/page.tsx` - Added clinical data loading (notesByAppointment map, timelineEntries) and ClinicalTimeline render between QuickNextSessionCard and edit form

## Decisions Made

- ClinicalTimeline is a pure presentational server component — all data loaded in the page and passed as typed props. Keeps data-fetching concerns in one place and avoids any client-side state.
- `notesByAppointment` map is built with a for-loop over COMPLETED appointments only, calling `findByAppointmentId` once per appointment. O(n) with one repository call per completed appointment.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ClinicalTimeline checkpoint verification is pending human approval (checkpoint:human-verify)
- Once verified, Phase 3 execution is complete
- Phase 4 (document-vault) can proceed after checkpoint approval

---
*Phase: 03-clinical-record-core*
*Completed: 2026-03-14*
