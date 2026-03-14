---
phase: 05-finance-and-assisted-operations
plan: 02
subsystem: finance-ui
tags: [finance, server-actions, patient-profile, navigation, charge-management]

# Dependency graph
requires:
  - phase: 05-01
    provides: "SessionCharge model, SessionChargeRepository, getFinanceRepository, createChargeAuditEvent"
  - phase: 04-document-vault
    provides: "DocumentsSection pattern, server-component-with-props pattern"
provides:
  - "completeAppointmentAction extended with idempotent SessionCharge auto-creation"
  - "updateChargeAction for status/amountInCents/paymentMethod with audit trail"
  - "FinanceSection server component with charge list and inline <details> edit form"
  - "Patient profile page hydrated with real financial status from charges"
  - "derivePatientSummaryFromAppointments no longer hardcodes financialStatus: no_data"
  - "/financeiro route with month picker, summary cards (sessions/received/pending), and charge list"
  - "Shared vault layout with navigation (Agenda, Pacientes, Financeiro, Configurações)"
affects:
  - "05-03 (communication UI can now reference charge state from finance repo)"
  - "Patient profile summary chip now reflects real payment status"

# Tech tracking
tech-stack:
  added:
    - "next/cache revalidatePath (correct import for server action cache invalidation)"
  patterns:
    - "Server action passed as prop to presentational server component (established in Phase 03)"
    - "<details>+<summary> for zero-JS collapsible inline form"
    - "Patient repository listActive + listArchived to aggregate all patients for monthly view"
    - "Vault-wide shared layout for persistent navigation without client state"

key-files:
  created:
    - "src/app/(vault)/patients/[patientId]/components/finance-section.tsx"
    - "src/app/(vault)/financeiro/page.tsx"
    - "src/app/(vault)/layout.tsx"
  modified:
    - "src/app/(vault)/appointments/actions.ts"
    - "src/app/(vault)/patients/[patientId]/page.tsx"
    - "src/lib/patients/summary.ts"

key-decisions:
  - "revalidatePath imported from next/cache not next/navigation — server action cache invalidation uses the cache module"
  - "listByMonth uses patientId scoping (from 05-01 design); /financeiro aggregates by iterating all patients rather than a cross-patient query — avoids repository interface change"
  - "listActive + listArchived used instead of nonexistent listAll — archived patients may still have charges visible in monthly view"
  - "Vault layout created as new file (none existed) — wraps all (vault) routes with shared nav"
  - "financialStatus derived before summary in patient profile — summary derivation moved after charge loading to pass real status"

# Metrics
duration: ~6min
completed: 2026-03-14
---

# Phase 05 Plan 02: Finance UI and Server Actions Summary

**Finance domain wired into server actions and two UI surfaces: FinanceSection on patient profile with inline charge editing, and standalone /financeiro route with monthly totals — charges auto-created at appointment completion with idempotency guard**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-14T23:04:26Z
- **Completed:** 2026-03-14T23:10:00Z
- **Tasks:** 2 (both auto)
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

### Task 1: completeAppointmentAction + updateChargeAction
- Extended `completeAppointmentAction` with idempotent charge auto-creation: checks `findByAppointmentId` before creating, then `save` + charge audit event
- Added `updateChargeAction`: reads chargeId/status/amount/paymentMethod from FormData, converts R$ string to cents, updates charge, appends audit, calls `revalidatePath` on patient profile
- Fixed import: `revalidatePath` is from `next/cache`, not `next/navigation`

### Task 2: FinanceSection, /financeiro, patient profile, vault layout
- `finance-section.tsx`: pure server component showing charge list with status badge (color-coded), amount (BRL or "Sem valor definido"), paymentMethod label, and collapsible `<details>` form per charge
- `patients/[patientId]/page.tsx`: loads charges, derives `financialStatus`, passes to `derivePatientSummaryFromAppointments`, renders `<FinanceSection>` below `<DocumentsSection>`
- `summary.ts`: added `financialStatus?: FinancialStatus` to `DerivePatientSummaryFromAppointmentsInput`; replaced hardcoded `"no_data"` with `input.financialStatus ?? "no_data"`
- `financeiro/page.tsx`: month-aware route that aggregates charges from all patients via `listActive + listArchived` iteration, renders month nav (prev/next links), three summary cards (sessions, received, pending/overdue), and charge list with patient names
- `(vault)/layout.tsx`: new shared layout with nav links (Agenda, Pacientes, Financeiro, Configurações) — did not previously exist

## Task Commits

1. `47a1002` — feat(05-02): extend completeAppointmentAction with charge auto-creation and add updateChargeAction
2. `e006014` — feat(05-02): FinanceSection, /financeiro route, patient profile finance integration, vault layout

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] revalidatePath imported from wrong module**
- **Found during:** Task 1
- **Issue:** Plan snippet used `import { redirect, revalidatePath } from "next/navigation"` but `revalidatePath` is exported from `next/cache` in Next.js App Router
- **Fix:** Split imports — `redirect` from `next/navigation`, `revalidatePath` from `next/cache`
- **Files modified:** `src/app/(vault)/appointments/actions.ts`
- **Commit:** included in 47a1002

**2. [Rule 2 - Missing functionality] PatientRepository has no listAll method**
- **Found during:** Task 2 (financeiro page)
- **Issue:** Plan specified `patientRepo.listAll(DEFAULT_WORKSPACE_ID)` but the repository interface only has `listActive` and `listArchived`
- **Fix:** Used `[...listActive(ws), ...listArchived(ws)]` to aggregate all patients (both active and archived may have charges)
- **Files modified:** `src/app/(vault)/financeiro/page.tsx`
- **Commit:** included in e006014

**3. [Scope observation] Repository listByMonth signature mismatch**
- **Plan expected:** `listByMonth(workspaceId, year, month)` — cross-patient query
- **Actual (05-01):** `listByMonth(workspaceId, patientId, year, month)` — per-patient query
- **Resolution:** Iterated all patients in the financeiro page to aggregate charges — no repository interface change needed

### Out-of-scope Pre-existing Issues

TypeScript errors in test files (`tests/appointment-conflicts.test.ts`, `tests/agenda-view-model.test.ts`, `tests/appointment-defaults.test.ts`) caused by Phase 05-01 Appointment model changes. Logged to `deferred-items.md`. All `src/` files compile cleanly. 200/200 Vitest tests pass.

## Verification Results

- `npx tsc --noEmit`: 0 errors in `src/` (pre-existing test-only errors in `tests/` are out of scope)
- `npx vitest run`: 200/200 tests pass across 15 test files
- All success criteria met: idempotent charge creation, FinanceSection on patient profile, real financialStatus in summary, /financeiro monthly totals, vault navigation with Financeiro link

## Self-Check: PASSED

- FOUND: `src/app/(vault)/patients/[patientId]/components/finance-section.tsx`
- FOUND: `src/app/(vault)/financeiro/page.tsx`
- FOUND: `src/app/(vault)/layout.tsx`
- FOUND: `.planning/phases/05-finance-and-assisted-operations/05-02-SUMMARY.md`
- FOUND commit `47a1002` (Task 1)
- FOUND commit `e006014` (Task 2)
