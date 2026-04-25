# Phase 37: Foundation & Migration — Plan

**Status:** Ready for execution
**Phase:** 37
**Name:** Foundation & Migration
**Depends on:** Phase 36
**Context:** `.planning/phases/37-foundation-and-migration/37-CONTEXT.md`

---

## Goal

Data layer e domain model preparados para o ciclo de vida completo de documentos, com migração 100% segura de documentos existentes em produção. Zero downtime, zero perda de dados.

---

## Wave 1: Schema & Migration (Day 1)

### Plan 37-01: Schema Extension with Safe Migration

**Objective:** Adicionar colunas novas ao `PracticeDocument` com migration zero-downtime.

**Tasks:**
1. **Edit `prisma/schema.prisma`:**
   - Add `status String @default("finalized") @map("status")`
   - Add `appointmentId String? @map("appointment_id")`
   - Add `signedAt DateTime? @map("signed_at")`
   - Add `signedByAccountId String? @map("signed_by_account_id")`
   - Add `deliveredAt DateTime? @map("delivered_at")`
   - Add `deliveredTo String? @map("delivered_to")`
   - Add `deliveredVia String? @map("delivered_via")`
   - Add new indexes: `@@index([workspaceId, patientId, status])`, `@@index([workspaceId, patientId, createdAt])`, `@@index([appointmentId])`
   - Keep ALL existing fields untouched

2. **Generate migration:**
   - `pnpm prisma migrate dev --name add_document_lifecycle_fields`
   - Review generated SQL: ensure all new columns have `NULL` default and no `ALTER COLUMN` on existing fields

3. **Create data migration script** (if not handled by Prisma migrate):
   - SQL: `UPDATE practice_documents SET status = 'archived' WHERE archived_at IS NOT NULL;`
   - SQL: `UPDATE practice_documents SET status = 'finalized' WHERE archived_at IS NULL;`

4. **Verify migration safety:**
   - Run `pnpm prisma migrate diff` to confirm no destructive changes
   - Check: no column drops, no type changes on existing columns, no NOT NULL without default

**Success Criteria:**
- Migration applies cleanly in empty database
- Migration applies cleanly in database with existing documents (test with seed data)
- All existing documents get correct status mapping

**Verification:**
- `pnpm prisma db execute --file <migration.sql>` in test container
- Query count of documents per status matches count of archived vs active

---

## Wave 2: Domain Model Extension (Day 1-2)

### Plan 37-02: DocumentStatus Type and State Transitions

**Objective:** Introduzir `DocumentStatus` e funções puras de transição no domain model.

**Tasks:**
1. **Edit `src/lib/documents/model.ts`:**
   - Add `DocumentStatus` type: `"draft" | "finalized" | "signed" | "delivered" | "archived"`
   - Add `VALID_STATUSES` array
   - Update `PracticeDocument` interface to include new fields
   - Add `finalizeDocument(doc, accountId, {now})` — sets `status: "finalized"`, validates current status is "draft"
   - Add `signDocument(doc, accountId, {now})` — sets `status: "signed"`, `signedAt`, `signedByAccountId`; validates current status is "finalized"
   - Add `deliverDocument(doc, accountId, {now}, {to, via})` — sets `status: "delivered"`, `deliveredAt`, `deliveredTo`, `deliveredVia`; validates current status is "signed"
   - Add `createDraftDocument(...)` factory — creates with `status: "draft"`
   - Update `createPracticeDocument` to default `status: "draft"` (or keep `"finalized"` for backward compat during transition — decide in execution)
   - Update `archivePracticeDocument` to also set `status: "archived"`
   - Add guard helpers: `canEditDocument(doc)`, `canFinalizeDocument(doc)`, `canSignDocument(doc)`, `canDeliverDocument(doc)`

2. **Update `src/lib/documents/repository.ts`:**
   - Add `listByStatus(workspaceId, patientId, status)`
   - Add `listDraftsByPatient(workspaceId, patientId)`
   - Add `findByAppointmentId(workspaceId, appointmentId)`
   - Add `listActiveByPatientWithStatus(workspaceId, patientId)` — returns with status field
   - Keep all existing methods for backward compatibility

3. **Update `src/lib/documents/repository.prisma.ts`:**
   - Implement new methods
   - Update `mapToDomain` to include new fields (with proper null handling)
   - Update `mapToPrisma` to include new fields

4. **Update `src/lib/documents/store.ts`:**
   - No changes needed if repository interface updated correctly

**Success Criteria:**
- All document domain functions have unit tests
- State transition guards work correctly (invalid transitions return errors)
- Repository in-memory implementation supports new methods

**Verification:**
- `pnpm test` passes
- New unit tests: `documents/model.test.ts` covers all state transitions

---

## Wave 3: Audit Extension (Day 2)

### Plan 37-03: Document Lifecycle Audit Events

