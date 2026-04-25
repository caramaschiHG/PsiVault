# Phase 39: Editor Unificado e Preview A4 — Research

**Date:** 2026-04-25
**Phase:** 39 — Editor Unificado e Preview A4
**Researcher:** gsd-phase-researcher (orchestrated)

---

## 1. Stack Verification

### @react-pdf/renderer Version
- **Installed:** `^4.3.2` (package.json line 23)
- **Current usage:** `src/lib/documents/pdf.tsx` lazy-loads the module and uses `renderToBuffer`
- **Key finding:** The project is on v4, NOT v3. Many third-party HTML→PDF libraries target v3 and break on v4 internals.

### react-pdf-html Compatibility
- **NOT installed** in the project.
- **Risk:** `react-pdf-html` and similar community packages often lag behind `@react-pdf/renderer` major versions. v4 introduced internal changes to `textkit` and `layout` engines that break third-party HTML renderers.
- **Recommendation:** Avoid adding `react-pdf-html` as a dependency. Instead, build a **lightweight custom HTML→react-pdf mapper** that handles only the tags produced by the existing `RichTextEditor`.

### RichTextEditor Output Format
- **Location:** `src/components/ui/rich-text-editor.tsx`
- **Technology:** `contentEditable` + `document.execCommand`
- **Generated tags:** `p`, `h1`, `h2`, `strong`, `em`, `u`, `ul`, `ol`, `li`, `br`, `blockquote`, `a`, `hr`
- **Generated attributes:** `style="text-align:..."`, `href="..."`
- **Sanitization:** `sanitizeRichTextHtml` in `src/lib/documents/rich-text.ts` already validates allowed tags and attributes.

---

## 2. Existing Codebase Patterns

### PDF Generation (Current)
- **File:** `src/lib/documents/pdf.tsx`
- **Pattern:** Lazy-loaded module + cached styles (singleton pattern)
- **Current limitation:** `content` is rendered as a single `<Text>` with `whiteSpace: "pre-wrap"` — no rich text support
- **Signature:** Already supports `signatureDataUri` as base64 image
- **Fonts:** Uses `Helvetica` / `Helvetica-Bold` (built into react-pdf)

### PDF Route (Current)
- **File:** `src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts`
- **Guard:** `canExportDocumentAsPdf` hardcoded to `patient_record_summary` only
- **Signature gate:** Returns 412 if `signatureAsset` is missing
- **Runtime:** `nodejs` (required for `renderToBuffer`)

### Document View Page (Current)
- **File:** `src/app/(vault)/patients/[patientId]/documents/[documentId]/page.tsx`
- **Rendering:**
  - `session_record`: `dangerouslySetInnerHTML` with `sanitizeRichTextHtml`
  - Other types: `<pre>` with plain text
- **Signature:** Shows `<img>` with signed URL if not private
- **Actions:** Download .txt, Download PDF (if allowed), Edit, Archive

### Templates (Current)
- **File:** `src/lib/documents/templates.ts`
- **Pattern:** `buildDocumentContent(type, context)` returns pre-filled plain text strings
- **Types:** 9 document types; `session_record` returns empty string
- **Context:** `patientFullName`, `professionalName`, `crp`, `todayLabel`, etc.

### Composer Form (Current — Phase 38)
- **File:** `src/app/(vault)/patients/[patientId]/documents/new/components/document-composer-form.tsx`
- **Already unified:** ALL document types use `RichTextEditor` (not textarea anymore)
- **Auto-save:** Server-side via `useDocumentAutoSave` hook
- **Word count:** Active

### Domain Model (Phase 37)
- **File:** `src/lib/documents/model.ts`
- **Status enum:** `draft | finalized | signed | delivered | archived`
- **Guards:** `canEditDocument`, `canFinalizeDocument`, `canSignDocument`, `canDeliverDocument`, `canArchiveDocument`
- **Lifecycle factories:** `finalizeDocument`, `signDocument`, `deliverDocument`

---

## 3. Technical Decisions

### Decision 1: Custom HTML→react-pdf Mapper (Recommended)
**Rationale:**
- `react-pdf-html` compatibility with v4 is uncertain and risky
- The editor only produces ~12 tag types — a custom mapper is ~150-200 lines
- Full control over styling, page breaks, and error handling
- Zero new dependencies

**Implementation approach:**
```typescript
// Parse sanitized HTML string into a tree
// Recursively map nodes to react-pdf components:
//   <p> → <View><Text>...</Text></View>
//   <h1> → <View><Text style={styles.h1}>...</Text></View>
//   <strong> → <Text style={styles.bold}>...</Text>
//   <ul>/<ol> → <View> with bullet/number prefixes
//   <a> → <Text style={styles.link}>href</Text>
```

**Parser choice:** Use a lightweight HTML→JSON tree parser. Options:
1. **Native DOMParser** — only available in browser, not in Node.js route handlers
2. **Regex-based parser** — sufficient for the constrained tag set; ~50 lines
3. **Small npm package like `node-html-parser`** — adds dependency for simple task

**Recommendation:** Build a small regex-based parser or a minimal stack-based parser tailored to the allowed tag set. The input is already sanitized, so malformed HTML risk is low.

### Decision 2: Template Refactor — Structured Mode
**Current state:** Templates return plain text strings.
**Target state:** Templates define sections for structured documents.

