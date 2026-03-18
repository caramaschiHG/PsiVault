# Requirements: PsiVault

**Defined:** 2026-03-15
**Core Value:** The psychologist can finish a session, register everything correctly in a few minutes, and trust that the clinical and operational history is safe, findable, and under control.

## v1.1 Requirements

Requirements for the Supabase backend migration. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: Setup Supabase project and environment variables
- [ ] **INFRA-02**: Define Prisma schema mirroring all existing domain models
- [ ] **INFRA-03**: Configure Prisma connection pooling (Supavisor) for Next.js serverless

### Authentication

- [ ] **AUTH-01**: Integrate `@supabase/ssr` for cookie-based session management
- [ ] **AUTH-02**: Replace auth stub in `middleware.ts` with Supabase session validation
- [ ] **AUTH-03**: Update sign-in and sign-up flows to use Supabase Auth
- [ ] **AUTH-04**: Map Supabase user to internal Workspace/Account model

### Repositories

- [ ] **REPO-01**: Implement `PrismaPatientRepository` and replace in-memory stub
- [ ] **REPO-02**: Implement `PrismaAgendaRepository` and replace in-memory stub
- [x] **REPO-03**: Implement `PrismaClinicalRepository` and replace in-memory stub
- [x] **REPO-04**: Implement `PrismaDocumentRepository` and replace in-memory stub
- [x] **REPO-05**: Implement `PrismaFinanceRepository` and replace in-memory stub
- [x] **REPO-06**: Implement `PrismaAuditRepository` and replace in-memory stub

## v1.2 Requirements

Requirements for the v1.2 "Lançamento" production milestone. Phases 12–15.

### Authentication UX

- [x] **AUTHUX-01**: Implement a professional sign-in page (email/password) with proper form validation and error messages
- [x] **AUTHUX-02**: Implement a sign-up page with user-friendly onboarding flow using Supabase Auth
- [x] **AUTHUX-03**: Implement a password reset flow (request reset email + update password page)
- [x] **AUTHUX-04**: Handle Supabase Auth errors gracefully with user-facing Portuguese messages
- [x] **AUTHUX-05**: Protect auth pages from authenticated users (redirect logged-in users away from login/signup)

### UI/UX Polish

- [x] **UIUX-01**: Establish a consistent design system — typography scale, color palette, spacing tokens, and border-radius applied throughout
- [x] **UIUX-02**: Apply professional visual design to all primary views (inicio, agenda, patients list, patient profile, financeiro)
- [x] **UIUX-03**: Ensure all pages are fully responsive across mobile, tablet, and desktop viewports
- [x] **UIUX-04**: Achieve WCAG 2.1 AA color contrast ratios on all interactive elements and body text
- [x] **UIUX-05**: Add proper empty states, loading states, and error states to all data-dependent pages
- [x] **UIUX-06**: Polish navigation — clear active states, breadcrumbs where helpful, smooth transitions

### Quality & Production Hardening

- [x] **QUAL-01**: Replace the re-auth gate stub in export/backup routes with the real `evaluateSensitiveAction` flow
- [x] **QUAL-02**: Add structured error boundaries to all route segments to prevent white-screen crashes
- [ ] **QUAL-03**: Harden all server actions — validate inputs, handle Prisma errors, return typed error responses
- [x] **QUAL-04**: Ensure workspace audit trail is complete — remove the `auditEvents: never[]` stub from backup
- [x] **QUAL-05**: Security review — confirm no sensitive data leaks in search, audit, or dashboard surfaces (SECU-05 audit)
- [x] **QUAL-06**: Ensure all domain tests pass against Prisma implementations (no in-memory repository leakage)

### Deployment Readiness

- [ ] **DEPLOY-01**: Configure production environment variables for Supabase, Prisma, and Next.js
- [ ] **DEPLOY-02**: Verify the application builds and starts cleanly in production mode (`next build`)
- [x] **DEPLOY-03**: Confirm Prisma migrations are applied and the production database schema is correct

## v2 Requirements

### Storage
- **STOR-01**: Migrate document storage to Supabase Storage buckets

### Realtime
- **REAL-01**: Implement Supabase Realtime for instant updates across devices

## Out of Scope

| Feature | Reason |
|---------|--------|
| Row Level Security (RLS) | V1 architecture enforces tenancy via server actions and `workspaceId` queries; direct DB client access is not used, so Prisma service-role is sufficient for now. |
| Existing data migration | The v1.0 MVP used in-memory stores, so there is no production data to migrate. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 7 | Pending |
| INFRA-02 | Phase 7 | Pending |
| INFRA-03 | Phase 7 | Pending |
| AUTH-01 | Phase 8 | Pending |
| AUTH-02 | Phase 8 | Pending |
| AUTH-03 | Phase 8 | Pending |
| AUTH-04 | Phase 8 | Pending |
| REPO-01 | Phase 9 | Pending |
| REPO-02 | Phase 9 | Pending |
| REPO-03 | Phase 10 | Complete |
| REPO-04 | Phase 10 | Complete |
| REPO-05 | Phase 11 | Complete |
| REPO-06 | Phase 11 | Complete |
| AUTHUX-01 | Phase 12 | Complete |
| AUTHUX-02 | Phase 12 | Complete |
| AUTHUX-03 | Phase 12 | Complete |
| AUTHUX-04 | Phase 12 | Complete |
| AUTHUX-05 | Phase 12 | Complete |
| UIUX-01 | Phase 13 | Complete |
| UIUX-02 | Phase 13 | Complete |
| UIUX-03 | Phase 13 | Complete |
| UIUX-04 | Phase 13 | Complete |
| UIUX-05 | Phase 13 | Complete |
| UIUX-06 | Phase 13 | Complete |
| QUAL-01 | Phase 14 | Complete |
| QUAL-02 | Phase 14 | Complete |
| QUAL-03 | Phase 14 | Pending |
| QUAL-04 | Phase 14 | Complete |
| QUAL-05 | Phase 14 | Complete |
| QUAL-06 | Phase 14 | Complete |
| DEPLOY-01 | Phase 14 | Pending |
| DEPLOY-02 | Phase 14 | Pending |
| DEPLOY-03 | Phase 14 | Complete |

**Coverage:**
- v1.1 requirements: 13 total
- v1.2 requirements: 20 total
- Mapped to phases: 33
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-17 after v1.2 milestone requirements added*
