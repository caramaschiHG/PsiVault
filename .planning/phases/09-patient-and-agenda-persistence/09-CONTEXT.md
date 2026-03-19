# Context: Phase 09 - Patient & Agenda Persistence

## Phase Overview
- **Goal:** Replace in-memory patient and agenda repositories with Prisma implementations.
- **Key Deliverables:** `PrismaPatientRepository` and `PrismaAppointmentRepository`.

## Tech Stack
- **Framework:** Next.js
- **ORM:** Prisma
- **Database:** PostgreSQL (via Supabase)
- **Validation:** Zod (likely used in models/schemas)

## Current State
- Infrastructure (Phase 7) is established (Supabase + Prisma).
- Authentication (Phase 8) is implemented.
- Patient and Appointment domain models are defined in `src/lib`.
- Repositories currently use in-memory implementations (`createInMemoryPatientRepository`, `createInMemoryAppointmentRepository`).

## Domain Requirements
### Patients
- Support for core identity, contact, guardian, emergency contact, and important observations.
- Soft delete/archiving (maps domain `archivedAt` to DB `deletedAt`).
- Scoped to `Workspace`.

### Appointments
- Support for timing (startsAt, endsAt, duration), care mode, and status.
- Support for recurrence series and rescheduling history.
- Missing fields in Prisma schema (to be added):
  - `priceInCents: Int?`
  - `meetingLink: String?`
  - `remoteIssueNote: String?`

## Verification Requirements
- All existing domain tests must pass using the Prisma implementations.
- Tests to run:
  - `tests/patient-domain.test.ts`
  - `tests/agenda-view-model.test.ts`
  - `tests/appointment-conflicts.test.ts`
  - `tests/appointment-defaults.test.ts`
  - `tests/appointment-online-care.test.ts`
  - `tests/appointment-recurrence.test.ts`