**Approach:**
- Introduce `DocumentTemplate` interface with `type`, `mode` ("free" | "structured"), `sections[]`
- For `structured` mode: each section has `id`, `title`, `placeholder`, `required`
- Pre-fill function populates sections with variable substitution
- The editor renders sections as separate rich text editors or a single editor with section dividers

**Simpler alternative:** Keep templates as pre-filled HTML strings, but wrap sections in `<section data-section="...">` tags. The structured editor can then render these as editable blocks. This requires less refactoring.

**Recommendation:** Go with the simpler alternative for Phase 39. Full structured template refactor can be deferred if it risks scope creep. The goal is "editor contextual" — a single editor that adapts, not necessarily a full template engine rewrite.

### Decision 3: A4 Preview — CSS vs Canvas vs SVG
**Options:**
1. **CSS A4 simulation** — `width: 210mm`, `min-height: 297mm`, box-shadow. Simplest, responsive via `transform: scale()`.
2. **PDF.js preview** — Overkill for this use case; adds huge dependency.
3. **@react-pdf/renderer client preview** — Render PDF to blob URL, embed in iframe. Reuses existing code but requires client-side react-pdf load.

**Recommendation:** CSS A4 simulation for the "visualização como documento real" requirement. It loads instantly, requires no JS, and matches the "premium feel" goal. The existing PDF download/preview modal can be enhanced later.

### Decision 4: PDF Preview Modal — Reuse vs New
**Current state:** No PDF preview modal exists; only direct download.
**Options:**
1. **Iframe with `/api/.../pdf` URL** — Simple, reuses server-generated PDF. Requires `next/dynamic` wrapper.
2. **Client-side @react-pdf preview** — Renders PDF in modal using react-pdf components. Heavier but instant.

**Recommendation:** Iframe with API URL + `next/dynamic`. The PDF is already generated server-side; embedding it avoids client-side rendering complexity. Use `<iframe src={pdfUrl} />` inside a modal. Lazy-load the modal component.

---

## 4. Dependency Analysis

| Dependency | Status | Action |
|-----------|--------|--------|
| `@react-pdf/renderer` | Already installed v4.3.2 | None |
| `react-pdf-html` | Not installed, risky | **Do NOT add** |
| `node-html-parser` | Not installed | Optional — only if custom parser proves too complex |
| `next/dynamic` | Built into Next.js | None |

**No new dependencies required.**

---

## 5. File Inventory (To Modify/Create)

### Must Modify
1. `src/lib/documents/pdf.tsx` — Add rich text rendering; generalize beyond `patient_record_summary`
2. `src/lib/documents/presenter.ts` — Remove `canExportDocumentAsPdf` restriction or expand it
3. `src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts` — Allow all finalized/signed/delivered docs; remove signature gate from generation (keep it on signing action)
4. `src/app/(vault)/patients/[patientId]/documents/[documentId]/page.tsx` — Add A4 preview view; add PDF preview button; update signing flow

### Must Create
5. `src/components/document-pdf-preview-modal.tsx` — Lazy-loaded modal with iframe
6. `src/app/(vault)/patients/[patientId]/documents/components/document-paper-view.tsx` — A4 CSS layout component
7. `src/lib/documents/html-to-pdf-nodes.ts` — Custom HTML→react-pdf mapper

### May Modify
8. `src/lib/documents/templates.ts` — Add section markers if structured mode is implemented
9. `src/app/(vault)/patients/[patientId]/documents/new/page.tsx` — Remove signature gate from creation
10. `src/app/(vault)/patients/[patientId]/documents/new/components/document-composer-form.tsx` — Enhance for structured mode

---

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Custom HTML parser edge cases | Medium | Medium | Extensive tests with real editor output; fallback to plain text |
| react-pdf v4 font limitations (no web fonts) | Low | Low | Use built-in Helvetica; acceptable for clinical docs |
| A4 CSS breaks on mobile | Medium | Low | Use `transform: scale()` based on viewport width |
| Scope creep: full template engine | High | High | Keep structured mode simple — pre-filled sections, not full engine |

---

## 7. Validation Architecture (Nyquist)

### Dimension 8: Validation Requirements
- HTML parser must be tested against all tags the editor produces
- PDF output must be byte-compared or visually checked for formatting correctness
- A4 preview must match PDF output in structure (same sections, same order)
- Modal must lazy-load correctly (not in initial bundle)

### Test Strategy
- Unit tests for `html-to-pdf-nodes.ts` with each supported tag
- Integration test: create document → generate PDF → verify Buffer length > 0
- Visual checkpoint: A4 preview renders correctly in browser

---

## 8. Research Summary

**Key insight:** The codebase is already 60% ready for this phase.
- `RichTextEditor` is unified for all types ✅
- `@react-pdf/renderer` v4 is installed with lazy-load pattern ✅
- Domain model has status lifecycle ✅
- PDF route exists but is restricted ✅

**Main work:**
1. Build custom HTML→react-pdf mapper (no third-party lib)
2. Generalize PDF generation and route
3. Create A4 CSS preview component
4. Create PDF preview modal (lazy-loaded)
5. Move signature gate from creation to `signDocumentAction`

**Estimated plans:** 3-4 plans in 2-3 waves.

---

*Research completed: 2026-04-25*
