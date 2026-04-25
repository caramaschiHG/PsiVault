# Phase 39: Editor Unificado e Preview A4 — UI Design Contract

**Date:** 2026-04-25
**Phase:** 39
**Designer:** Derived from draft plan + CLAUDE.md brand rules

---

## Overview

This phase delivers a premium document reading and writing experience. The UI must feel like a serious clinical tool — calm, organized, and trustworthy. No decorative animations, no startup hype, no crypto/fintech visual language.

---

## Screens & Components

### 1. DocumentPaperView (A4 Preview)

**Purpose:** Render a finalized/signed document as if it were on real A4 paper.

**Layout:**
- Container: centered, max-width based on A4 proportions
- Paper: `width: 210mm`, `min-height: 297mm`, white background, subtle box-shadow
- Margins: ~25mm top, 20mm sides, 30mm bottom (simulated via padding)
- Scale on mobile: `transform: scale()` based on container width

**Typography:**
- Headers: sans-serif (system UI), 18-22px
- Body: serif-like (Georgia or system serif), 11-12pt equivalent
- Meta lines: sans-serif, 10px, muted color

**Sections (top to bottom):**
1. **Header block:**
   - Kicker: "Documento clínico" (uppercase, tracked, small, accent color)
   - Title: Document type label (large, bold)
   - Meta grid: Patient name, Professional name + CRP, Date
2. **Content block:**
   - Rich text: rendered HTML with proper paragraph spacing
   - Structured: sections with headings and body text
3. **Signature block (conditional on `signed`):**
   - Signature image (max-height 80px)
   - Horizontal line
   - Professional name + CRP + date

**States:**
- `draft`: Show watermark "RASCUNHO" diagonal, semi-transparent
- `finalized`: Clean, no watermark
- `signed`: Include signature block
- `archived`: Muted colors, "ARQUIVADO" stamp

**Responsive:**
- Desktop: full A4 size
- Tablet: slight scale down
- Mobile: significant scale + horizontal scroll optional

---

### 2. DocumentPdfPreviewModal

**Purpose:** Embedded PDF preview without downloading.

**Behavior:**
- Triggered by "Visualizar PDF" button on document view page
- Lazy-loaded via `next/dynamic` — NOT in initial bundle
- Modal overlay: `background: rgba(0,0,0,0.45)`
- Modal container: centered, max-width 900px, max-height 90vh
- Content: `<iframe src={pdfApiUrl} />` filling container
- Footer buttons: "Fechar" (secondary), "Baixar PDF" (primary, links to same URL with download)

**Animation:**
- Enter: fade in 150ms + scale from 0.97 to 1.00
- Exit: fade out 120ms
- Uses motion tokens: `--duration-200`, `--ease-out`

**Accessibility:**
- Focus trap inside modal
- Escape key closes
- `aria-modal="true"`, `role="dialog"`

---

### 3. DocumentEditor (Unified)

**Purpose:** Single editor component that adapts to document type.

**Modes:**
- **Free mode (`session_record`):** Full rich text editor as currently implemented
- **Structured mode (formal docs):** Rich text editor with section dividers

**Structured mode UI:**
- Sections rendered as cards/blocks with subtle borders
- Each section has a heading (non-editable) and editable body
- Optional: progress indicator showing filled vs empty sections
- Variable placeholders shown as subtle chips (e.g., `[{{patientName}}]`)

**Toolbar:**
- Same as current `RichTextEditor` toolbar
- Positioned above editor

**Status bar (below editor):**
- Left: Auto-save indicator
- Right: Word count

---

### 4. Signature Flow Updates

**Creation page (`new/page.tsx`):**
- Remove hard redirect when `signatureAsset` is missing
- Show subtle inline notice: "Para assinar documentos, configure sua assinatura em Configurações → Perfil"
- Notice style: muted text, small, non-blocking

**View page (`[documentId]/page.tsx`):**
- "Assinar" button visible only when `status === 'finalized'`
- If no signature configured: button disabled with tooltip "Configure sua assinatura em Perfil para finalizar este documento"

---

## Color & Style Rules

- **Paper background:** `#ffffff` or `var(--color-surface-0)`
- **Paper shadow:** `0 2px 8px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.04)` (contained, no exaggerated shadows)
- **Text:** `var(--color-kbd-text)` for headings, `var(--color-text-1)` for body
- **Muted:** `var(--color-text-2)` and `var(--color-text-3)` for meta
- **Signature line:** `1px solid var(--color-border-med)`
- **Watermarks/stamps:** low opacity (0.08-0.12), warm red or brown

## Anti-patterns (Forbidden)

- No glassmorphism on paper or modal
- No gradient backgrounds on functional surfaces
- No floating mockups or decorative illustrations
- No animated backgrounds or particle effects
- No badges/chips for "new" or "premium"

---

*UI-SPEC created: 2026-04-25*
