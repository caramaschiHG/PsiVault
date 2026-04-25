# Pitfalls Research

**Domain:** Clinical documentation workflow (timeline, templates, PDF, shortcuts, dashboard) added to an existing Next.js psychology practice management system (PsiVault)
**Researched:** 2026-04-25
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Leaking Sensitive Fields in New List Queries

**What goes wrong:**
The redesigned clinical timeline or global document search accidentally includes `importantObservations`, draft note content, or other sensitive PHI in list responses. This violates the project's hard security rule and can expose sensitive clinical data in search results, timeline cards, or dashboard previews.

**Why it happens:**
Developers add new queries for timeline aggregation or global search and forget to apply the existing `LIST_SELECT` exclusion pattern. Global search especially tends to use `SELECT *` or broad `include` blocks to maximize discoverability, making it easy to pull in fields that should never leave the server in list context.

**How to avoid:**
- Enforce the existing `LIST_SELECT` pattern for every new query; never use `include: true` or `select: true` blindly.
- Create a shared Prisma query extension or helper that strips sensitive fields by default for list operations.
- Add automated tests that assert sensitive fields are absent in every new list/search endpoint response (fail the build if they appear).
- For global search, explicitly whitelist search-result fields rather than blacklisting.

**Warning signs:**
- TypeScript types for list DTOs include `importantObservations` or `content` fields.
- Snapshot tests show sensitive data in JSON responses.
- Search results show clinical note snippets that should be private.

**Phase to address:**
Timeline (TIME-01, TIME-02) and Dashboard (DASH-01, DASH-02)

---

### Pitfall 2: Bypassing Repository Pattern in New Features

**What goes wrong:**
New features (quick actions, timeline queries, dashboard aggregations) call Prisma Client directly in Server Actions or components, bypassing the repository layer. This silently disables soft-delete filtering, workspace scoping, and audit trail logging, causing data leaks and compliance gaps.

**Why it happens:**
Time pressure makes the repository pattern feel like overhead for "simple" queries (e.g., "just mark appointment complete"). Developers may not realize that the repository layer also enforces `deletedAt: null`, `workspaceId` scoping, and audit logging.

**How to avoid:**
- Mandate repository interface usage for every new domain operation; add a project lint rule that bans `@prisma/client` imports outside `*.prisma.ts` repository files.
- Include "no raw Prisma in actions/components" in the code review checklist.
- Write unit tests for new repositories using in-memory implementations to enforce the interface boundary.

**Warning signs:**
- `@prisma/client` imported in `actions.ts` or page files.
- Queries missing `deletedAt: null` or `workspaceId` filters.
- Audit trail logs missing entries for new mutations.

**Phase to address:**
All phases (especially Quick Actions QUICK-01 and Session Flow FLOW-01)

---

### Pitfall 3: Keyboard Shortcuts Breaking Accessibility and Browser Defaults

**What goes wrong:**
Custom single-key shortcuts (e.g., `N` for new note, `D` for new document) conflict with screen-reader shortcuts (NVDA/JAWS), browser navigation (`Ctrl+D` bookmark, `Ctrl+N` new window), or assistive technologies. This makes the app unusable for keyboard-only or visually impaired users, failing WCAG 2.1.1 and 2.1.4.

**Why it happens:**
Developers implement shortcut handlers with global `keydown` listeners without checking for active focus context or modifier keys. Single-letter shortcuts are common in English-centric apps but are notorious accessibility hazards.

**How to avoid:**
- Use modifier-key combos (`Ctrl+Shift+N`, `Ctrl+Shift+D`) instead of single-key shortcuts.
- Implement a shortcuts context that disables global shortcuts when focus is inside input, textarea, contenteditable, or ARIA application roles.
- Provide a discoverable help modal triggered by `?` (also gated) that lists all shortcuts.
- Test with NVDA or JAWS; run axe-core accessibility audits in CI.

**Warning signs:**
- Shortcut handlers fire while user is typing in the rich-text editor.
- Browser native actions (new window, bookmark) are hijacked.
- Lighthouse or axe-core flags keyboard traps or missing alternatives.

