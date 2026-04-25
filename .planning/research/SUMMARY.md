# Project Research Summary

**Project:** PsiVault v1.6 Documentos
**Domain:** Clinical documentation workflow for psychology practice management
**Researched:** 2026-04-25
**Confidence:** HIGH

## Executive Summary

PsiVault v1.6 is an incremental milestone on an established Next.js 15 psychology practice management SaaS, focused on clinical documentation workflow improvements. Unlike a greenfield project, the majority of "foundational" UX work — patient profile tabs, clinical timeline, document grouping, auto-save, note templates, rich-text editor, and PDF generation — is already shipped. The remaining work centers on four genuine integrations: a workspace-scoped document dashboard (`/documentos`), a streamlined session-to-note creation flow, client-side PDF preview before save, and expanded keyboard shortcuts for power users.

The recommended approach is to extend the existing repository pattern with a single new method (`listActiveByWorkspace`), build the dashboard as a new page-specific component (not reuse patient-tab components), and leverage existing infrastructure for PDF preview and keyboard shortcuts. Most features are low-to-medium complexity because they build on patterns already proven in the codebase. The biggest architectural decision is whether to implement the session-to-note flow as a simple redirect (MVP) or an inline drawer (enhancement); research strongly recommends the redirect for immediate value.

Key risks center on security and compliance in a clinical domain: leaking sensitive fields (`importantObservations`) in new list queries, bypassing the repository pattern in quick actions, and storing clinical drafts unencrypted in localStorage. These are all preventable by enforcing existing patterns (`LIST_SELECT` exclusions, mandatory repository usage, encrypted or server-side drafts) and adding automated assertions. Performance risks (timeline N+1, dashboard load) are well understood and mitigated with cursor pagination, batched queries, and targeted database indexes.

## Key Findings

### Recommended Stack

The current stack is mature and requires no new dependencies for v1.6. All capabilities exist in the established Next.js 15 + Prisma 6 + Supabase + `@react-pdf/renderer` setup. The only infrastructure addition is a composite database index to support workspace-level document queries.

**Core technologies:**
- **Next.js 15** (App Router, Server Components, Server Actions) — already established; no migration needed
- **React 19 + TypeScript 5.8** — strict mode; runtime and type safety baseline
- **Prisma 6 + PostgreSQL (Supabase)** — ORM and primary store; repository pattern built on it
- **Supabase Auth** — SSR authentication with MFA and JWT AAL fast-path
- **`@react-pdf/renderer` ^3.x** — PDF buffer generation and client preview; dynamically imported to avoid bundle bloat
- **CSS custom properties + `React.CSSProperties`** — design tokens for static styles; inline styles only for dynamic values

**Database change:**
- `@@index([workspaceId, archivedAt, createdAt])` on `PracticeDocument` — supports dashboard's `listActiveByWorkspace` query pattern

### Expected Features

Most table-stakes features are already implemented. v1.6 focuses on differentiators that improve daily clinical workflow efficiency.

**Must have (table stakes) — ALREADY SHIPPED:**
- Patient profile tabs (geral/clinico/documentos/financeiro/config)
- Clinical timeline with month grouping and simplified cards
- Document grouping by type with collapsible sections and count badges
- Auto-save indicator with localStorage persistence
- Note templates (SOAP / BIRP / Livre)
- Rich-text document editor with toolbar for all document types
- PDF generation with lazy-loaded `@react-pdf/renderer`

**Should have (differentiators) — NEW FOR v1.6:**
- **Global document dashboard (`/documentos`)** — cross-patient view with type/date/patient filters; highest visible value, no competitor does this well for small practices
- **PDF preview before save** — avoid "generate, download, realize error, regenerate" cycle; quick win reusing existing renderer
- **Session→note integrated flow** — complete appointment → create note in 1-2 clicks; 1-line redirect change with massive UX impact
- **Keyboard shortcuts for flow actions** — power user navigation without mouse friction; extend existing `useGlobalShortcuts`
- **Focus mode for note editor** — already shipped; collapses sidebar, hides optional fields
- **Visual timeline connector** — partially shipped; cosmetic CSS enhancement

**Defer (v2+):**
- Inline note drawer — requires component extraction; redirect is MVP-equivalent
- Visual timeline connector line — cosmetic, low functional value
- Smart document suggestions — requires AI/content analysis, out of scope
- Full-text search across document content — security risk; search metadata only
- Custom template builder (drag-drop) — too complex for target user; hardcoded templates cover 95%

### Architecture Approach

The architecture follows the established repository pattern, server action conventions, and tab-based patient profile structure. Four clean integrations are needed. The dashboard should be a new top-level component (`DocumentDashboard`) that shares only presentational utilities (`DocumentRow`, `groupByType`, `TypeGroup`) with the per-patient tab — reusing `DocumentsSection` directly is an anti-pattern because it expects `patientId`-scoped data.

