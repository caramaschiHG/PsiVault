---
phase: 06-retrieval-recovery-and-launch-polish
plan: 02
subsystem: ui
tags: [dashboard, reminders, inicio, patient-profile, server-actions, tdd]

# Dependency graph
requires:
  - phase: 06-01
    provides: Reminder domain module, ReminderRepository, getReminderRepository, listByWorkspaceAndMonth
  - phase: 05-02
    provides: getFinanceRepository, vault layout
  - phase: 02-02
    provides: getAppointmentRepository, listByDateRange
  - phase: 02-01
    provides: getPatientRepository, listActive, listArchived
provides:
  - /inicio route — professional morning orientation dashboard
  - src/lib/dashboard/aggregation.ts — filterTodayAppointments, countPendingCharges, deriveMonthlySnapshot
  - src/app/(vault)/actions/reminders.ts — createReminderAction, completeReminderAction server actions
  - RemindersSection client component on patient profile
  - "Início" as first nav link in vault layout
affects:
  - Patient profile (reminders section added)
  - Vault layout nav (Início first)
  - /financeiro (linked from pendingChargeCount badge)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD GREEN on Wave 0 scaffold (dashboard-aggregation.test.ts)
    - Server actions passed as props to client components (Phase 03-02 pattern)
    - useTransition for optimistic completion state in RemindersSection
    - SECU-05: count-only badge for finance surface on dashboard (no amounts)
    - UTC day boundaries for today's session filter

key-files:
  created:
    - src/lib/dashboard/aggregation.ts
    - src/app/(vault)/inicio/page.tsx
    - src/app/(vault)/actions/reminders.ts
    - src/app/(vault)/patients/[patientId]/components/reminders-section.tsx
  modified:
    - src/app/(vault)/layout.tsx
    - src/app/(vault)/patients/[patientId]/page.tsx

key-decisions:
  - "/inicio uses filterTodayAppointments to narrow listByDateRange results to the UTC day window — avoids a separate today-specific repo method"
  - "completeReminderAction accepts reminderId string (not FormData) — simpler for button onClick binding via .bind(null, id)"
  - "RemindersSection placed after FinanceSection and before ExportSection — follows clinical-first page order while keeping all patient operational data together"
  - "Início nav link added before Agenda — orients professional to dashboard-first posture at login"

requirements-completed: [TASK-01, TASK-02, TASK-03, DASH-01, DASH-02]

# Metrics
duration: 5min
completed: 2026-03-15
---

# Phase 6 Plan 2: Dashboard and Reminders UX Summary

**SECU-05-compliant /inicio dashboard with 4-domain aggregation, reminder server actions, RemindersSection on patient profile, and "Início" nav link as first item**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-15T03:15:07Z
- **Completed:** 2026-03-15T03:20:00Z
- **Tasks:** 2 of 2 (Task 3 is a human-verify checkpoint — awaiting approval)
- **Files modified:** 6

## Accomplishments

- Created `src/lib/dashboard/aggregation.ts` with three pure functions: `filterTodayAppointments`, `countPendingCharges`, `deriveMonthlySnapshot` — all 12 Wave 0 scaffold tests green
- Created `/inicio/page.tsx` server component aggregating appointments, reminders, finance, and patients in 3 sections: Hoje, Lembretes ativos, Resumo do mês
- Created `src/app/(vault)/actions/reminders.ts` with `createReminderAction` and `completeReminderAction` — audit events, revalidatePath for both dashboard and patient profile
- Created `RemindersSection` client component with active list, inline creation form, `useTransition` completion toggle, and collapsible "Concluídas" history
- Updated patient profile page to load `listActiveByPatient` + `listCompletedByPatient` and render `RemindersSection` below `FinanceSection`
- Added "Início" as first nav link in vault layout (server component, no "use client" added)
- Full suite: 289/289 tests green

## Task Commits

1. **Task 1: Dashboard aggregation, /inicio page, reminders actions, nav link** — `d9e4552` (feat)
2. **Task 2: RemindersSection component and patient profile integration** — `f3fae91` (feat)

## Files Created/Modified

- `src/lib/dashboard/aggregation.ts` — filterTodayAppointments (UTC day boundaries), countPendingCharges (pendente|atrasado count), deriveMonthlySnapshot (wraps deriveMonthlyFinancialSummary)
- `src/app/(vault)/inicio/page.tsx` — server component, 3 sections, Intl.DateTimeFormat pt-BR/America/Sao_Paulo, SECU-05 count-only badge for finance
- `src/app/(vault)/actions/reminders.ts` — "use server", crypto.getRandomValues ID, createReminderAuditEvent, revalidatePath /inicio and patient profile
- `src/app/(vault)/patients/[patientId]/components/reminders-section.tsx` — "use client", useState for collapsed Concluídas, useTransition for completion, server actions as props
- `src/app/(vault)/layout.tsx` — Início link added as first nav item
- `src/app/(vault)/patients/[patientId]/page.tsx` — getReminderRepository, listActiveByPatient/listCompletedByPatient, RemindersSection rendered

## Decisions Made

- `/inicio` uses `filterTodayAppointments` to narrow `listByDateRange` output to the UTC day window — avoids a new repo method
- `completeReminderAction` accepts `reminderId: string` not FormData — cleaner binding with `.bind(null, id)` in JSX
- `RemindersSection` placed after FinanceSection: all operational-status sections grouped together before ExportSection
- Vault layout stays a server component — "Início" link added inline without adding "use client"

## Deviations from Plan

None — plan executed exactly as written.

## Checkpoint Pending

Task 3 (`checkpoint:human-verify`) requires the professional to open the app, navigate to `/inicio`, and verify all three sections, reminder creation/completion flow, patient-profile reminders, and the SECU-05 compliant finance badge.

## Self-Check

- [x] `src/lib/dashboard/aggregation.ts` created
- [x] `src/app/(vault)/inicio/page.tsx` created
- [x] `src/app/(vault)/actions/reminders.ts` created
- [x] `src/app/(vault)/patients/[patientId]/components/reminders-section.tsx` created
- [x] `src/app/(vault)/layout.tsx` modified (Início first nav)
- [x] `src/app/(vault)/patients/[patientId]/page.tsx` modified (RemindersSection)
- [x] Commits d9e4552 and f3fae91 exist
- [x] 289/289 tests green

## Self-Check: PASSED
