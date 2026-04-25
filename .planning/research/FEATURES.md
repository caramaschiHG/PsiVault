# Feature Landscape

**Domain:** Clinical documentation workflow for psychology practice management
**Researched:** 2026-04-25

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Patient profile tabs | Standard UX pattern for organizing dense patient data | Low | **Already shipped** — geral/clinico/documentos/financeiro/config |
| Clinical timeline with grouping | Psicologist needs to scan session history quickly | Low | **Already shipped** — grouped by month, simplified cards |
| Document grouping by type | Finding a specific declaration or receipt among many docs | Low | **Already shipped** — collapsible type groups with count badges |
| Auto-save indicator | Confidence that clinical notes won't be lost | Low | **Already shipped** — `AutoSaveIndicator` component with localStorage |
| Note templates (SOAP/BIRP/Livre) | Structured clinical documentation is standard practice | Low | **Already shipped** — clickable template cards in note composer |
| Rich text document editor | Formal documents need formatting (headers, lists, bold) | Medium | **Already shipped** — `RichTextEditor` with toolbar for ALL document types |
| PDF generation | Documents must be exportable as formal PDFs | Medium | **Already shipped** — `@react-pdf/renderer` with lazy loading |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Global document dashboard (`/documentos`) | See ALL documents across patients with filters; no competitor does this well for small practices | Medium | **New for v1.6** — cross-patient view with type/date/patient filters |
| PDF preview before save | Avoid "generate, download, realize error, regenerate" cycle | Low | **New for v1.6** — client-side preview using existing renderer |
| Session→note integrated flow | Complete appointment → create note in 1-2 clicks instead of 4+ | Low | **New for v1.6** — redirect or drawer from agenda quick actions |
| Keyboard shortcuts for flow actions | Power users can navigate without mouse friction | Low | **New for v1.6** — expand existing `useGlobalShortcuts` |
| Focus mode for note editor | Remove visual clutter during clinical writing | Low | **Already shipped** — collapses sidebar, hides optional fields |
| Visual timeline connector | Elegant vertical line connecting sessions chronologically | Low | **Partially shipped** — needs CSS pseudo-element enhancement |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Full-text search across document content | Security risk (SECU-05); could leak clinical content in search indexes | Search by type, patient name, date range only |
| Server-side real-time collaboration | Overkill for solo psychology practice; adds massive complexity | Single-user editing with optimistic UI and auto-save |
| Custom template builder (drag-drop) | Too complex for target user; SOAP/BIRP/Livre covers 95% of needs | Hardcoded templates with clear labels; expand set later if requested |
| In-app PDF annotation | No user request; adds dependency on PDF.js or similar | Download PDF and use external tools |
| Document versioning / diff history | Adds storage and UI complexity; undo + editedAt timestamp suffices | Soft archive + `editedAt` audit trail |

## Feature Dependencies

```
Document Dashboard
  → listActiveByWorkspace (new repository method)
  → Patient name resolution (existing patientRepo.listActive)

PDF Preview
  → renderPracticeDocumentPdf (existing, client-side callable)
  → Document content state (already in DocumentComposerForm)

Session→Note Flow
  → completeAppointmentAction (existing)
  → Note composer form (existing)
  → Optional: InlineNoteDrawer (depends on form extraction)

Keyboard Shortcuts
  → useGlobalShortcuts hook (existing)
  → Page-level route awareness (new context or prop)
```

## MVP Recommendation

Prioritize:
1. **Repository layer extension** (`listActiveByWorkspace`) — unblock dashboard
2. **Document dashboard page** (`/documentos`) — highest visible value, reusable pattern from finance refactor
3. **PDF preview modal** — quick win, reuses existing infrastructure
4. **Session→note redirect** — 1-line change in agenda quick actions, massive UX impact
5. **Keyboard shortcuts expansion** — completes the "power user" story

Defer:
- **Inline note drawer** — requires component extraction; redirect is MVP-equivalent
- **Visual timeline connector line** — cosmetic enhancement, low functional value
- **Smart document suggestions** (Phase 3 in UX plan) — requires AI/content analysis, out of scope

## Sources

- `.planning/PROJECT.md` — milestone scope and active requirements
- `.planning/document-flow-ux-plan.md` — UX audit and planned features
- Existing codebase audit — confirmed which features are already implemented
