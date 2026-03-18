# Execution Roadmap: PsiVault v1.1

## Phase 7: Infrastructure Foundation
**Goal:** Establish the production database and ORM layer connected to Supabase.
**Requirements:** INFRA-01, INFRA-02, INFRA-03

**Plans:** 2 plans

Plans:
- [ ] 07-01-PLAN.md — Provisionar Supabase e preencher .env com credenciais reais (checkpoint humano)
- [ ] 07-02-PLAN.md — Aplicar migrações Prisma ao banco real e verificar conectividade (smoke test)

**Success Criteria:**
1. Supabase project is provisioned and connection strings are in local `.env`
2. `schema.prisma` is fully defined and successfully migrated to the Supabase database
3. Prisma client can connect via Supavisor pool without exhaustion in test scripts

---

## Phase 8: Authentication & Workspaces
**Goal:** Replace the v1.0 auth stub with real Supabase authentication.
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04

**Success Criteria:**
1. Users can sign up and sign in using email/password via Supabase Auth
2. `middleware.ts` correctly reads and refreshes the Supabase session cookie
3. Protected routes correctly redirect unauthenticated users to the sign-in page
4. The authenticated user ID maps correctly to a persistent `Workspace` and `Account` in the database

---

## Phase 9: Patient & Agenda Persistence
**Goal:** Replace in-memory patient and agenda repositories with Prisma implementations.
**Requirements:** REPO-01, REPO-02

**Success Criteria:**
1. `PrismaPatientRepository` implements all methods of `PatientRepository`
2. `PrismaAgendaRepository` implements all methods of `AgendaRepository`
3. Creating, editing, and listing patients and appointments persists across server restarts
4. All existing Patient and Agenda domain tests pass against the new Prisma implementations

---

## Phase 10: Clinical & Document Persistence
**Goal:** Replace in-memory clinical and document repositories with Prisma implementations.
**Requirements:** REPO-03, REPO-04

**Plans:** 3/3 plans complete

Plans:
- [ ] 10-01-PLAN.md — Extend schema.prisma with ClinicalNote + PracticeDocument models and run migration
- [ ] 10-02-PLAN.md — Implement PrismaClinicalRepository and swap clinical store.ts
- [ ] 10-03-PLAN.md — Implement PrismaDocumentRepository and swap document store.ts

**Success Criteria:**
1. `PrismaClinicalRepository` implements all methods of `ClinicalRepository`
2. `PrismaDocumentRepository` implements all methods of `DocumentRepository`
3. Clinical notes and generated documents persist across server restarts
4. All existing Clinical and Document domain tests pass against the new Prisma implementations

---

## Phase 11: Finance & Ops Persistence
**Goal:** Replace in-memory finance and audit repositories with Prisma implementations.
**Requirements:** REPO-05, REPO-06

**Plans:** 3/3 plans complete

Plans:
- [ ] 11-01-PLAN.md — Extend schema.prisma with SessionCharge, AuditEvent, Reminder models; migrate interfaces to async
- [ ] 11-02-PLAN.md — Implement PrismaFinanceRepository and PrismaReminderRepository; swap store.ts files
- [ ] 11-03-PLAN.md — Implement PrismaAuditRepository; create centralized audit store; consolidate action file stubs; wire backup route

**Success Criteria:**
1. `PrismaFinanceRepository` implements all methods of `FinanceRepository`
2. `PrismaAuditRepository` implements all methods of `AuditRepository`
3. Financial charges and audit events persist across server restarts
4. All existing Finance and Audit domain tests pass against the new Prisma implementations
5. The application is fully functional end-to-end without any in-memory state leakage

---

# Execution Roadmap: PsiVault v1.2 "Lançamento"

## Phase 12: Authentication UX
**Goal:** Replace stub/minimal auth pages with a professional, user-friendly authentication experience using Supabase Auth.
**Requirements:** AUTHUX-01, AUTHUX-02, AUTHUX-03, AUTHUX-04, AUTHUX-05

**Plans:** 4/4 plans complete