**Major components:**
1. **`DocumentDashboard`** (new) — workspace-level document list with filters, search, and grouping; communicates with `DocumentRepository` and `PatientRepository`
2. **`DocumentFilterBar`** (new) — type chips, date range, patient search; pure local state with callbacks
3. **`PdfPreviewModal`** (new) — client-side PDF render before save; lazy-loaded, uses existing `renderPracticeDocumentPdf`
4. **`NoteComposerForm`** (extract if drawer) — pure form logic shared between page and drawer; start with redirect instead
5. **`KeyboardShortcutsProvider`** (modified) — global shortcut registration extended with route-aware bindings

**Key patterns to follow:**
- Repository extension for new queries (`listActiveByWorkspace`)
- Client-side filtering with server hydration (responsive dashboard UX)
- Lazy-loaded PDF preview (zero bundle cost on non-preview routes)
- Component extraction for shared UI (if/when drawer mode is implemented)

### Critical Pitfalls

Research identified 10 pitfalls with concrete prevention strategies. The top 5 with highest impact:

1. **Leaking sensitive fields in new list queries** — `importantObservations` or draft content accidentally included in timeline/dashboard responses. **Avoid:** enforce `LIST_SELECT` exclusions; whitelist search-result fields; never use `include: true` blindly.
2. **Bypassing repository pattern in new features** — calling Prisma directly in Server Actions disables soft-delete filtering, workspace scoping, and audit logging. **Avoid:** lint rule banning `@prisma/client` outside `*.prisma.ts` files; mandatory code review checklist item.
3. **Keyboard shortcuts breaking accessibility** — single-key shortcuts (`N`, `D`) conflict with screen readers and browser defaults. **Avoid:** use modifier combos (`Ctrl+Shift+N`); gate shortcuts when focus is inside inputs; test with NVDA/JAWS.
4. **Unencrypted clinical drafts in localStorage** — PHI exposed on shared or compromised devices. **Avoid:** encrypt with Web Crypto API before storage, or migrate to server-side `Draft` table with Supabase RLS; scope keys by `workspaceId` + `patientId`.
5. **Timeline loading all history at once (N+1 & memory)** — long-term patients (5+ years) cause massive initial load. **Avoid:** cursor-based pagination (`take` + cursor); batched note presence query (`findByAppointmentIds`); never load `importantObservations` in timeline queries.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Repository & Index Foundation
**Rationale:** Unblocks every downstream phase. The new `listActiveByWorkspace` method and database index are prerequisites for the dashboard and any workspace-scoped queries.
**Delivers:** `listActiveByWorkspace` interface + Prisma + in-memory implementations; composite index migration; unit tests asserting workspace scoping and soft-delete filtering.
**Addresses:** Dashboard data layer (FEATURES.md)
**Avoids:** Bypassing repository pattern (PITFALLS.md #2); global search workspace leak (PITFALLS.md #6)

### Phase 2: Document Dashboard (`/documentos`)
**Rationale:** Highest visible value feature; reusable pattern from finance refactor. Once the repository method exists, the page is a straightforward Server Component → Client Component filter/groups flow.
**Delivers:** `/documentos` route, `DocumentDashboard` + `DocumentFilterBar`, type/date/patient filtering, document row cards with patient name resolution.
**Uses:** Stack elements (Next.js App Router, Prisma, CSS custom properties); architecture pattern (client-side filtering with server hydration)
**Avoids:** Reusing patient-tab components for dashboard (ARCHITECTURE.md anti-pattern #1); leaking sensitive fields (PITFALLS.md #1); missing workspace scope (PITFALLS.md #6)

### Phase 3: PDF Preview Modal
**Rationale:** Quick win that reuses existing `@react-pdf/renderer` infrastructure. Adds significant UX value (avoiding regenerate cycles) with minimal code.
**Delivers:** Lazy-loaded `PdfPreviewModal` in `DocumentComposerForm`, client-side blob URL generation, iframe/object embed.
**Uses:** Existing `renderPracticeDocumentPdf` and dynamic import pattern
**Avoids:** Client-side PDF bloat (PITFALLS.md #7); server-side PDF preview latency (ARCHITECTURE.md anti-pattern #4)

### Phase 4: Session→Note Flow
**Rationale:** Massive UX impact with minimal code — a 1-line redirect from agenda quick actions. Drawer mode can be a later enhancement.
**Delivers:** "Criar nota" quick action after completing appointment; redirect to `/sessions/{id}/note?from=agenda`; back-navigation handling.
**Avoids:** Quick action race conditions (PITFALLS.md #10) by keeping appointment completion and note creation as separate, validated actions; bypassing repository (PITFALLS.md #2)

### Phase 5: Keyboard Shortcuts & Polish
**Rationale:** Completes the "power user" story. Depends on stable page routes from Phases 2–4 so shortcuts can target correct URLs.
**Delivers:** Extended `KeyboardShortcutsProvider` with route-aware bindings; `?` help modal; modifier-key combos for dashboard, note, and document actions.
**Avoids:** Accessibility conflicts (PITFALLS.md #3); keyboard traps; missing `prefers-reduced-motion` support

### Phase 6: Timeline Performance & Visual Polish
**Rationale:** Lowest priority — cosmetic and performance enhancements that improve feel but don't unblock core workflows.
**Delivers:** Cursor-based pagination for timeline; batched note presence query; CSS visual connector line; tab state in URL (deep-linkable).
**Avoids:** N+1 timeline queries (PITFALLS.md #5); tab state loss on refresh (PITFALLS.md #8)

### Phase Ordering Rationale

- **Repository first** — every other feature queries documents; the new `listActiveByWorkspace` method and index are true blockers.
- **Dashboard second** — highest user-visible value and validates the repository work in a real UI.
- **PDF preview third** — independent of dashboard and note flow; can ship in parallel with Phase 4 if desired, but ordered after dashboard to keep focus.
- **Note flow fourth** — depends on stable appointment completion actions; redirect is trivial, but must be tested against existing quick-action logic.
- **Shortcuts fifth** — needs stable routes from dashboard and note pages to bind meaningful navigation shortcuts.
- **Polish last** — pagination and visual enhancements are optimizations on existing shipped features.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Session→Note Flow):** Needs validation on whether the redirect pattern preserves all form state correctly (e.g., `from=agenda` query param handling, back button behavior). If drawer mode is requested later, requires component extraction research.
- **Phase 5 (Keyboard Shortcuts):** Needs accessibility audit research — specific NVDA/JAWS shortcut conflict lists, axe-core CI integration pattern.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Repository & Index):** Well-established Prisma pattern; in-memory repo test pattern already exists.
- **Phase 2 (Document Dashboard):** Standard Next.js App Router Server Component → Client Component with derived state; pattern identical to finance refactor.
- **Phase 3 (PDF Preview):** Reuses existing `@react-pdf/renderer` dynamic import pattern; implementation is documented in ARCHITECTURE.md.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new dependencies; all versions verified in `package.json` and existing usage |
| Features | HIGH | Codebase audit confirmed which features are shipped vs. new; UX plan is explicit |
| Architecture | HIGH | Repository pattern, Server Actions, and component boundaries are well established; new integrations are narrow |
| Pitfalls | HIGH | 10 pitfalls mapped to concrete prevention strategies and phases; sourced from existing codebase, WCAG docs, and clinical SaaS experience |

**Overall confidence:** HIGH

### Gaps to Address

- **Note flow UX validation:** Research recommends a redirect for MVP, but user testing should confirm this feels seamless vs. an inline drawer. During Phase 4 planning, validate whether `router.push()` with `from=agenda` preserves enough context.
- **Draft encryption strategy:** PITFALLS.md flags unencrypted localStorage drafts as a critical issue. During Phase 1 or early Phase 4 planning, decide whether to encrypt client-side with Web Crypto API or migrate to a server-side `Draft` table — this affects the note composer architecture.
- **Timeline pagination threshold:** Research recommends cursor pagination but doesn't specify the exact `take` limit (20? 50?). During Phase 6 planning, determine the optimal page size based on existing patient data distribution.
- **Keyboard shortcut modifier choice:** PITFALLS.md recommends `Ctrl+Shift+Key` but specific keybindings need user-acceptance validation during Phase 5 planning to avoid conflicts with OS-level shortcuts.

## Sources

### Primary (HIGH confidence)
- `prisma/schema.prisma` — existing schema, indexes, and `PracticeDocument` model
- `src/lib/documents/repository.ts` — existing repository interface and patterns
- `src/lib/documents/pdf.tsx` — existing `@react-pdf/renderer` usage and lazy-load pattern
- `src/components/ui/keyboard-shortcuts-modal.tsx` — existing shortcut system
- `.planning/PROJECT.md` — milestone scope, constraints, and security rules
- `.planning/document-flow-ux-plan.md` — UX audit and planned features

### Secondary (MEDIUM confidence)
- [WCAG 2.1 Understanding SC 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) — accessibility guidance for keyboard shortcuts
- [Prisma ORM CRUD & Query Patterns](https://www.prisma.io/docs/orm/prisma-client/queries/crud) — query optimization and pagination patterns
- [Next.js Documentation — Caching & Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing) — dynamic imports and route caching

### Tertiary (LOW confidence)
- Author's experience with multi-tenant clinical SaaS systems and HIPAA-aligned architecture — informed severity ranking of pitfalls

---
*Research completed: 2026-04-25*
*Ready for roadmap: yes*
