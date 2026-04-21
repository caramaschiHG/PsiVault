# Project Research Summary

**Project:** PsiVault
**Domain:** Gestão Financeira, Emissão de Documentos Clínicos (SaaS Psicanálise)
**Researched:** 2026-04-21
**Confidence:** HIGH

## Executive Summary

PsiVault is a SaaS for psychologists, requiring a mature, secure, and calm financial module that strictly avoids fintech hype and respects clinical confidentiality. The financial system needs to handle simple expense tracking, dynamic PDF receipt generation for patients, and a clear view of cash flow and outstanding payments, without overwhelming the user with accounting jargon.

The recommended approach builds upon the existing Next.js 15 App Router architecture. It utilizes Server Actions for lightweight mutations, a Drawer-based UI to keep users in context without breaking browser history, and strictly enforces the Repository Pattern for database interactions to prevent multi-tenant data leaks. PDF receipts are generated on-the-fly rather than stored, saving space and avoiding immutable errors in static files.

Key risks include modal state management breaking browser history, Vercel serverless timeouts during PDF generation, and multi-tenant data leaks during complex DB aggregations. These are mitigated by using URL-based state for modals, streaming PDFs directly with lightweight libraries (`@react-pdf/renderer`), and isolating all aggregation logic within the Repository layer to enforce `workspaceId` scoping.

## Key Findings

### Recommended Stack

The stack prioritizes a lean bundle, utilizing existing tools and native browser features over heavy third-party libraries.

**Core technologies:**
- **Next.js Server Actions (15.2+):** Mutations para CRUD de Despesas — Elimina necessidade de APIs pesadas, mantendo o bundle super lean.
- **Native HTML `<dialog>`:** Modais e Drawers (Acessibilidade) — Zero JS de dependência externa, suporte nativo WCAG, sem impactar o bundle.
- **@react-pdf/renderer (^4.3.2):** Geração de Recibos em PDF — Declarativo, já no `package.json`, suporte a React 19 e SSR/Client.

### Expected Features

**Must have (table stakes):**
- Lançamento de Despesas (CRUD com categorias)
- Emissão de Recibo em PDF (com cruzamento de dados do Psi e Paciente)
- Dashboard Financeiro Claro (visão rápida de saldos)
- Controle de Inadimplência (destaque visual para atrasos)

**Should have (competitive):**
- DRE Simples (Visão de lucro/prejuízo mensal)
- Exportação para o Contador (CSV/Excel para Carnê-Leão)

**Defer (v2+):**
- Envio de Recibo por Email/WhatsApp
- Emissão de Nota Fiscal (NFS-e)
- Integração Bancária (Open Finance)

### Architecture Approach

The architecture separates UI state from server mutations and delegates complex data operations to the database.

**Major components:**
1. **`FinanceDashboard` & Server Actions:** Server Component managing the layout, paired with `actions.ts` for handling CRUD operations and workspace validation.
2. **Drawer-based CRUD (`ExpenseDrawer`):** Client components using URL state to handle form inputs without losing context of the financial overview.
3. **`FinanceRepository`:** The sole interface to Prisma, responsible for `workspaceId` scoping and database-level aggregations (e.g., `groupBy` for DRE).
4. **On-the-fly PDF Generation:** A dedicated `pdf-generator.ts` service that streams receipts directly to the client without saving static files in Supabase Storage.

### Critical Pitfalls

1. **Modals Breaking Browser History:** Local state modals prevent deep-linking and back-button usage. Avoid by syncing drawer state with URL Search Params.
2. **Serverless Timeouts (Vercel) on PDF Generation:** Heavy PDF tools cause timeouts. Avoid by using `@react-pdf/renderer` and streaming directly instead of saving to disk.
3. **Multi-tenant Data Leaks in DRE:** Complex `groupBy` queries missing tenant scopes. Avoid by forcing `workspaceId` as a mandatory parameter in the Repository layer before any aggregation.
4. **Rigid DB Structure Breaking Historical Data:** New required fields crashing old views. Avoid by adding new fields as optional or with safe defaults, and planning data backfills.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Modelagem e Banco de Dados (Despesas)
**Rationale:** Schema updates must be completed and migrated before any new feature logic can be built.
**Delivers:** Prisma schema updates for `Expense` and `Receipt`, plus initial database migrations.
**Addresses:** Lançamento de Despesas.
**Avoids:** Rigid DB structure breaking historical data.