Plans:
- [ ] 12-01-PLAN.md — Fundamentos: auth-errors.ts, SubmitButton, updateSession com user
- [ ] 12-02-PLAN.md — Sign-in e sign-up com erros inline, erros por campo, SubmitButton
- [ ] 12-03-PLAN.md — Reset-password dual-state + server actions requestPasswordReset/updatePassword
- [ ] 12-04-PLAN.md — Middleware AUTHUX-05: redirect de autenticados em rotas de auth

**Success Criteria:**
1. A polished sign-in page with email/password form, validation, and Portuguese error messages is live at `/login`
2. A sign-up page guides new users through account creation with clear feedback
3. A password reset flow allows users to request a reset email and set a new password
4. Authenticated users visiting `/login` or `/signup` are redirected to `/inicio`
5. Supabase Auth errors are caught and displayed as human-readable Portuguese messages

---

## Phase 13: UI/UX Polish
**Goal:** Apply a professional, consistent design system across all views so the product feels production-ready.
**Requirements:** UIUX-01, UIUX-02, UIUX-03, UIUX-04, UIUX-05, UIUX-06

**Plans:** 4/4 plans complete

Plans:
- [ ] 13-01-PLAN.md — Tokens tipográficos, espaçamento, skeleton-pulse e classes responsivas em globals.css
- [ ] 13-02-PLAN.md — Sidebar dark redesign, BottomNav mobile, atualização de layout.tsx
- [ ] 13-03-PLAN.md — loading.tsx e error.tsx para 5 rotas vault (inicio, agenda, patients, patients/[patientId], financeiro)
- [ ] 13-04-PLAN.md — EmptyState component e polish visual das 5 views primárias + checkpoint de verificação

**Success Criteria:**
1. A design system document (tokens: typography, color, spacing, radius) is defined and applied consistently across all pages
2. All primary views (inicio, agenda, patients list, patient profile, financeiro) have professional, polished layouts
3. All pages are fully responsive and usable on mobile (375px) through desktop (1440px)
4. All text and interactive elements meet WCAG 2.1 AA color contrast (4.5:1 for body, 3:1 for large/UI elements)
5. Every data-dependent page has defined empty states, loading states, and error states
6. Navigation has clear active-state indicators and smooth, professional transitions

---

## Phase 14: Quality & Production Hardening
**Goal:** Harden the application for real-world use — secure routes, robust error handling, complete audit trail, and verified deployment readiness.
**Requirements:** QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, QUAL-06, DEPLOY-01, DEPLOY-02, DEPLOY-03

**Plans:** 6/6 plans complete

Plans:
- [ ] 14-01-PLAN.md — Re-auth gate real: substituir stub por signInWithPassword em confirmBackupAuthAction e exportPatientAuthAction
- [ ] 14-02-PLAN.md — Error boundaries: criar error.tsx em sessions/[appointmentId] e patients/[patientId]/documents
- [ ] 14-03-PLAN.md — Try/catch em todas as server actions de mutação (7 arquivos)
- [ ] 14-04-PLAN.md — Auditoria QUAL-04/05/06 + postinstall para migrations Vercel
- [ ] 14-05-PLAN.md — Build verification, .env.example, e checkpoint de lançamento

**Success Criteria:**
1. The export/backup re-auth gate uses the real `evaluateSensitiveAction` flow (no cookie stub)
2. All route segments have error boundaries preventing white-screen crashes
3. All server actions validate inputs and return typed error responses for Prisma and auth failures
4. Workspace backup includes a real audit trail (no `auditEvents: never[]` stub)
5. SECU-05 audit confirms no sensitive clinical or financial data leaks to search, audit, or dashboard surfaces
6. All domain tests pass against Prisma implementations with zero in-memory repository usage
7. `next build` completes without errors and the app starts cleanly in production mode
8. Production environment variables are documented and configured for Supabase and Next.js

---

## Phase 15: Planning Metadata Realignment
**Goal:** Normalize milestone metadata and phase locations so GSD can audit, plan, and archive the current launch scope consistently.
**Requirements:** —
**Gap Closure:** Closes audit integration gap "Planning metadata -> Milestone completion workflow" and flow "Milestone closure / archive"

