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

**Success Criteria:**
1. `PrismaClinicalRepository` implements all methods of `ClinicalRepository`
2. `PrismaDocumentRepository` implements all methods of `DocumentRepository`
3. Clinical notes and generated documents persist across server restarts
4. All existing Clinical and Document domain tests pass against the new Prisma implementations

---

## Phase 11: Finance & Ops Persistence
**Goal:** Replace in-memory finance and audit repositories with Prisma implementations.
**Requirements:** REPO-05, REPO-06

**Success Criteria:**
1. `PrismaFinanceRepository` implements all methods of `FinanceRepository`
2. `PrismaAuditRepository` implements all methods of `AuditRepository`
3. Financial charges and audit events persist across server restarts
4. All existing Finance and Audit domain tests pass against the new Prisma implementations
5. The application is fully functional end-to-end without any in-memory state leakage