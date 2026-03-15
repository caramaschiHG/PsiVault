---
phase: 02-patient-and-agenda-core
plan: "04"
subsystem: ui
tags: [next.js, app-router, scheduling, agenda, appointments]

# Dependency graph
requires:
  - phase: 02-patient-and-agenda-core plan 02
    provides: appointment model, repository, deriveNextSessionDefaults, CompletedAppointmentNextSessionAction (orphaned)
  - phase: 02-patient-and-agenda-core plan 03
    provides: AgendaDayView/AgendaWeekView with nextSessionActions slots, QuickNextSessionCard linking to /appointments/new
provides:
  - Mounted Next.js App Router page at /appointments/new with query-param prefill
  - Wired CompletedAppointmentNextSessionAction into AgendaDayView and AgendaWeekView via nextSessionActions map
  - SCHD-07 fully satisfied end-to-end — both entry points resolve to a real page
affects: [03-clinical-record-core, 05-finance-assisted-ops]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Query-param prefill pattern: page reads searchParams defensively (parseInt/trim/validate), falls back to practice profile defaults
    - nextSessionActions map pattern: server component builds Record<string, React.ReactNode> keyed by appointmentId, passed to view components

key-files:
  created:
    - src/app/(vault)/appointments/new/page.tsx
  modified:
    - src/app/(vault)/agenda/page.tsx

key-decisions:
  - "priceInCents URL param is parsed and reserved but NOT passed to AppointmentForm — finance domain arrives in Phase 5"
  - "nextSessionActions map built server-side in agenda/page.tsx and passed as prop — keeps agenda view components free of data-fetching concerns"

patterns-established:
  - "Query-param prefill: parseInt with isFinite+positive guard for integers; trim+length check for strings; explicit enum validation for care mode"
  - "ACCOUNT_ID stub added alongside WORKSPACE_ID when practice profile is needed — consistent pattern across vault pages"

requirements-completed: [SCHD-07]

# Metrics
duration: 12min
completed: 2026-03-14
---

# Phase 02 Plan 04: Quick Next-Session Gap Closure Summary

**Closed two routing gaps blocking SCHD-07: created /appointments/new page with query-param prefill and wired the orphaned CompletedAppointmentNextSessionAction into both agenda day and week views.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-13T23:52:11Z
- **Completed:** 2026-03-14T00:04:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Gap 1 closed: `/appointments/new` now mounts a real page that reads `patientId`, `durationMinutes`, `careMode` from searchParams with safe fallbacks to practice profile defaults — links from QuickNextSessionCard and CompletedAppointmentNextSessionAction no longer 404.
- Gap 2 closed: `agenda/page.tsx` now imports and renders `CompletedAppointmentNextSessionAction` for every COMPLETED appointment card in both day and week views — the orphaned component is fully wired.
- SCHD-07 fully satisfied: professional can create the next session quickly from patient profile context and from completed-appointment context in the agenda.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create /appointments/new page** - `36f3559` (feat)
2. **Task 2: Wire CompletedAppointmentNextSessionAction into agenda page** - `3cb7054` (feat)

## Files Created/Modified

- `src/app/(vault)/appointments/new/page.tsx` — New page; reads searchParams, resolves prefill defaults, renders AppointmentForm with heading row + breadcrumb back to /agenda
- `src/app/(vault)/agenda/page.tsx` — Added 3 imports, ACCOUNT_ID stub, profile load, nextSessionActions map construction for COMPLETED appointments, passes prop to both view components

## Decisions Made

- `priceInCents` URL param is intentionally not forwarded to `AppointmentForm` — the form has no such prop and the price domain arrives in Phase 5. The param is parsed and silently reserved for that future plan.
- `nextSessionActions` map is built entirely server-side in `agenda/page.tsx` rather than in the view components — this keeps `AgendaDayView` and `AgendaWeekView` presentational and free of data-fetching concerns.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. 25 pre-existing TypeScript errors exist in the test suite (unrelated to this plan's scope); zero new errors introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- SCHD-07 is complete. Both quick next-session entry points (patient profile + completed appointment) reach the booking form with all prefill applied.
- Phase 3 (clinical record core) can proceed — the appointment booking surface is stable.
- Phase 5 (finance/ops) will extend `/appointments/new` to handle `priceInCents` when the finance domain ships.

---
*Phase: 02-patient-and-agenda-core*
*Completed: 2026-03-14*