**Success Criteria:**
1. The active milestone version is consistent across `PROJECT.md`, `STATE.md`, and `ROADMAP.md`
2. Phase artifacts 07 and 08 are available in the active `.planning/phases/` tree or a documented equivalent recognized by GSD
3. GSD phase discovery and next-phase resolution no longer conflict with roadmap reality
4. The milestone boundary for the current launch scope is documented unambiguously

---

## Phase 16: Infrastructure Verification Closure
**Goal:** Convert Phase 07 infrastructure work from summary-only evidence into verified milestone closure.
**Requirements:** INFRA-01, INFRA-02, INFRA-03
**Gap Closure:** Closes audit requirement gaps `INFRA-01`, `INFRA-02`, `INFRA-03`

**Success Criteria:**
1. Supabase project and local environment configuration are re-verified with current evidence
2. Prisma schema and migration state are verified against the real database state
3. Connection pooling and connectivity checks are captured in compliant validation/verification artifacts
4. Requirements traceability can mark all infrastructure requirements complete with structured evidence

---

## Phase 17: Authentication Verification Closure
**Goal:** Convert Phase 08 authentication implementation from summary-only evidence into verified milestone closure.
**Requirements:** AUTH-01, AUTH-02, AUTH-03
**Gap Closure:** Closes audit requirement gaps `AUTH-01`, `AUTH-02`, `AUTH-03`

**Success Criteria:**
1. Cookie-based Supabase session management is re-verified in the live app
2. `middleware.ts` route protection and session refresh behavior are verified end-to-end
3. Sign-in and sign-up flows are verified against current Supabase Auth behavior
4. Compliant validation/verification artifacts exist for Phase 08 and requirements can be closed structurally

---

## Phase 18: Workspace Identity & Persistence Integrity
**Goal:** Remove hardcoded workspace identity from the live app and verify patient/agenda persistence under authenticated workspace scope.
**Requirements:** AUTH-04, REPO-01, REPO-02
**Gap Closure:** Closes audit requirement gaps `AUTH-04`, `REPO-01`, `REPO-02`; closes integration gap "Supabase Auth -> Workspace-scoped vault data access"; closes flow "Authenticated professional sees only their own workspace data"

**Success Criteria:**
1. Vault routes, server actions, search, backup, and export resolve workspace/account from the authenticated Supabase user instead of `ws_1`
2. Workspace/account binding is enforced consistently across repository entry points
3. Patient and agenda persistence are verified under the real workspace-scoped access model
4. Structured verification artifacts prove end-to-end multi-user-safe behavior for auth plus persistence flows

---

## Phase 19: UI Launch Verification
**Goal:** Produce independent verification for the production UI/UX layer so launch polish requirements are auditable.
**Requirements:** UIUX-01, UIUX-02, UIUX-03, UIUX-04, UIUX-05, UIUX-06
**Gap Closure:** Closes audit requirement gaps `UIUX-01`–`UIUX-06`; closes flow "UI/UX launch sign-off"

**Success Criteria:**
1. Phase 13 has compliant validation and verification artifacts covering all six UIUX requirements
2. Responsive behavior is verified across mobile and desktop launch breakpoints
3. Accessibility and contrast checks are documented with requirement-level evidence
4. Loading, error, empty-state, and navigation polish are verified on the primary vault surfaces

---

## Phase 20: Production Readiness Sign-off
**Goal:** Close the remaining human-needed runtime and deployment confidence checks before milestone archival.
**Requirements:** DEPLOY-02
**Gap Closure:** Closes audit requirement gap `DEPLOY-02`; closes flow "Production readiness sign-off"

**Success Criteria:**
1. Build and production-start verification are rerun and captured with current evidence
2. Remaining runtime auth/error-boundary checks from Phase 14 are completed or replaced with executable verification
3. Phase 14 verification no longer depends on unresolved human-needed launch gates
4. Requirements traceability can mark `DEPLOY-02` complete with structured supporting evidence
