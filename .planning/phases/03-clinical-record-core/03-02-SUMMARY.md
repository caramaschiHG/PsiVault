---
phase: 03-clinical-record-core
plan: "02"
subsystem: ui
tags: [next.js, react, server-actions, clinical-notes, forms]

requires:
  - phase: 03-01
    provides: ClinicalNote model, ClinicalNoteRepository, getClinicalNoteRepository(), createClinicalNoteAuditEvent, deriveSessionNumber

provides:
  - "createNoteAction and updateNoteAction server actions at /sessions/[appointmentId]/actions.ts"
  - "Note composer server page at /sessions/[appointmentId]/note/page.tsx (404 guard for non-COMPLETED appointments)"
  - "NoteComposerForm client component with dirty-state tracking and unsaved-draft guard"
  - "Agenda card integration: COMPLETED cards show Registrar evolução / Ver evolução links"

affects:
  - 03-clinical-record-core
  - 04-document-vault
  - 06-retrieval-recovery-polish

tech-stack:
  added: []
  patterns:
    - "Server actions following appointments/actions.ts pattern: use server, globalThis audit repo, nullCoerce for FormData empty strings"
    - "Server page guards non-COMPLETED appointment with notFound(); passes server actions as props to client form"
    - "Client form uses isDirty state + beforeunload + window.confirm for unsaved-draft guard"
    - "Agenda page merges two ReactNode actions into nextSessionActions slot via React.Fragment to avoid view component changes"

key-files:
  created:
    - src/app/(vault)/sessions/[appointmentId]/actions.ts
    - src/app/(vault)/sessions/[appointmentId]/note/page.tsx
    - src/app/(vault)/sessions/[appointmentId]/note/components/note-composer-form.tsx
  modified:
    - src/app/(vault)/agenda/page.tsx

key-decisions:
  - "Server actions passed as props to client NoteComposerForm to keep the action file path collocated with the route, not embedded in the component"
  - "nullCoerce helper converts blank textarea strings to null matching SECU-05 contract (empty string = not filled = null)"
  - "Note actions merged into existing nextSessionActions slot via React.Fragment — avoids touching AgendaDayView/AgendaWeekView/AppointmentCard component signatures"
  - "registerNoteStyle uses blue tint (COMPLETED color palette) and viewNoteStyle uses green tint for visual distinction"

patterns-established:
  - "Pattern: nullCoerce(FormDataEntryValue | null): string | null — standard null coercion for optional clinical form fields"
  - "Pattern: isDirty + beforeunload + window.confirm for unsaved-draft guard in clinical forms"
  - "Pattern: Server page loads all data and passes as props to client form component (no client-side data fetching)"

requirements-completed: [CLIN-01, CLIN-02, CLIN-03, CLIN-04]

duration: 4min
completed: 2026-03-14
---

# Phase 03 Plan 02: Session Note Entry Flow Summary

**Full-page note composer at /sessions/[appointmentId]/note with create/update server actions and agenda card "Registrar evolução" / "Ver evolução" entry points**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-14T10:50:12Z
- **Completed:** 2026-03-14T10:53:23Z
- **Tasks:** 3 of 3 (checkpoint pending human verification)
- **Files modified:** 4

## Accomplishments

- createNoteAction and updateNoteAction server actions with SECU-05-compliant audit metadata, null coercion for blank structured fields, and appointment-COMPLETED guard
- Note composer server page at /sessions/[appointmentId]/note with notFound() guard for non-COMPLETED appointments, read-only session header (Sessão N, date, care mode, duration), and NoteComposerForm client component
- NoteComposerForm with isDirty state, beforeunload guard, in-app cancel confirm dialog, freeText primary textarea, and five optional structured fields all in pt-BR
- Agenda integration: COMPLETED appointment cards now show "Registrar evolução" (blue tint) when no note exists and "Ver evolução" (green tint) when a note already exists, both linking to /sessions/[appointmentId]/note

## Task Commits

Each task was committed atomically:

1. **Task 1: Server actions for note create and update** - `ac4ab2c` (feat)
2. **Task 2: Note composer page and client form component** - `94b4f0f` (feat)
3. **Task 3: Agenda card integration** - `0f080ea` (feat)

## Files Created/Modified

- `src/app/(vault)/sessions/[appointmentId]/actions.ts` - createNoteAction and updateNoteAction server actions
- `src/app/(vault)/sessions/[appointmentId]/note/page.tsx` - Note composer server page with 404 guard and session header
- `src/app/(vault)/sessions/[appointmentId]/note/components/note-composer-form.tsx` - Client form with isDirty guard and five optional structured fields
- `src/app/(vault)/agenda/page.tsx` - getClinicalNoteRepository import, notedAppointmentIds Set, note entry point merged into nextSessionActions

## Decisions Made

- Server actions passed as props (createAction, updateAction) to NoteComposerForm so the action file stays collocated with the route and the form component remains reusable
- nullCoerce helper applied to all structured fields — empty textarea string = not filled = null, matching the SECU-05 data contract from Plan 01
- Note entry points merged into the existing nextSessionActions React.Fragment in agenda page — avoids touching AgendaDayView, AgendaWeekView, and AppointmentCard component signatures (zero component signature changes)
- Distinct visual styles: registerNoteStyle (blue tint, COMPLETED palette) vs viewNoteStyle (green tint, CONFIRMED palette) for clear affordance

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Clinical note composer flow is complete: create, update, and read (via pre-populated form) are fully functional
- Checkpoint human-verify is pending to confirm the full end-to-end flow works in the browser
- Plan 03 (patient profile integration) can proceed once checkpoint is approved
- All 113 unit tests pass with no regressions

---
*Phase: 03-clinical-record-core*
*Completed: 2026-03-14*
