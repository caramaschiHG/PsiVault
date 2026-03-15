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
- [ ] **REPO-03**: Implement `PrismaClinicalRepository` and replace in-memory stub
- [ ] **REPO-04**: Implement `PrismaDocumentRepository` and replace in-memory stub
- [ ] **REPO-05**: Implement `PrismaFinanceRepository` and replace in-memory stub
- [ ] **REPO-06**: Implement `PrismaAuditRepository` and replace in-memory stub

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
| REPO-03 | Phase 10 | Pending |
| REPO-04 | Phase 10 | Pending |
| REPO-05 | Phase 11 | Pending |
| REPO-06 | Phase 11 | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after initial definition*
