# Research: Phase 09 - Patient & Agenda Persistence

## Objective
Replace in-memory patient and agenda repositories with Prisma implementations.

## Infrastructure Analysis
- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase)
- **Schema:**
  - `Patient` model exists with core identity, contact, guardian, and emergency info.
  - `Appointment` model exists with timing, care mode, status, and recurrence linkage.
  - Both are scoped to `Workspace`.

## Repository Contracts
### PatientRepository (`src/lib/patients/repository.ts`)
- `save(patient: Patient): Patient`
- `findById(id: string, workspaceId: string): Patient | null`
- `listActive(workspaceId: string): Patient[]`
- `listArchived(workspaceId: string): Patient[]`

### AppointmentRepository (`src/lib/appointments/repository.ts`)
- `save(appointment: Appointment): Appointment`
- `findById(id: string, workspaceId: string): Appointment | null`
- `listByDateRange(workspaceId: string, from: Date, to: Date): Appointment[]`
- `listBySeries(seriesId: string, workspaceId: string): Appointment[]`
- `listByPatient(patientId: string, workspaceId: string): Appointment[]`

## Implementation Strategy
1. Create `PrismaPatientRepository` in `src/lib/patients/repository.prisma.ts` (or similar).
2. Create `PrismaAppointmentRepository` in `src/lib/appointments/repository.prisma.ts`.
3. Map Prisma models to Domain models and vice-versa.
4. Ensure `deletedAt` (soft delete) in Prisma maps to `archivedAt` (if naming differs) in Domain.
   - *Correction:* `Patient` schema has `deletedAt`, but Domain `Patient` might use `archivedAt`. Need to check `src/lib/patients/model.ts`.

## Verification Plan
- Run existing tests:
  - `tests/patient-domain.test.ts`
  - `tests/agenda-view-model.test.ts`
  - `tests/appointment-conflicts.test.ts`
  - `tests/appointment-defaults.test.ts`
  - `tests/appointment-online-care.test.ts`
  - `tests/appointment-recurrence.test.ts`
- These tests currently use `createInMemoryRepository`. They should be updated or duplicated to run against `PrismaRepository`.
- **Database Cleaning:** Use a global `beforeEach` to clean tables between tests or use a transaction-based approach.

## Potential Pitfalls
- **Date Handling:** Ensure JS `Date` objects are correctly handled by Prisma/PostgreSQL.
- **Enums:** Map Prisma enums (e.g., `AppointmentStatus`) to Domain enums.
- **Mapping:** Prisma returns objects that might have extra fields or different naming (e.g., `deletedAt` vs `archivedAt`).
