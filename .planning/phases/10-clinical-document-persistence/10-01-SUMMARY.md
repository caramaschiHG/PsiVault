---
phase: 10-clinical-document-persistence
plan: 01
subsystem: database
tags: [prisma, postgresql, supabase, schema, migration, clinical-notes, documents]

# Dependency graph
requires:
  - phase: 09-patient-and-agenda-persistence
    provides: Patient and Appointment Prisma models with FK relations
provides:
  - ClinicalNote Prisma model with @unique appointmentId (one-to-one), CASCADE to Appointment/Patient/Workspace
  - PracticeDocument Prisma model with type/content as plain String, CASCADE to Patient/Workspace
  - Back-relation fields on Workspace (clinicalNotes, documents), Patient (clinicalNotes, documents), Appointment (clinicalNote?)
  - Migration SQL for clinical_notes and practice_documents tables
  - Regenerated Prisma client with db.clinicalNote and db.practiceDocument
affects:
  - 10-clinical-document-persistence (all subsequent plans)
  - Any phase that writes or reads clinical notes or practice documents

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DocumentType stored as TEXT in DB (not Prisma enum) — cast in mapToDomain() at repository layer"
    - "One-to-one ClinicalNote→Appointment enforced at DB level via @unique on appointmentId"
    - "Cascade deletes flow from Workspace → Patient/Appointment → ClinicalNote/PracticeDocument"

key-files:
  created:
    - prisma/migrations/20260317194006_add_clinical_notes_and_practice_documents/migration.sql
    - prisma/migrations/migration_lock.toml
  modified:
    - prisma/schema.prisma

key-decisions:
  - "ClinicalNote.appointmentId has @unique — enforces one-to-one at DB level, not application level"
  - "PracticeDocument.type and .content are plain String (not Prisma enum, not size-limited) — domain string union is cast in repository mapToDomain()"
  - "Migration SQL file created manually because DIRECT_URL in .env.local still has YOUR_DATABASE_PASSWORD placeholder — npx prisma migrate dev blocked by missing Supabase DB password"

patterns-established:
  - "Domain enums stored as TEXT in DB — cast at repository boundary, not at schema level"
  - "Cascade delete order: Workspace → Patient → PracticeDocument; Appointment → ClinicalNote"

requirements-completed: [REPO-03, REPO-04]

# Metrics
duration: 5min
completed: 2026-03-17
---

# Phase 10 Plan 01: Schema Extension — ClinicalNote and PracticeDocument Summary

**Prisma schema extended with ClinicalNote (one-to-one to Appointment via @unique FK) and PracticeDocument (type/content as TEXT) models, migration SQL file ready, Prisma client regenerated with full db.clinicalNote and db.practiceDocument type support**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-17T19:36:04Z
- **Completed:** 2026-03-17T19:41:00Z
- **Tasks:** 2
- **Files modified:** 3 (schema.prisma, migration.sql, migration_lock.toml)

## Accomplishments
- Added `ClinicalNote` model with `@unique` constraint on `appointmentId` enforcing one-to-one at DB level
- Added `PracticeDocument` model with `type` and `content` as plain `String` (no Prisma enum, no size limit)
- Added back-relation fields to `Workspace` (`clinicalNotes`, `documents`), `Patient` (`clinicalNotes`, `documents`), and `Appointment` (`clinicalNote?`)
- Created migration SQL file with correct CREATE TABLE, indexes, and CASCADE FK constraints
- Regenerated Prisma client — `db.clinicalNote` and `db.practiceDocument` are accessible and type-safe

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend schema.prisma with ClinicalNote and PracticeDocument models** - `c14905e` (feat)
2. **Task 2: Create migration SQL file and regenerate Prisma client** - `73d61ef` (chore)

## Files Created/Modified
- `prisma/schema.prisma` - ClinicalNote and PracticeDocument models added; back-relation fields on Workspace, Patient, Appointment
- `prisma/migrations/20260317194006_add_clinical_notes_and_practice_documents/migration.sql` - Incremental SQL for the two new tables
- `prisma/migrations/migration_lock.toml` - Prisma migrations provider lock file

## Decisions Made
- `PracticeDocument.type` and `.content` stored as plain `String` in DB — the domain `DocumentType` string union is cast in the repository's `mapToDomain()` function, avoiding a Prisma enum that would require a migration for each new document type.
- `ClinicalNote.appointmentId` uses `@unique` — enforces the one-to-one relationship at the database level, not just application logic.

## Deviations from Plan

### Auth Gate — DB migration blocked by missing password

- **Found during:** Task 2 (Run Prisma migration)
- **Issue:** `DIRECT_URL` in `.env.local` still contains `YOUR_DATABASE_PASSWORD` placeholder. `npx prisma migrate dev` failed with "Tenant or user not found". No Supabase CLI token or access key was available in the environment.
- **Resolution:** Created the migration SQL file manually (`prisma/migrations/20260317194006_add_clinical_notes_and_practice_documents/migration.sql`) with correct DDL. Ran `npx prisma generate` to regenerate the Prisma client from the schema — this does NOT require DB access. The migration file is ready to apply once the DB password is configured.
- **Impact:** The Prisma client types are fully functional (`db.clinicalNote`, `db.practiceDocument` both resolve). No TypeScript errors in `src/`. The migration SQL must be applied to Supabase before Phase 10 plans 02+ can be tested end-to-end.

---

**Total deviations:** 0 auto-fixed (auth gate handled as checkpoint, not deviation)
**Impact on plan:** Schema and client types are complete. DB apply is the only remaining step.

## Issues Encountered

- Pre-existing test failure in `tests/patient-summary.test.ts`: time-dependent assertion that expects `2026-03-17` as "earliest future appointment" but today is `2026-03-17` and the test date is now in the past. Confirmed pre-existing (fails before our changes). Out of scope — deferred.

## User Setup Required

To apply the migration to Supabase, update `.env.local` with the actual database password:

```bash
# Get the password from Supabase dashboard: Settings > Database > Connection string
# Replace YOUR_DATABASE_PASSWORD in .env.local:
DIRECT_URL="postgresql://postgres.thyncupuqlzzlpyrzyic:ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Then apply the migration:
npx prisma migrate deploy
# or for development:
npx prisma migrate dev
```

## Next Phase Readiness
- Prisma client types are ready — `db.clinicalNote` and `db.practiceDocument` resolve correctly
- Migration SQL is prepared and ready to apply
- Phase 10 plan 02 (PrismaClinicalNoteRepository) can be implemented immediately — it only requires the Prisma client (already regenerated)
- End-to-end testing will require the migration to be applied to the Supabase database

---
*Phase: 10-clinical-document-persistence*
*Completed: 2026-03-17*
