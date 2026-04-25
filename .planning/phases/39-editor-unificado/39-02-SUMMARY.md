---
phase: 39-editor-unificado
plan: 02
status: complete
completed_at: "2026-04-25T20:50:00Z"
---

## Summary

Replaced the plain-text/pre document view with a premium A4-simulated paper layout that renders documents like real clinical paperwork, including responsive scaling, state-based watermarks, and signature blocks.

## Tasks Completed

1. **DocumentPaperView** — Server Component that renders A4-sized paper (210mm × 297mm) with:
   - Clinical header: kicker, title, patient/professional/CRP metadata grid
   - Content block: auto-detects HTML vs plain text, sanitizes before dangerouslySetInnerHTML
   - Signature block: conditional on signed status + signature image URL + non-private
   - Watermarks: "RASCUNHO" for draft, "ARQUIVADO" for archived
   - Typography: serif body, sans-serif headers

2. **DocumentPaperScaler** — Client Component using ResizeObserver to measure container width and apply `transform: scale(ratio)` where ratio = containerWidth / 794px. Scale capped at 1.

3. **Page refactor** — Document view page now uses `DocumentPaperScaler` → `DocumentPaperView` instead of inline provenance + content sections. Removed redundant provenance header. Added placeholder buttons for "Visualizar PDF" and "Assinar" (to be wired in Plan 39-03).

## Key Files Created/Modified

- `src/app/(vault)/patients/[patientId]/documents/components/document-paper-view.tsx` (created)
- `src/app/(vault)/patients/[patientId]/documents/components/document-paper-scaler.tsx` (created)
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/page.tsx` (modified)

## Deviation Log

- None

## Self-Check: PASSED

- `pnpm build` succeeds with zero TypeScript errors
- `pnpm test` passes (453 tests, including 18 new from Plan 39-01)
- A4 paper dimensions render correctly in component structure
