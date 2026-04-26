---
phase: 39-editor-unificado
plan: 03
status: complete
completed_at: "2026-04-25T21:30:00Z"
---

## Summary

Added lazy-loaded PDF preview modal, refactored document actions into a dedicated client component with signature gating at sign time, and introduced structured document templates that generate HTML default content with section headings — all while preserving the single rich text editor for every document type.

## Tasks Completed

1. **DocumentPdfPreviewModal** (`src/components/document-pdf-preview-modal.tsx`)
   - Lazy-loaded via `next/dynamic` with `ssr: false`
   - Iframe-based PDF preview with loading spinner
   - Focus trap on open, Escape to close, overlay click to dismiss
   - Fade + scale CSS animations, full accessibility attributes (`role="dialog"`, `aria-modal`)

2. **DocumentActions** (`src/app/(vault)/patients/[patientId]/documents/[documentId]/components/document-actions.tsx`)
   - Client Component holding modal open/close state
   - "Visualizar PDF" button → opens preview modal
   - "Baixar PDF" button → direct download via anchor tag
   - "Assinar" button → invokes `signDocumentAction` with signature asset gate
   - "Arquivar" button → invokes `archiveDocumentAction`
   - Conditional rendering based on document status (no sign if already signed, etc.)

3. **Sign action** (`actions.ts`)
   - Added `signDocumentAction` server action
   - Validates workspace + role, fetches document, checks `canSignDocument`
   - Signature asset gate: looks up account's signature asset; throws human-readable error if missing
   - Idempotent: returns early if already signed
   - Revalidates patient documents path after success

4. **Removed hard signature gate from creation**
   - `new/page.tsx`: removed the `<Navigate>` that blocked document creation when no signature was configured
   - Replaced with a subtle informational notice: "Para assinar documentos, configure sua assinatura em Configurações."
   - Users can now create and edit documents freely; signing is gated only at the moment of signing

5. **Structured document templates** (`templates.ts`)
   - Added `DocumentTemplate` and `DocumentSection` interfaces
   - Added `DOCUMENT_TEMPLATES` array covering all 9 document types with metadata: `hasStructuredMode`, `sections`, `defaultTitle`
   - Added `getDocumentTemplate(type)` helper
   - Updated structured builders (`anamnesis`, `psychological_report`, `session_note`, `referral_letter`) to return HTML `defaultContent` with `<h2>` section headings instead of plain text
   - Single `RichTextEditor` is now sufficient for both free-form and structured modes

6. **PDF route refinement**
   - Replaced type-based `isRichText` flag with HTML auto-detection (`content.includes("<")`)
   - Prevents raw HTML tag leakage in PDFs for structured document types

## Key Files Created/Modified

- `src/components/document-pdf-preview-modal.tsx` (created)
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/components/document-actions.tsx` (created)
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/actions.ts` (modified)
- `src/app/(vault)/patients/[patientId]/documents/[documentId]/page.tsx` (modified)
- `src/app/(vault)/patients/[patientId]/documents/new/page.tsx` (modified)
- `src/lib/documents/templates.ts` (modified)
- `src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts` (modified)

## Deviation Log

- **Type workaround in DocumentActions:** `canSignDocument` expects a full `PracticeDocument` but the component only has `status`. Used `canSignDocument({ status } as any)` as pragmatic workaround; can be refined later if needed.
- **HTML auto-detection:** Instead of adding `isRichText` per type, the PDF route now detects HTML presence via `content.includes("<")`. This is simpler and avoids maintaining a type→format mapping.

## Self-Check: PASSED

- `pnpm test` passes (453 tests)
- `pnpm build` succeeds with zero TypeScript errors
- Preview modal lazy-loads correctly (no SSR bundle bloat)
- Signature gate blocks signing when no signature asset is present, but allows document creation
- Structured templates generate valid HTML with `<h2>` headings for all 4 structured types
- No new dependencies added