**Phase to address:**
Quick Actions (QUICK-01, QUICK-02)

---

### Pitfall 4: Unencrypted Clinical Drafts in localStorage

**What goes wrong:**
The enhanced note composer stores draft clinical notes in browser localStorage as plain text. If the device is shared, stolen, or compromised, protected health information (PHI) is immediately readable. Additionally, if localStorage keys are not scoped by workspace and patient, drafts from one patient may leak to another.

**Why it happens:**
localStorage is the easiest client-side persistence mechanism for auto-save. Encryption feels like extra complexity, and key scoping is often an afterthought.

**How to avoid:**
- Encrypt drafts client-side using the Web Crypto API (e.g., AES-GCM with a key derived from the user's session token) before writing to localStorage.
- Scope localStorage keys by `workspaceId` and `patientId` (e.g., `draft:{workspaceId}:{patientId}:note`).
- Better yet: move drafts to a server-side `Draft` table with Supabase RLS, so they never reside on the client unprotected and are available across devices.
- If localStorage must be used, clear draft keys on logout and set a TTL.

**Warning signs:**
- DevTools Application tab shows readable clinical note text.
- localStorage keys lack workspace/patient namespace.
- Drafts persist after user logout.

**Phase to address:**
Note Composer (NOTE-01, NOTE-02)

---

### Pitfall 5: Timeline Loading All History at Once (N+1 & Memory)

**What goes wrong:**
The redesigned clinical timeline fetches every appointment and note for a patient without pagination. For long-term patients (5+ years of weekly sessions), this results in massive initial page load, N+1 queries per timeline card, and browser memory bloat, regressing the v1.3 performance gains.

**Why it happens:**
Timelines naturally look like infinite scroll feeds, but developers often start with a simple `findMany` without `take`/`skip` or cursor pagination, then load relations eagerly with `include`, triggering an N+1 for each card's note status.

**How to avoid:**
- Implement cursor-based pagination (e.g., 20 entries per page) with an explicit "Carregar mais" button or infinite scroll.
- Use a single batched query for note presence (as done in v1.3 with `findByAppointmentIds`), not per-card queries.
- Perform month/trimester grouping server-side in SQL/Prisma, not client-side on a massive dataset.
- Never load `importantObservations` in timeline queries.

**Warning signs:**
- Patient page load time >2 seconds for long-term patients.
- React DevTools shows hundreds of timeline entry components mounted at once.
- Prisma query logs show repeated identical queries per appointment.

**Phase to address:**
Timeline (TIME-01, TIME-02)

---

### Pitfall 6: Global Document Search Missing Workspace Scope or RLS

**What goes wrong:**
The new `/documentos` dashboard with global search queries documents without strict `workspaceId` filtering, or uses raw SQL (`to_tsvector`) that bypasses Prisma's automatic scoping. This creates cross-tenant data leakage—one workspace can see another's documents.

**Why it happens:**
Global search is often built with raw SQL or dedicated search endpoints for performance. Developers optimize for query speed and forget to prepend the mandatory `workspaceId` filter, or they create database views without applying Supabase RLS policies.

**How to avoid:**
- Always prepend `workspaceId` to every search query, even if using full-text search.
- If using raw SQL, parameterize `workspaceId` and never concatenate it into the query string.
- Enable Supabase RLS on any new search-related views or tables.
- Write integration tests that assert a user from workspace A cannot retrieve documents from workspace B via search.

**Warning signs:**
- Staging tests show search results from other workspaces.
- RLS policies missing on new tables or views.
- Raw SQL strings contain unparameterized workspace identifiers.

**Phase to address:**
Dashboard (DASH-01, DASH-02)

---

### Pitfall 7: Client-Side PDF Generation Blocking the Main Thread

**What goes wrong:**
The document composer's PDF preview or download uses client-side libraries (e.g., html2canvas + jsPDF). This freezes the UI for multiple seconds, blows up the JavaScript bundle by 500KB+, and produces poor-quality output on mobile or low-end devices.

**Why it happens:**
Client-side PDF generation seems convenient because it reuses the same DOM as the editor preview. Server-side rendering with headless Chrome or dedicated PDF libraries appears heavier to set up.

**How to avoid:**
- Generate PDFs server-side in a Next.js Route Handler using a lightweight library (`pdf-lib`, `react-pdf` server-side, or a headless Chromium function with caching).
- Stream the generated PDF back to the client; keep the client bundle free of PDF libraries.
- For preview, render the document in an iframe pointing to a preview route that uses the same server-side rendering engine, ensuring WYSIWYG fidelity.

**Warning signs:**
- Bundle analyzer shows massive new dependencies (`html2canvas`, `jspdf`).
- Lighthouse INP score drops after adding PDF feature.
- UI becomes unresponsive after clicking "Gerar PDF".
- Portuguese accents (ç, ã, é) render as garbled characters.

**Phase to address:**
Document Composer (DOCM-01, DOCM-02)

---

### Pitfall 8: Tab Restructure Breaking Deep Links and State

**What goes wrong:**
Restructuring the patient profile into tabs (Visão Geral, Clínico, Documentos, Financeiro) using only client-side React state means the active tab is not reflected in the URL. Users cannot bookmark, share, or refresh to a specific tab; the browser back button behaves unexpectedly.

**Why it happens:**
Tabs are often implemented with a simple `useState` for active index. Persisting tab state in the URL requires additional Next.js routing logic that developers skip.

**How to avoid:**
- Use query parameters (`?tab=clinical`) or Next.js parallel routes to persist active tab state in the URL.
- Update all existing internal links to point to the correct tab segment when relevant.
- If old URLs with hash fragments exist, implement redirects to the new query-param format.
- Preserve scroll position when switching tabs using `scrollRestoration` or manual scroll state.

**Warning signs:**
- Refreshing the page resets to the first tab.
- No `?tab=` or route segment in the URL.
- Users report "I lost my place after clicking back."

**Phase to address:**
Patient Profile Tabs (NAV-01, NAV-02)

---

### Pitfall 9: Template Injection / XSS via Rich Text Templates

**What goes wrong:**
Clinical templates (SOAP, BIRP, livre) are stored as raw HTML strings in the database and injected directly into the rich-text editor or preview pane without sanitization. If templates are ever shared between users, imported, or edited collaboratively, malicious `<script>` tags or event handlers can execute in the clinician's browser.

**Why it happens:**
Rich text editors naturally produce HTML. Storing that HTML directly is the path of least resistance. Without an allowlist or structured format, any HTML—including dangerous elements—gets persisted.

**How to avoid:**
- Store templates in a structured document format (e.g., JSON representing ProseMirror nodes or a custom block structure) rather than raw HTML.
- If HTML must be stored or rendered, sanitize it server-side with DOMPurify or a similar allowlist-based sanitizer before saving and before rendering.
- Never use `dangerouslySetInnerHTML` for template previews without sanitization.

**Warning signs:**
- Database template rows contain `<script>` or `onerror` attributes.
- `dangerouslySetInnerHTML` appears in new component code.
- Security scan flags stored XSS vulnerabilities.

**Phase to address:**
Templates (NOTE-02, DOCM-02)

---

### Pitfall 10: Quick Actions Causing Race Conditions and Missing Validation

**What goes wrong:**
The "mark appointment complete → create note" quick action triggers two separate server actions (or one action that isn't atomic). If the note creation fails, the appointment may be left marked complete without a note, or vice versa. Additionally, quick actions may bypass workspace and role validation because they are treated as "convenience" endpoints.

**Why it happens:**
Quick actions are composed of multiple domain operations that already exist separately. Developers wire them together on the client or in a shallow action without a transaction boundary.

**How to avoid:**
- Encapsulate each quick action in a single Server Action that runs all steps inside a Prisma `$transaction`.
- Validate `workspaceId`, user role, and state machine preconditions (e.g., appointment must be `SCHEDULED`) before any mutation.
- Provide optimistic UI updates with automatic rollback if the transaction fails.
- Ensure every step is logged to the audit trail, just like standalone mutations.

**Warning signs:**
- Duplicate notes appear for a single appointment.
- Appointment status is `COMPLETED` but no note exists.
- Audit trail is missing entries for quick actions.
- Cross-workspace quick actions succeed in integration tests.

**Phase to address:**
Session Flow (FLOW-01, FLOW-02) and Quick Actions (QUICK-01)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|---|---|---|---|
| Storing draft notes in localStorage unencrypted | Fast auto-save, no backend change | PHI breach risk, cross-device loss, shared-device exposure | **Never** — encrypt with Web Crypto or move to server-side drafts |
| Raw Prisma in new Server Actions | Faster initial coding | Bypasses audit trail, soft deletes, workspace scoping | **Never** — always route through repository |
| Client-side PDF generation (html2canvas/jsPDF) | Easier preview, no server setup | Bundle bloat (+500KB), UI freeze, poor mobile, accent issues | **Never** for production — use server-side Route Handler |
| Using `useState` only for tab navigation | Simple implementation | Broken deep links, lost state on refresh | **Never** — use query params or parallel routes |
| Storing templates as raw HTML | Direct compatibility with editor | XSS risk, non-portable, hard to migrate | **Only during spike** — migrate to structured JSON before ship |
| Skipping pagination for timeline MVP | Faster to build | Performance regression, memory bloat, poor UX for long-term patients | **Only if** hard-limited to <20 entries with explicit "ver mais" in MVP |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|---|---|---|
| **Supabase Auth (MFA)** | New server actions not checking AAL level or skipping `resolveSession` | Reuse existing `resolveSession` helper and JWT AAL fast-path; validate session in every new action |
| **Prisma + Soft Deletes** | New queries forgetting `deletedAt: null` | Use repository pattern or Prisma middleware to auto-scope; never rely on manual filtering |
| **Next.js Caching** | New dynamic routes (e.g., `/documentos`) accidentally cached after mutations | Use `revalidatePath` with scope `"page"` after create/update/delete; mark routes as `dynamic` if needed |
| **Rich Text Editor (existing)** | Templates injected as `innerHTML` or `dangerouslySetInnerHTML` | Use the editor's native document model (JSON/block structure); sanitize if an HTML bridge is unavoidable |
| **Supabase RLS** | New search views or draft tables created without RLS policies | Apply RLS to every new table/view; test with a service role vs. anon key |
| **Motion System** | New tabs, modals, and drawers ignoring `prefers-reduced-motion` | Reuse existing motion tokens and `prefers-reduced-motion` media query wrappers for all new animations |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|---|---|---|---|
| Loading full timeline on initial page load | 3s+ TTFB for long-term patients; browser memory spikes | Cursor-based pagination (`take` + `cursor`) + batched note presence query | ~50+ appointments |
| `ILIKE` search on document/note body | DB CPU spikes; query timeout >5s; slow dashboard | Use PostgreSQL `to_tsvector` full-text search with GIN index; search metadata first, content second | ~1,000+ documents per workspace |
| Client-side PDF generation | Lighthouse INP drops; bundle +500KB; UI freeze on mobile | Server-side Route Handler with `pdf-lib` or headless Chromium; stream response | Any document generation |
| Eager loading all tabs at once | Heavy initial patient page load even when user only wants timeline | Lazy load tab content (React.lazy, dynamic imports, or conditional Server Component fetch) | Tabs with many documents/notes/financial records |
| Debounce missing on global search | Database query storm on every keystroke; high connection usage | 300ms debounce on input; abort in-flight requests; use a search endpoint with `cursor` | ~10+ concurrent users searching |
| N+1 in timeline grouping | Prisma query logs show repeated identical queries | Group by month/trimester in SQL/Prisma aggregation, not client-side after full fetch | ~30+ appointments |

## Security Mistakes

| Mistake | Risk | Prevention |
|---|---|---|
| Search results include `importantObservations` | Leak of highly sensitive clinical data; compliance violation | Strict `LIST_SELECT` exclusions; automated tests asserting absence in list responses |
| Draft notes stored in localStorage as plaintext | PHI exposure on shared or compromised devices | Encrypt with Web Crypto API before storage, or use server-side `Draft` table with RLS |
| Template HTML stored unsanitized | Stored XSS if templates are shared, imported, or collaboratively edited | Store templates as structured JSON; sanitize any HTML before render |
| Quick action missing workspace/role validation | Cross-tenant note creation or unauthorized status changes | Validate `workspaceId` and role in every Server Action; reuse existing auth middleware |
| Global search bypasses RLS or workspace scope | Tenant isolation failure; data leakage between practices | Enable RLS on all search views; parameterize `workspaceId` in every query |
| PDF preview route lacks authentication | Unauthorized access to generated clinical documents | Protect preview Route Handler with session validation; use signed URLs or short-lived tokens if sharing |
| localStorage draft keys not scoped by patient | Draft from patient A visible when opening patient B | Namespace keys as `draft:{workspaceId}:{patientId}:{type}` |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---|---|---|
| Single-key shortcuts (`N`, `D`, `E`) | Blocks screen readers, browser navigation, and assistive tech | Use `Ctrl/Cmd+Shift+Key` combos; gate shortcuts when focus is in input fields |
| Auto-save badge too subtle or absent | Clinician anxiety about data loss; distrust of system | High-contrast badge with timestamp: "Salvo localmente às 14:32" → "Salvo no servidor" |
| Timeline cards with excessive detail | Cognitive overload; hard to scan history quickly | Show date + status + note badge only; move communication/details to expandable drawer |
| Tab switch losing scroll position or context | Disorientation; feeling of "starting over" | Preserve scroll position in session state or use shallow routing with URL state |
| PDF preview not matching final downloaded file | Mistrust; clinicians print preview thinking it's final | Use the exact same server-side rendering pipeline for both preview and download |
| Keyboard shortcut help not discoverable | Users never learn available shortcuts | Show a non-intrusive hint (e.g., "Pressione ? para atalhos") on relevant pages |
| Templates presented as rigid boilerplate | Clinicians produce generic, non-personalized notes | Templates should be starting scaffolding, not final text; encourage editing |
| Motion on new tabs/drawers without reduced-motion support | Dizziness or discomfort for motion-sensitive users | Apply existing motion tokens and respect `prefers-reduced-motion` for all new transitions |

## "Looks Done But Isn't" Checklist

- [ ] **Timeline:** Paginação implementada com cursor? — verify `take`/`cursor` presente; teste com 200+ itens
- [ ] **Timeline:** `importantObservations` excluído de toda query de listagem? — verify `LIST_SELECT` não inclui campo
- [ ] **Dashboard Search:** Filtro `workspaceId` presente em *toda* query de busca? — verify com teste de isolamento cross-tenant
- [ ] **Keyboard Shortcuts:** Testado com leitor de tela (NVDA/JAWS)? — verify a11y audit passa sem conflitos
- [ ] **PDF Generation:** Fontes com suporte completo a pt-BR (ç, ã, é, õ)? — verify renderização correta em preview e download
- [ ] **Auto-Save:** Draft criptografado ou armazenado no servidor? — verify localStorage não contém texto clínico legível
- [ ] **Quick Actions:** Transação atômica (appointment + note)? — verify rollback em caso de falha parcial
- [ ] **Tabs:** Estado da aba refletido na URL (deep-linkable)? — verify refresh mantém aba ativa
- [ ] **Templates:** HTML sanitizado / armazenado como JSON estruturado? — verify rejeição de `<script>` e event handlers
- [ ] **New Queries:** `deletedAt: null` e `workspaceId` presentes em *todas* as queries novas? — verify padrão repository
- [ ] **Audit Trail:** Toda mutação nova (incluindo quick actions) gera log de auditoria? — verify tabela `AuditLog`
- [ ] **Tests:** 419 testes existentes continuam passando? — verify `pnpm test` sem regressões

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---|---|---|
| Sensitive field leak in list/search | **HIGH** | Immediate hotfix to add `LIST_SELECT` exclusion; audit access logs; assess need for disclosure |
| Unencrypted localStorage drafts | **MEDIUM** | Migrate to server-side `Draft` table; clear all localStorage draft keys on next logout/deploy |
| Raw Prisma bypassing repository | **LOW** | Refactor queries into repository files retroactively; add missing `deletedAt`/`workspaceId` filters |
| Client-side PDF bloat | **MEDIUM** | Extract PDF logic to Route Handler; remove client PDF libs; cache generated PDFs server-side |
| Accessibility shortcut conflict | **LOW** | Remap shortcuts to modifier combos; release patch; update help modal |
| Cross-workspace search leak | **HIGH** | Audit RLS policies; fix query scoping; rotate API keys if raw SQL was injectable |
| Timeline performance regression | **MEDIUM** | Add pagination retroactively; implement batched note presence query; add DB index on `[workspaceId, patientId, date]` |
| Tab state not in URL | **LOW** | Migrate from `useState` to query params; add redirects for old links |
| Template XSS | **HIGH** | Sanitize existing template DB rows; migrate storage to JSON schema; audit for injected scripts |
| Quick action race condition | **MEDIUM** | Wrap in `$transaction`; add compensating logic for partial failures; backfill missing audit logs |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---|---|---|
| Leaking sensitive fields (`importantObservations`) | Timeline (TIME-01), Dashboard (DASH-01) | Type-check list DTOs; snapshot tests; assert field absence |
| Bypassing repository pattern | All phases | Lint rule banning Prisma imports outside repositories; code review checklist |
| Keyboard shortcut a11y conflicts | Quick Actions (QUICK-01, QUICK-02) | Manual NVDA/JAWS test; axe-core CI gate |
| Unencrypted drafts in localStorage | Note Composer (NOTE-01, NOTE-02) | Inspect localStorage in DevTools; security audit |
| Timeline N+1 / no pagination | Timeline (TIME-01, TIME-02) | Load test with 200+ timeline entries; check Prisma query count |
| Global search workspace leak | Dashboard (DASH-01, DASH-02) | Cross-workspace integration test; RLS policy audit |
| Client-side PDF generation | Document Composer (DOCM-01, DOCM-02) | Bundle analyzer baseline; Lighthouse INP check |
| Tab restructure breaking links | Patient Tabs (NAV-01, NAV-02) | E2E test verifying deep links and refresh behavior |
| Template XSS / raw HTML storage | Templates (NOTE-02, DOCM-02) | HTML injection unit test; DOMPurify integration check |
| Quick action race conditions | Session Flow (FLOW-01, FLOW-02) | E2E test: mark complete → note created atomically; verify audit log |
| Motion regressions | All UI phases | `prefers-reduced-motion` system test; compare against motion.css tokens |
| Existing test regressions | All phases | `pnpm test` must pass before phase merge; zero tolerance for breakage |

## Sources

- [WCAG 2.1 Understanding SC 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html) — HIGH confidence
- [Prisma ORM CRUD & Query Patterns](https://www.prisma.io/docs/orm/prisma-client/queries/crud) — HIGH confidence
- [React `useId` Documentation](https://react.dev/reference/react/useId) — HIGH confidence
- [PsiVault PROJECT.md — Constraints, Decisions, Security Rules](.planning/PROJECT.md) — HIGH confidence
- [PsiVault document-flow-ux-plan.md — UX Audit & Refactor Plan](.planning/document-flow-ux-plan.md) — HIGH confidence
- [Next.js Documentation — Caching & Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing) — MEDIUM confidence
- Author's experience with multi-tenant clinical SaaS systems, HIPAA-aligned architecture, and Next.js App Router performance — MEDIUM confidence

---
*Pitfalls research for: Clinical documentation workflow (timeline, templates, PDF, shortcuts, dashboard) in PsiVault*
*Researched: 2026-04-25*