### Phase 2: Refatoração UX/UI Finanças & Repository Layer
**Rationale:** Establishes the visual and data access foundations required by the new financial features.
**Delivers:** `FinanceRepository` implementation, updated `FinanceDashboard`, and base Drawer/Modal components synced with URL state.
**Uses:** Native HTML `<dialog>`, CSS Tokens.
**Implements:** `FinanceDashboard`, `FinanceRepository`.
**Avoids:** Modals breaking browser history.

### Phase 3: Módulo de Despesas (CRUD)
**Rationale:** Core financial functionality that builds directly upon the newly created UI patterns and database schema.
**Delivers:** `ExpenseDrawer` component and Next.js Server Actions for creating, updating, and deleting expenses.
**Addresses:** Lançamento de Despesas, Dashboard Financeiro Claro.
**Uses:** Next.js Server Actions.

### Phase 4: Emissão de Recibos PDF
**Rationale:** High-value deliverable that is functionally independent from expenses, utilizing existing session data.
**Delivers:** `pdf-generator.ts` service, `ReceiptModal` UI, and download streaming endpoints.
**Addresses:** Emissão de Recibo em PDF.
**Uses:** `@react-pdf/renderer`.
**Avoids:** Vercel serverless timeouts; saving static PDFs in Supabase storage.

### Phase 5: Relatórios Consolidados (DRE Simples)
**Rationale:** Depends on both income (sessions) and outgoings (expenses) being fully implemented to provide an accurate cash flow view.
**Delivers:** Monthly cash flow UI and database aggregation logic.
**Addresses:** DRE Simples, Controle de Inadimplência.
**Implements:** Database-level aggregations in `FinanceRepository`.
**Avoids:** Multi-tenant data leaks; JS-side float math errors.

### Phase Ordering Rationale

- **Database First:** Schema changes dictate the shape of the UI and Repository.
- **UI/UX Foundation Second:** Avoids building CRUD features on top of obsolete inline-table patterns.
- **Feature Parallelization:** Once UI and DB are set, Expenses (Phase 3) and Receipts (Phase 4) can technically be developed in parallel before converging on Reports (Phase 5).
- **Reports Last:** Aggregations and visual charts require the data sources (expenses and paid sessions) to be fully modeled and accessible.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Emissão de Recibos PDF):** Needs validation on the best way to stream `@react-pdf/renderer` output through Next.js 15 Server Actions in a Vercel Edge/Serverless environment without triggering memory limits.

Phases with standard patterns (skip research-phase):
- **Phase 1, 2, 3, 5:** Standard Next.js, Prisma, and UI composition patterns. Well-documented within the project's existing architecture.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Validated compatibility with Next.js 15 and App Router constraints. |
| Features | HIGH | Strongly aligned with CRP requirements and actual clinical needs. |
| Architecture | HIGH | Utilizes standard Next.js App Router and Repository patterns. |
| Pitfalls | HIGH | Known edge cases around Vercel limits and Prisma aggregations explicitly addressed. |

**Overall confidence:** HIGH

### Gaps to Address

- **PDF Streaming Limits:** Need to closely monitor execution time and memory during Vercel Preview testing. If timeouts occur, we may need to fallback to a lightweight Web Worker approach or a dedicated microservice.
- **URL State Management:** Need to finalize the approach for syncing Drawer state with the URL (e.g., using a library like `nuqs` vs standard `useSearchParams` hook) during Phase 2 planning.

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md` — Strict architectural and visual constraints (CSS tokens, zero Tailwind, 102 kB bundle limit).
- Context7 `/diegomura/react-pdf` — Validated support for React 19 SSR.
- Context7 `/recharts/recharts` — Documented support for React 16 to 19.

### Secondary (MEDIUM confidence)
- Next.js Intercepting Routes & Nuqs (URL State Management)
- Prisma Analytics & Aggregations Best Practices
- Supabase RLS & Storage Security Guidelines

---
*Research completed: 2026-04-21*
*Ready for roadmap: yes*