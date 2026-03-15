---
plan: 04-03
phase: 04-document-vault
status: checkpoint
completed_at: 2026-03-14
---

# Plan 04-03: Patient Document Retrieval Surface

## What Was Built

Patient-linked document retrieval surface across 6 files: the `DocumentsSection` component showing active documents on the patient profile, a read-only view page with full provenance and actions, an archive server action, an edit composer pre-filled with current content, an update server action firing `document.updated` audit events, and the patient profile page wired to load and render the section below `ClinicalTimeline`.

## Key Files

### Created
- `src/app/(vault)/patients/[patientId]/components/documents-section.tsx` — Pure presentational component listing active documents (type label + date only, SECU-05 compliant)
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/page.tsx` — Read-only view: provenance header (type, patient, professional, createdAt, editedAt), content, download link, edit and archive actions
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/actions.ts` — `archiveDocumentAction`: calls `archivePracticeDocument`, fires `document.archived` audit event, redirects to patient profile
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/edit/page.tsx` — Edit composer pre-filled with current `doc.content`; submits via `updateDocumentAction`
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/edit/actions.ts` — `updateDocumentAction`: calls `updatePracticeDocument`, fires `document.updated` audit event, redirects to view page

### Modified
- `src/app/(vault)/patients/[patientId]/page.tsx` — Added `getDocumentRepository().listActiveByPatient()` and `<DocumentsSection>` below `<ClinicalTimeline>`

## Decisions Made

- **SECU-05 enforced**: `DocumentsSection` renders only `type` label and `createdAt` — `doc.content` never appears in list surfaces
- **Shared audit singleton**: Both `[documentId]/actions.ts` and `edit/actions.ts` use the same `__psivaultDocumentAudit__` global, consistent with the clinical audit pattern
- **No deletion**: Only archive — `archivePracticeDocument` sets `archivedAt`, document remains in storage
- **`editedAt` provenance**: View page renders "Editado em" timestamp when `doc.editedAt` is set, surfacing the locked mutability decision from CONTEXT.md

## Self-Check

- [x] `pnpm build` exits 0 — all 3 document routes compiled
- [x] `pnpm test tests/document-domain.test.ts` — 24/24 passing, no regressions
- [x] `doc.content` not rendered in `documents-section.tsx`
- [x] `archiveDocumentAction` is "use server", calls `archivePracticeDocument` + `document.archived` audit
- [x] `updateDocumentAction` is "use server", calls `updatePracticeDocument` + `document.updated` audit
- [x] Edit page pre-fills textarea with `doc.content`
- [x] Patient profile page loads documents via `listActiveByPatient` and renders `DocumentsSection`
- [ ] Task 4: Human browser verification checkpoint — pending user approval

## Checkpoint

Task 4 is a `checkpoint:human-verify` gate. Automated checks passed. Human verification required before this plan is marked fully complete.
