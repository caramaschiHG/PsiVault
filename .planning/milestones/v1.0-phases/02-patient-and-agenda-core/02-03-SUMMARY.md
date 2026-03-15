---
phase: 02-patient-and-agenda-core
plan: 03
subsystem: ui
tags: [agenda, appointments, view-model, patient-summary, scheduling, next-session, tdd]

# Dependency graph
requires:
  - phase: 02-02
    provides: appointment occurrence domain with lifecycle statuses, conflict rules, recurrence, and audited mutations
  - phase: 02-01
    provides: patient model, patient repository, and operational summary contract
  - phase: 01-02
    provides: practice profile defaults (duration, price, service modes) used for next-session prefill

provides:
  - Agenda view-model layer (AgendaCard, deriveDayAgenda, deriveWeekAgenda) with privacy-safe card derivation and pt-BR labels
  - Daily-first agenda route with day/week view switching via search params
  - AgendaToolbar, AgendaDayView, AgendaWeekView, AppointmentCard reusable components
  - CompletedAppointmentNextSessionAction component — post-session rebooking entry point
  - deriveNextSessionDefaults — shared prefill contract (last-appt > profile) for quick next-session
  - derivePatientSummaryFromAppointments — scheduling-derived lastSession, nextSession, pendingItemsCount
  - QuickNextSessionCard — patient-profile entry point for rapid next-session creation
  - Updated patient profile page wiring all the above together

affects:
  - 03-clinical-record-core
  - 05-finance-assisted-ops
  - 06-retrieval-recovery-polish

# Tech tracking
tech-stack:
  added: []
  patterns:
    - view-model derivation in lib layer consumed by UI (no scheduling logic in components)
    - privacy-safe agenda card: only operational fields exposed, patient name resolved by caller
    - quick next-session via query params — prefill without silent slot assumption
    - scheduling-backed patient summary via structural subset type to avoid circular dependency
    - UTC midnight as day anchor; Intl.DateTimeFormat for local appointment bucketing

key-files:
  created:
    - src/lib/appointments/agenda.ts
    - src/lib/appointments/defaults.ts
    - src/app/(vault)/agenda/page.tsx
    - src/app/(vault)/agenda/components/agenda-toolbar.tsx
    - src/app/(vault)/agenda/components/agenda-day-view.tsx
    - src/app/(vault)/agenda/components/agenda-week-view.tsx
    - src/app/(vault)/agenda/components/appointment-card.tsx
    - src/app/(vault)/agenda/components/completed-appointment-next-session-action.tsx
    - src/app/(vault)/patients/[patientId]/components/quick-next-session-card.tsx
    - tests/agenda-view-model.test.ts
    - tests/appointment-defaults.test.ts
  modified:
    - src/lib/patients/summary.ts
    - src/app/(vault)/patients/[patientId]/page.tsx
    - tests/patient-summary.test.ts

key-decisions:
  - "AgendaCard uses Intl.DateTimeFormat with UTC midnight day anchors so appointments are bucketed into the correct local calendar day regardless of UTC offset"
  - "quick next-session defaults never include date/time — the professional must choose the new slot intentionally to avoid silent scheduling assumptions"
  - "derivePatientSummaryFromAppointments uses AppointmentForSummary structural subset instead of importing Appointment directly — avoids circular dependency between patient and appointment domains"
  - "pendingItemsCount = count of future SCHEDULED appointments (needs confirmation) — actionable scheduling pendency, not a broad catch-all"
  - "AgendaCard is privacy-safe: no clinical notes, no importantObservations — patient name resolved from patientId by the parent caller"

patterns-established:
  - "View-model derivation pattern: lib layer derives stable card contract, UI consumes it — both day and week views share the same AgendaCard"
  - "Quick next-session pattern: shared defaults initializer with precedence (last appt > profile), wired from both patient-context and completed-appointment context"
  - "Scheduling hydration pattern: patient summary optionally receives appointment data via derivePatientSummaryFromAppointments without changing the output shape"

requirements-completed: [PATI-03, SCHD-05, SCHD-07]

# Metrics
duration: 7min
completed: 2026-03-13
---

# Phase 2 Plan 3: Agenda Views and Quick Next-Session Summary

**Day/week agenda views with privacy-safe appointment cards derived from occurrence domain, plus scheduling-hydrated patient summary and shared quick next-session prefill from last appointment or practice profile defaults**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-13T23:28:59Z
- **Completed:** 2026-03-13T23:35:52Z
- **Tasks:** 3 (all TDD or UI)
- **Files modified:** 12

## Accomplishments

