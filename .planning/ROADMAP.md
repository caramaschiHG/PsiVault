# Execution Roadmap: PsiVault v1.1

## Phase 7: Infrastructure Foundation
**Goal:** Establish the production database and ORM layer connected to Supabase.
**Requirements:** INFRA-01, INFRA-02, INFRA-03

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

**Plans:** 3 plans

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

**Success Criteria:**
1. The export/backup re-auth gate uses the real `evaluateSensitiveAction` flow (no cookie stub)
2. All route segments have error boundaries preventing white-screen crashes
3. All server actions validate inputs and return typed error responses for Prisma and auth failures
4. Workspace backup includes a real audit trail (no `auditEvents: never[]` stub)
5. SECU-05 audit confirms no sensitive clinical or financial data leaks to search, audit, or dashboard surfaces
6. All domain tests pass against Prisma implementations with zero in-memory repository usage
7. `next build` completes without errors and the app starts cleanly in production mode
8. Production environment variables are documented and configured for Supabase and Next.js