**Objective:** Adicionar novos tipos de audit event para transições de estado.

**Tasks:**
1. **Edit `src/lib/documents/audit.ts`:**
   - Add `document.draft_saved` event type
   - Add `document.finalized` event type
   - Add `document.signed` event type
   - Add `document.delivered` event type
   - Ensure metadata includes `documentType` and `status` (no content, per SECU-05)

2. **Update existing actions (if touched):**
   - `createDocumentAction` emits `document.draft_saved` when creating draft
   - `archiveDocumentAction` already emits `document.archived` — keep as-is

**Success Criteria:**
- Audit events cover all lifecycle transitions
- Metadata never includes document content

**Verification:**
- Unit tests for audit event creation

---

## Wave 4: Cross-Patient Guard & Security Utilities (Day 2)

### Plan 37-04: Centralized Security Guards

**Objective:** Eliminar duplicação de cross-patient guards e adicionar validações faltantes.

**Tasks:**
1. **Create `src/lib/documents/guards.ts`:**
   - `assertDocumentBelongsToPatient(doc, patientId)` — throws or returns error
   - `assertDocumentNotArchived(doc)` — throws or returns error
   - `assertCanAccessDocument(doc, workspaceId, accountId)` — validates workspace + ownership

2. **Create `src/lib/patients/guards.ts` (if not exists):**
   - `assertPatientBelongsToWorkspace(patient, workspaceId)`

3. **Refactor existing actions to use guards (Phase 42 cleanup, but start here):**
   - Update `createDocumentAction` to validate patient belongs to workspace before creating
   - Update `archiveDocumentAction` to use centralized guard
   - Update `updateDocumentAction` to use centralized guard

**Success Criteria:**
- Zero duplication of cross-patient/workspace validation logic
- All actions validate workspace ownership before mutation

**Verification:**
- Unit tests for guards
- Integration tests verify actions reject cross-workspace attempts

---

## Wave 5: ID Consistency Fix (Day 2)

### Plan 37-05: Consistent Document ID Generation

**Objective:** Corrigir IDs inconsistentes em actions existentes.

**Tasks:**
1. **Audit all ID generation in document actions:**
   - `createDocumentAction`: check current ID format
   - `archiveDocumentAction`: check current ID format
   - `updateDocumentAction`: check current ID format

2. **Create `src/lib/documents/id.ts` (or use shared util):**
   - `createDocumentId()` — consistent `doc_` + 16 bytes hex (32 chars)

3. **Update all actions to use consistent ID generator**

**Success Criteria:**
- All document IDs follow `doc_` + 32 hex chars format
- No hardcoded `generateId` calls with different lengths

**Verification:**
- Grep for `doc_` ID generation patterns
- Unit test for ID format

---

## Verification Plan

### Pre-execution checks
- [ ] Schema changes reviewed for destructive operations
- [ ] Migration tested against database with 10k+ synthetic documents
- [ ] All existing tests (419) still pass

### Post-execution checks
- [ ] New unit tests: 20+ covering domain model, repository, guards, IDs
- [ ] Integration test: create document → verify status = "draft" → finalize → sign → deliver → archive
- [ ] Migration test: run migration on backup schema, verify all documents get correct status
- [ ] TypeScript: zero errors (`pnpm tsc --noEmit`)

### Data Safety Checklist
- [ ] No `DROP COLUMN` in migration
- [ ] No `ALTER COLUMN ... SET NOT NULL` without default
- [ ] All new columns are nullable
- [ ] Existing data preserved in 100% of test cases
- [ ] Rollback script documented (reverse migration steps)

---

## Dependencies

| Plan | Depends on | Reason |
|------|-----------|--------|
| 37-02 | 37-01 | Domain model needs schema fields to exist for Prisma types |
| 37-03 | 37-02 | Audit events reference document status from domain model |
| 37-04 | 37-02 | Guards use domain model types |
| 37-05 | 37-02 | ID consistency touches actions that use domain model |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Migration fails in production | Low | Critical | Test migration with production-like data volume; keep backup; all new columns nullable |
| Domain model change breaks existing actions | Medium | High | Keep existing factories backward-compatible; update actions incrementally |
| Index creation locks table | Low | Medium | PostgreSQL 14+ creates indexes concurrently by default in Prisma; verify |
| Tests fail due to new required fields | Medium | Medium | All new fields have defaults or are nullable; update test factories |

---

## Deferred to Phase 38+

- UI changes (listagem com badges, filtros) — Phase 38
- Server-side auto-save — Phase 38
- Editor unificado — Phase 39
- PDF universal — Phase 39
- Appointment linkage UI — Phase 40
- Dashboard /documentos — Phase 41
- Remoção de código legado — Phase 42

---

*Phase: 37-foundation-and-migration*
*Plan created: 2026-04-25*
*Ready for execution*
