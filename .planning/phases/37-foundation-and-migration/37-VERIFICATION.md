# Phase 37: Foundation & Migration — Verification

**Verified:** 2026-04-25
**Status:** PASS

---

## Checklist

### Schema & Migration
- [x] `prisma/schema.prisma` extended with `status`, `appointmentId`, `signedAt`, `signedByAccountId`, `deliveredAt`, `deliveredTo`, `deliveredVia`
- [x] All new columns are nullable or have safe defaults
- [x] No existing column removed, renamed, or altered to NOT NULL
- [x] New composite indexes: `[workspaceId, patientId, status]`, `[workspaceId, patientId, createdAt]`, `[appointmentId]`
- [x] Migration SQL created: `prisma/migrations/20260425140000_add_document_lifecycle_fields/migration.sql`
- [x] Migration maps archived documents → `status='archived'`, others → `status='finalized'`

### Domain Model
- [x] `DocumentStatus` type: `"draft" | "finalized" | "signed" | "delivered" | "archived"`
- [x] `VALID_STATUSES` array
- [x] `VALID_DOCUMENT_TYPES` array (single source of truth)
- [x] `PracticeDocument` interface includes all new fields
- [x] `createPracticeDocument` defaults to `status: "finalized"`
- [x] `createDraftDocument` creates with `status: "draft"`
- [x] `archivePracticeDocument` sets `status: "archived"`
- [x] `finalizeDocument` — draft → finalized
- [x] `signDocument` — finalized → signed
- [x] `deliverDocument` — signed → delivered
- [x] All transitions throw on invalid state changes
- [x] Guards: `canEditDocument`, `canFinalizeDocument`, `canSignDocument`, `canDeliverDocument`, `canArchiveDocument`

### Repository
- [x] Interface extended: `listByStatus`, `listDraftsByPatient`, `findByAppointmentId`
- [x] In-memory implementation updated
- [x] Prisma implementation updated with `mapToPrisma` and new methods
- [x] Existing methods (`listActiveByPatient`, `findById`) remain functional

### Audit
- [x] New event types: `document.draft_saved`, `document.finalized`, `document.signed`, `document.delivered`
- [x] Metadata includes `status` (no content, per SECU-05)

### Utilities
- [x] `src/lib/documents/guards.ts` — centralized guards for mutations
- [x] `src/lib/documents/id.ts` — `createDocumentId()` with `doc_` prefix and 32 hex chars

### Tests
- [x] All 419 existing tests pass
- [x] 16 new tests in `tests/document-lifecycle.test.ts`
- [x] Total: 435 tests passing

### Type Safety
- [x] `pnpm tsc --noEmit` — zero errors related to document changes
- [x] Prisma client regenerated with new types

### Data Safety
- [x] No `DROP COLUMN` in migration
- [x] No `ALTER COLUMN ... SET NOT NULL` without default
- [x] All new columns nullable or with safe default
- [x] Existing document tests updated to include new fields

---

## Notes

- Two pre-existing TypeScript errors in `tests/bugfix-regressions.test.ts` are unrelated to this phase (appointment recurrence tests). They existed before Phase 37.
- Migration was not run against production database (no access). SQL file is ready for deployment.
- Zero UI changes in this phase — all backend foundation.

---

*Phase: 37-foundation-and-migration*
*Verification completed: 2026-04-25*
