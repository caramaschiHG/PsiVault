---
phase: 05-finance-and-assisted-operations
plan: 03
subsystem: ui
tags: [communication, whatsapp, mailto, online-care, server-actions, react, next]

# Dependency graph
requires:
  - phase: 05-01
    provides: updateAppointmentOnlineCare domain function, communication templates, meetingLink/remoteIssueNote fields on Appointment
  - phase: 05-02
    provides: server action patterns, revalidatePath usage conventions, finance surface patterns

provides:
  - editMeetingLinkAction server action (ONLN-01) guarded to ONLINE appointments
  - addRemoteIssueNoteAction server action (ONLN-03) with careMode guard delegated to domain
  - Agenda appointment cards: ONLINE care fields (meetingLink form, Abrir link anchor, remoteIssueNote form)
  - All agenda cards: Comunicacao section with COMM-01 (lembrete) and COMM-02 (reagendamento) WhatsApp/email links
  - ClinicalTimeline: ComunicacaoGroup per entry with COMM-01/COMM-02 deep links
  - DocumentsSection: Enviar disclosure per document with COMM-03 WhatsApp/email deep links
  - appointment.updated audit event type added to AppointmentAuditEventType union

affects: [06-retrieval-recovery-polish, future-communication-enhancements]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Communication deep links built server-side from template builders and rendered as plain <a target="_blank"> elements — no server round-trip for COMM surfaces
    - ONLINE care forms use server actions (editMeetingLinkAction, addRemoteIssueNoteAction) wired directly via form action prop
    - ComunicacaoGroup is a pure server component receiving patientName and patientPhone as props — phone never exposed in list surfaces (SECU-05)

key-files:
  created: []
  modified:
    - src/app/(vault)/appointments/actions.ts
    - src/lib/appointments/audit.ts
    - src/app/(vault)/agenda/page.tsx
    - src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx
    - src/app/(vault)/patients/[patientId]/components/documents-section.tsx
    - src/app/(vault)/patients/[patientId]/page.tsx

key-decisions:
  - "ONLINE care fields (meetingLink form + remoteIssueNote) rendered for all appointment statuses — not just SCHEDULED/CONFIRMED — so professionals can update links on completed sessions too"
  - "professionalName excluded from DocumentsSection props: actual templates.ts DocumentDeliveryMessageContext does not include it; kept the interface minimal matching the real contract"
  - "appointment.updated added to AppointmentAuditEventType union to support the two new server actions — least-invasive extension of the existing audit type contract"
  - "ComunicacaoGroup built entirely server-side inside ClinicalTimeline using Intl.DateTimeFormat with America/Sao_Paulo timezone — consistent with agenda page pattern"

patterns-established:
  - "Communication link sections always use <a target='_blank' rel='noreferrer'> — never forms or server actions"
  - "Comunicacao group appears on all appointment entries regardless of status or care mode"
  - "ONLINE section (meetingLink + remoteIssueNote) appears on all appointment statuses to allow post-session link updates"

requirements-completed: [ONLN-01, ONLN-02, ONLN-03, COMM-01, COMM-02, COMM-03]

# Metrics
duration: 25min
completed: 2026-03-14
---

# Phase 5 Plan 03: Online Care Fields and Assisted Communication Deep Links Summary

**ONLINE meeting link form, remote issue note form, and prefilled WhatsApp/email deep links (reminder, reschedule, document delivery) wired into agenda cards, clinical timeline, and DocumentsSection — closes ONLN-01/02/03 and COMM-01/02/03**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-14T23:12:34Z
- **Completed:** 2026-03-14T23:37:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Added `editMeetingLinkAction` and `addRemoteIssueNoteAction` server actions with proper guards and audit events
- Extended agenda page to show ONLINE care fields and Comunicacao section for every appointment card
- Added `ComunicacaoGroup` to clinical timeline entries with COMM-01/COMM-02 deep links
- Added Enviar disclosure per document in DocumentsSection with COMM-03 WhatsApp/email links

## Task Commits

Each task was committed atomically:

1. **Task 1: Add server actions for online care** - `649bdfe` (feat)
2. **Task 2: Wire online care and communication into all UI surfaces** - `a1baab1` (feat)

## Files Created/Modified
- `src/app/(vault)/appointments/actions.ts` - Added editMeetingLinkAction and addRemoteIssueNoteAction server actions; imported updateAppointmentOnlineCare
- `src/lib/appointments/audit.ts` - Extended AppointmentAuditEventType with "appointment.updated" and added its AUDIT_SUMMARIES entry
- `src/app/(vault)/agenda/page.tsx` - Extended nextSessionActions loop to cover all appointments with ONLINE fields and Comunicacao section; imported communication template builders and new server actions
- `src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx` - Added ComunicacaoGroup server component; extended props with patientName/patientPhone; passed comm props to all card variants
- `src/app/(vault)/patients/[patientId]/components/documents-section.tsx` - Added Enviar disclosure with COMM-03 WhatsApp/email deep links per document; extended props with patientName/patientPhone
- `src/app/(vault)/patients/[patientId]/page.tsx` - Passed patientName and patient.phone to ClinicalTimeline and DocumentsSection

## Decisions Made
- ONLINE care fields rendered for all appointment statuses (not just future ones) — professionals may need to update a meeting link even after the session
- `professionalName` excluded from DocumentsSection props because `DocumentDeliveryMessageContext` in templates.ts does not include it — kept the interface honest to the actual contract
- `appointment.updated` added as a new audit event type to support the meetingLink/remoteIssueNote server actions without overloading an existing type
- Comunicacao section placed for ALL appointment statuses (SCHEDULED, CONFIRMED, COMPLETED, CANCELED, NO_SHOW) per plan spec

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added "appointment.updated" to AppointmentAuditEventType union**
- **Found during:** Task 1 (editMeetingLinkAction implementation)
- **Issue:** The plan specified using `"appointment.updated"` as audit event type but that string was missing from the `AppointmentAuditEventType` union — TypeScript correctly rejected it
- **Fix:** Added `"appointment.updated"` to the union in `src/lib/appointments/audit.ts` and added its entry in `AUDIT_SUMMARIES`
- **Files modified:** src/lib/appointments/audit.ts
- **Verification:** `npx tsc --noEmit` reports no errors in source files
- **Committed in:** 649bdfe (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical type for correctness)
**Impact on plan:** Auto-fix necessary for TypeScript correctness. No scope creep.

## Issues Encountered
None beyond the audit type deviation above.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- All six ONLN/COMM requirements closed
- Phase 05 plan 03 complete — Phase 5 (Finance and Assisted Operations) fully executed
- Ready for Phase 6 (Retrieval, Recovery, and Polish)

## Self-Check: PASSED
All key files found. Both task commits verified (649bdfe, a1baab1).

---
*Phase: 05-finance-and-assisted-operations*
*Completed: 2026-03-14*
