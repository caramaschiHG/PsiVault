---
phase: 39-editor-unificado
plan: 01
status: complete
completed_at: "2026-04-25T20:45:00Z"
---

## Summary

Built a custom HTML-to-react-pdf mapper and generalized PDF generation so all finalized/signed/delivered documents (including rich text session records) can produce properly formatted PDFs.

## Tasks Completed

1. **html-to-pdf-nodes.ts** — Lightweight stack-based HTML parser (no external dependency) that converts sanitized HTML to react-pdf compatible node trees. Supports all 12 allowed rich text tags plus alignment, bold/italic/underline propagation, lists, blockquotes, horizontal rules, and links.
2. **pdf.tsx** — Added `isRichText` optional parameter to `renderPracticeDocumentPdf`. When true, uses `htmlToPdfNodes` + recursive `PdfNodeRenderer` component to render rich text. Plain text behavior preserved for backward compatibility.
3. **presenter.ts** — `canExportDocumentAsPdf` now returns `true` for all document types (previously restricted to `patient_record_summary`).
4. **PDF API route** — Replaced type-based gating with status-based gating: blocks draft documents with 400. Signature is now optional and only included for signed documents with a valid signature asset. Passes `isRichText: true` for `session_record` type.
5. **Tests** — 14 unit tests for HTML parser covering all supported tags, style propagation, and edge cases. 4 integration tests for PDF generation (plain text, rich text, signature, empty content).

## Key Files Created/Modified

- `src/lib/documents/html-to-pdf-nodes.ts` (created)
- `src/lib/documents/pdf.tsx` (modified)
- `src/lib/documents/presenter.ts` (modified)
- `src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts` (modified)
- `tests/html-to-pdf-nodes.test.ts` (created)
- `tests/pdf-generation.test.ts` (created)

## Deviation Log

- **Fixes for pre-existing Phase 37/38 issues:** Corrected broken relative import paths in document action files (`deliver`, `finalize`, `sign`, `save-draft`) and fixed `getAuditRepository` import source.

## Self-Check: PASSED

- `pnpm test -- tests/html-to-pdf-nodes.test.ts` passes (14/14)
- `pnpm test -- tests/pdf-generation.test.ts` passes (4/4)
- `pnpm build` succeeds with zero TypeScript errors
- `canExportDocumentAsPdf` returns true for all 9 document types
- No new dependencies added
