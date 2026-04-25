---
phase: 38
plan: 38
subsystem: documents
requirements-completed: [STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06]
duration: "3 waves"
completed: "2026-04-25"
---

# Phase 38 Plan 38: Estados e Rascunho Server-Side Summary

Document lifecycle (draft → finalized → signed → delivered) with server-side auto-save and chronological status-aware listing.

---

## What Was Built

### Wave 1: State Transition Server Actions
- `finalizeDocumentAction` — transitions draft → finalized with workspace/patient guards and `document.finalized` audit
- `signDocumentAction` — transitions finalized → signed with workspace/patient/status guards and `document.signed` audit
- `deliverDocumentAction` — transitions signed → delivered with delivery metadata (to, via) and `document.delivered` audit
- Updated `createDocumentAction` — always creates as `draft` status (was `finalized`)
- Updated `updateDocumentAction` — guards with `canEditDocument` (only draft/finalized editable)

### Wave 2: Server-Side Draft Auto-Save
- `saveDraftAction` — server action for draft upsert (create or update) with throttled audit (only on new draft)
- `useDocumentAutoSave` hook — client-side 3s debounce, uses `useTransition`, returns `documentId` for subsequent saves
- Updated `DocumentComposerForm` — replaced localStorage `useAutoSave` with server-side hook, passes `draftId` to create action
- Updated `createDocumentAction` — accepts optional `draftId`, finalizes existing draft or creates+finalizes new

### Wave 3: Document Timeline with Status
- `document-status-presenter.ts` — status labels, color tokens, filter options
- `DocumentTimeline` component — chronological list with status badges, inline actions per state, quick filter chips
- Updated `DocumentsSection` — uses `DocumentTimeline` instead of type-grouped collapsible sections
- Updated patient page — uses `listByPatient` instead of `listActiveByPatient` to include drafts/archived in timeline

---

## Files Created

| File | Purpose |
|------|---------|
| `src/app/(vault)/patients/[patientId]/documents/[documentId]/finalize/actions.ts` | finalizeDocumentAction |
| `src/app/(vault)/patients/[patientId]/documents/[documentId]/sign/actions.ts` | signDocumentAction |
| `src/app/(vault)/patients/[patientId]/documents/[documentId]/deliver/actions.ts` | deliverDocumentAction |
| `src/lib/documents/save-draft-action.ts` | saveDraftAction server action |
| `src/hooks/use-document-auto-save.ts` | useDocumentAutoSave hook |
| `src/app/(vault)/patients/[patientId]/components/document-status-presenter.ts` | Status labels/colors/filters |
| `src/app/(vault)/patients/[patientId]/components/document-timeline.tsx` | DocumentTimeline component |

## Files Modified

| File | Change |
|------|--------|
| `src/app/(vault)/patients/[patientId]/documents/new/actions.ts` | Creates draft; accepts draftId for finalization |
| `src/app/(vault)/patients/[patientId]/documents/new/components/document-composer-form.tsx` | Server-side auto-save |
| `src/app/(vault)/patients/[patientId]/documents/[documentId]/edit/actions.ts` | canEditDocument guard |
| `src/app/(vault)/patients/[patientId]/components/documents-section.tsx` | Uses DocumentTimeline |
| `src/app/(vault)/patients/[patientId]/page.tsx` | listByPatient for all documents |

---

## Decisions

- Auto-save emits audit only on new draft creation, not every keystroke — prevents audit flood
- DocumentComposerForm passes draftId via hidden field; createDocumentAction finalizes existing draft if present
- Timeline shows ALL documents (including drafts and archived) — filters let users focus
- Inline actions for finalize/sign/deliver use simple forms posting to dedicated action routes

---

## Verification

- ✅ 435/435 tests passing
- ✅ TypeScript zero errors (build passes)
- ✅ Document lifecycle guards tested in `tests/document-lifecycle.test.ts`
- ✅ Domain model transitions tested in `tests/document-domain.test.ts`

---

## Deviations from Plan

None — plan executed as written.

---

## Next Step

Phase 39: Editor Unificado e Preview A4 — unified document editor with A4 preview and PDF generation.

---

*Phase: 38-estados-e-rascunho*
*Plan: 38-PLAN.md*
