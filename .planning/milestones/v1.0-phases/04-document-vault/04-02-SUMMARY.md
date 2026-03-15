---
phase: 04-document-vault
plan: "02"
subsystem: ui
tags: [next.js, server-components, server-actions, documents, forms]

# Dependency graph
requires:
  - phase: 04-01
    provides: "DocumentType, PracticeDocument, buildDocumentContent, getDocumentRepository, createDocumentAuditEvent, createPracticeDocument"
  - phase: 03-02
    provides: "Server action + client form colocation pattern, nullCoerce helper, NoteComposerForm pattern"
provides:
  - "/patients/[patientId]/documents/new route — full document generation composer"
  - "createDocumentAction server action — saves document and redirects"
  - "DocumentComposerForm client component — pre-filled textarea with dirty tracking"
  - "Signature gate enforcement — blocks form when signatureAsset is null"
affects:
  - "04-03 (document list/view will link to this route)"
  - "05-finance-assisted-ops (amountLabel pre-fill is null placeholder for Phase 5)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server component type validation via Set<DocumentType> before any data fetching"
    - "Signature gate returns early with inline notice (no redirect) to preserve breadcrumb context"
    - "buildDocumentContent called server-side; defaultContent passed as prop to client form"
    - "Server action passed as prop to client form component (colocation pattern)"
    - "Audit repository accessed via globalThis singleton (matches existing vault pattern)"

key-files:
  created:
    - src/app/(vault)/patients/[patientId]/documents/new/page.tsx
    - src/app/(vault)/patients/[patientId]/documents/new/actions.ts
    - src/app/(vault)/patients/[patientId]/documents/new/components/document-composer-form.tsx
  modified: []

key-decisions:
  - "Signature gate renders inline blocking notice (not redirect) so the patient breadcrumb is still visible, guiding user to /setup/profile"
  - "amountLabel is null — Phase 5 finance domain will enrich; priceInCents does not exist in the schema yet"
  - "sessionDateRange formatted from earliest and latest COMPLETED appointment startsAt using Intl.DateTimeFormat with UTC timezone"
  - "isDirty reset to false in onSubmit handler so beforeunload guard does not fire during server action redirect"

patterns-established:
  - "Document type guard: define VALID_TYPES Set at module level, call notFound() for invalid type before any I/O"
  - "Pre-fill context assembly: patient, profile, appointments all loaded server-side before rendering composer"

requirements-completed: [DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06, DOCS-07]

# Metrics
duration: ~30min (continuation agent)
completed: 2026-03-14
---

# Phase 04 Plan 02: Document Composer Route Summary

**Next.js server component composer at /patients/[patientId]/documents/new with signature gate, type validation, server-side template pre-fill via buildDocumentContent, and createDocumentAction server action redirecting to patient profile on save.**

## Performance

- **Duration:** ~30 min (continuation — implementation by prior agent, verification + commit by this agent)
- **Started:** 2026-03-14
- **Completed:** 2026-03-14
- **Tasks:** 2
- **Files modified:** 3 created

## Accomplishments

- Document composer route fully operational: type guard, patient guard, signature gate, pre-fill context assembly, and form render all in page.tsx server component
- createDocumentAction server action validates type, saves document via getDocumentRepository, fires audit event (SECU-05 compliant — only documentType in metadata), and redirects to /patients/[patientId]
- DocumentComposerForm client component with monospace pre-filled textarea, hidden fields, dirty tracking, beforeunload guard, and required validation on submit

## Task Commits

Each task was committed atomically:

1. **Task 1 + 2: Composer page, signature gate, server action, client form** — committed together as prior agent's work before rate limit

**Plan metadata:** (this SUMMARY commit)

## Files Created/Modified

- `src/app/(vault)/patients/[patientId]/documents/new/page.tsx` — Server component: type validation with VALID_TYPES Set, patient guard via getPatientRepository, signature gate returning inline notice when signatureAsset is null, pre-fill context assembly from profile/patient/appointments, buildDocumentContent call, and DocumentComposerForm render
- `src/app/(vault)/patients/[patientId]/documents/new/actions.ts` — "use server" createDocumentAction: validates DocumentType, creates PracticeDocument, saves via getDocumentRepository, appends audit event via globalThis singleton repo, redirects to /patients/[patientId]
- `src/app/(vault)/patients/[patientId]/documents/new/components/document-composer-form.tsx` — "use client" DocumentComposerForm: pre-filled textarea with defaultContent, hidden patientId/documentType fields, onChange dirty tracking, beforeunload guard with useEffect, required textarea, submit clears isDirty before redirect

## Decisions Made

- Signature gate uses inline return (not redirect) to keep patient breadcrumb visible — user sees context and can navigate to /setup/profile with the link provided
- `amountLabel` is always null in this phase — the Phase 5 finance domain will enrich receipts with real payment data; `priceInCents` does not exist in the schema
- `sessionDateRange` derived from sorted COMPLETED appointments with UTC timezone formatting to avoid day-boundary shifts
- `isDirty` is reset to false in `handleSubmitStart` (onSubmit) so the `beforeunload` dialog does not interrupt the server action redirect

## Deviations from Plan

None - plan executed exactly as written. The prior agent followed the interface contracts and patterns specified in the plan.

## Issues Encountered

None - implementation was complete and passing build before this continuation agent ran.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Document composer route is live: /patients/[patientId]/documents/new?type=[type]
- All 5 document types are supported via the VALID_TYPES set and TYPE_LABELS map
- Plan 04-03 (document list/view on patient profile) can now link to this route for document creation
- amountLabel pre-fill slot is reserved (null) for Phase 5 finance enrichment

---
*Phase: 04-document-vault*
*Completed: 2026-03-14*