- Agenda view-model layer: privacy-safe AgendaCard with pt-BR status and care-mode labels, day ordering, week grouping with Intl-based timezone-aware day bucketing
- Daily-first agenda route (`/agenda`) with day/week switch, date navigation, and stateless search-param-driven URLs; appointment cards show status chip + care-mode chip (icon + label)
- Scheduling-backed patient summary: real `lastSession`, `nextSession`, and `pendingItemsCount` from appointment occurrences; quick next-session entry points from both patient profile and completed-appointment context using the same shared defaults contract

## Task Commits

Each task was committed atomically:

1. **Task 1: Derive day and week agenda view models** - `60aebad` (feat, TDD)
2. **Task 2: Build the daily-first agenda UI and reusable appointment cards** - `86a54f5` (feat)
3. **Task 3: Hydrate patient summary and wire quick next-session entry points** - `5a0b38c` (feat, TDD)

## Files Created/Modified

- `src/lib/appointments/agenda.ts` — AgendaCard type, deriveAgendaCard, deriveDayAgenda, deriveWeekAgenda with timezone-aware bucketing
- `src/lib/appointments/defaults.ts` — NextSessionDefaults contract and deriveNextSessionDefaults with last-appt > profile precedence
- `src/lib/patients/summary.ts` — Added AppointmentForSummary and derivePatientSummaryFromAppointments for scheduling hydration
- `src/app/(vault)/agenda/page.tsx` — Daily-first agenda route with search-param navigation
- `src/app/(vault)/agenda/components/agenda-toolbar.tsx` — Day/week switcher, date navigation, today shortcut
- `src/app/(vault)/agenda/components/agenda-day-view.tsx` — Ordered day card list with empty state
- `src/app/(vault)/agenda/components/agenda-week-view.tsx` — 7-column week layout with today highlight
- `src/app/(vault)/agenda/components/appointment-card.tsx` — Reusable block: time, status chip, care-mode chip
- `src/app/(vault)/agenda/components/completed-appointment-next-session-action.tsx` — Post-session rebooking link with defaults prefilled in query params
- `src/app/(vault)/patients/[patientId]/components/quick-next-session-card.tsx` — Patient-context entry point showing prefill preview
- `src/app/(vault)/patients/[patientId]/page.tsx` — Updated to use scheduling-derived summary and quick next-session card
- `tests/agenda-view-model.test.ts` — 10 tests: card derivation, day filtering/ordering, week grouping
- `tests/appointment-defaults.test.ts` — 5 tests: precedence rules, no-date guarantee
- `tests/patient-summary.test.ts` — 5 new scheduling hydration tests added (18 total)

## Decisions Made

- UTC midnight as day anchor + `Intl.DateTimeFormat` for local appointment bucketing — handles timezone boundaries correctly without relying on server TZ environment variable.
- Structural subset type `AppointmentForSummary` in `summary.ts` instead of importing from appointments domain — avoids circular dependency cleanly.
- `pendingItemsCount` = future SCHEDULED count only (needs confirmation) — most actionable scheduling pendency before finance domain provides richer data.
- Date/time intentionally absent from `NextSessionDefaults` — the professional must pick the new slot to maintain explicit scheduling posture established in Phase 2 context.

## Deviations from Plan

None — plan executed exactly as written. The `defaults.ts` file was created during Task 2 (needed by the completed-appointment action component) rather than Task 3, but this is a sequencing convenience with no functional impact.

## Issues Encountered

One bug found and fixed inline during TDD GREEN phase: the initial `isSameLocalDate` implementation compared both the appointment `startsAt` and the `date` parameter in the given timezone, but the `date` parameter (passed as UTC midnight) was rendering as the previous calendar day in São Paulo (UTC-3). Fixed by treating `date` as a UTC-based day anchor — its UTC year/month/day define the target, while appointment times are still bucketed using the timezone. All 10 tests passed after the fix.

## Next Phase Readiness

- Agenda and patient profile surfaces are ready for Phase 3 (clinical record core) to add session notes linkage
- `derivePatientSummaryFromAppointments` accepts an optional `documentCount` so Phase 4 (document vault) can slot in without changing the output shape
- `priceInCents` in `LastAppointmentContext` currently returns `null` (finance domain not yet available); Phase 5 will populate it without API changes

## Self-Check: PASSED

- All 12 created/modified files verified present on disk
- Task commits `60aebad`, `86a54f5`, `5a0b38c` verified in git log
- All 95 tests across 9 test files pass
- Final metadata commit `572c6b8` verified

---
*Phase: 02-patient-and-agenda-core*
*Completed: 2026-03-13*
