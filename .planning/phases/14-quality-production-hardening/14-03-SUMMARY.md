---
phase: 14-quality-production-hardening
plan: "03"
subsystem: api
tags: [error-handling, server-actions, nextjs, try-catch, prisma]

# Dependency graph
requires:
  - phase: 10-clinical-document-persistence
    provides: document and clinical note server actions
  - phase: 11-finance-ops-persistence
    provides: appointment and finance server actions
provides:
  - All 16+ mutation server actions wrapped in try/catch with safe error responses
  - redirect() calls moved outside try blocks (NEXT_REDIRECT not captured)
  - Uniform error response pattern: { ok: false, error: "Algo deu errado. Tente novamente." }
affects: [14-quality-production-hardening, production-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns: [try/catch catch-all in server actions, flag-variable redirect pattern]

key-files:
  created: []
  modified:
    - src/app/(vault)/patients/actions.ts
    - src/app/(vault)/appointments/actions.ts
    - src/app/(vault)/sessions/[appointmentId]/actions.ts
    - src/app/(vault)/patients/[patientId]/documents/new/actions.ts
    - src/app/(vault)/patients/[patientId]/documents/[documentId]/actions.ts
    - src/app/(vault)/patients/[patientId]/documents/[documentId]/edit/actions.ts

key-decisions:
  - "Flag variable pattern (redirectPath/shouldRedirect) used to move redirect() outside try blocks — avoids NEXT_REDIRECT being swallowed by catch"
  - "console.error logs only [actionName] + err object — never clinical, financial, or patient data (SECU-05)"
  - "Guard redirects (not found) also moved outside try using flag variables (guardRedirect) to maintain consistent pattern"

patterns-established:
  - "Flag variable redirect pattern: set shouldRedirect=true inside try, call redirect() after try/catch block"
  - "Catch-all error response: console.error('[actionName]', err) then return { ok: false, error: 'Algo deu errado. Tente novamente.' }"
  - "revalidatePath() safe outside try — does not throw NEXT_REDIRECT, but moved outside for consistency"

requirements-completed: [QUAL-03]

# Metrics
duration: 3min
completed: 2026-03-18
---

# Phase 14 Plan 03: Server Actions Error Handling Summary

**try/catch catch-all added to all 16+ mutation server actions with redirect() moved outside try blocks using flag variables**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-18T15:19:33Z
- **Completed:** 2026-03-18T15:23:10Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- All 4 patient actions (create, update, archive, recover) wrapped in try/catch
- All 2 session/note actions (createNote, updateNote) wrapped in try/catch
- All 10 appointment/charge/series actions wrapped in try/catch
- All 3 document actions (create, archive, update) wrapped in try/catch
- Uniform catch response pattern applied: `{ ok: false, error: "Algo deu errado. Tente novamente." }`
- redirect() calls in all 6 files moved outside try blocks using flag variables

## Task Commits

Each task was committed atomically:

1. **Task 1: patients/actions.ts + sessions/actions.ts** - `399c614` (feat)
2. **Task 2: appointments/actions.ts + document actions** - `8fdaf96` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/app/(vault)/patients/actions.ts` - 4 functions wrapped: createPatientAction, updatePatientAction, archivePatientAction, recoverPatientAction
- `src/app/(vault)/sessions/[appointmentId]/actions.ts` - 2 functions wrapped: createNoteAction, updateNoteAction
- `src/app/(vault)/appointments/actions.ts` - 10 functions wrapped: createAppointmentAction, rescheduleAppointmentAction, cancelAppointmentAction, confirmAppointmentAction, completeAppointmentAction, noShowAppointmentAction, updateChargeAction, editMeetingLinkAction, addRemoteIssueNoteAction, editSeriesAction
- `src/app/(vault)/patients/[patientId]/documents/new/actions.ts` - 1 function: createDocumentAction
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/actions.ts` - 1 function: archiveDocumentAction
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/edit/actions.ts` - 1 function: updateDocumentAction

## Decisions Made
- Flag variable pattern chosen over try/catch-rethrow: `shouldRedirect = true` inside try, `if (shouldRedirect) redirect()` after catch block. This is the cleanest solution to the NEXT_REDIRECT pitfall without restructuring action logic.
- Guard redirects (not-found early exits) also moved outside try using separate `guardRedirect` or `notFoundRedirect` flags — consistent pattern throughout.
- `console.error` logs `[actionName]` + raw error object only — zero domain data (SECU-05 compliant).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing test failure in `tests/auth-session.test.ts` (model Session in Prisma schema) is out of scope for this plan and unrelated to actions. Logged as deferred item.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All server actions now have safe error handling — Prisma/infrastructure errors won't crash pages or expose stack traces
- Ready for QUAL-04 (next hardening task in phase 14)

---
*Phase: 14-quality-production-hardening*
*Completed: 2026-03-18*
