---
phase: 02
slug: patient-and-agenda-core
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-13
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm vitest run tests/patient-domain.test.ts tests/patient-summary.test.ts tests/appointment-conflicts.test.ts tests/appointment-recurrence.test.ts tests/appointment-defaults.test.ts tests/agenda-view-model.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run tests/patient-domain.test.ts tests/patient-summary.test.ts tests/appointment-conflicts.test.ts tests/appointment-recurrence.test.ts tests/appointment-defaults.test.ts tests/agenda-view-model.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PATI-01 | unit/integration | `pnpm vitest run tests/patient-domain.test.ts -t "create patient profile"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | PATI-02 | unit/integration | `pnpm vitest run tests/patient-domain.test.ts -t "optional patient fields"` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | PATI-03 | unit/view-model | `pnpm vitest run tests/patient-summary.test.ts -t "patient operational summary"` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | PATI-04 | unit/integration | `pnpm vitest run tests/patient-domain.test.ts -t "archive and recover"` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | SCHD-01 | unit/integration | `pnpm vitest run tests/appointment-conflicts.test.ts -t "create appointment occurrence"` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | SCHD-02 | unit/integration | `pnpm vitest run tests/appointment-conflicts.test.ts -t "reschedule and cancel"` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | SCHD-03 | unit/integration | `pnpm vitest run tests/appointment-conflicts.test.ts -t "appointment statuses"` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 2 | SCHD-04 | unit/integration | `pnpm vitest run tests/appointment-recurrence.test.ts -t "weekly recurrence scopes"` | ❌ W0 | ⬜ pending |
| 02-02-05 | 02 | 2 | SCHD-06 | unit/domain | `pnpm vitest run tests/appointment-conflicts.test.ts -t "hard block overlaps"` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | SCHD-05 | unit/view-model | `pnpm vitest run tests/agenda-view-model.test.ts -t "day and week agenda"` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | SCHD-07 | unit/view-model | `pnpm vitest run tests/appointment-defaults.test.ts -t "quick next-session defaults"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/patient-domain.test.ts` — patient create/update/archive/recover and optional-field coverage
- [ ] `tests/patient-summary.test.ts` — operational summary derivation and fallback-state coverage
- [ ] `tests/appointment-conflicts.test.ts` — appointment creation, status transitions, reschedule/cancel, and hard-block overlap coverage
- [ ] `tests/appointment-recurrence.test.ts` — weekly recurrence generation and edit-scope coverage
- [ ] `tests/appointment-defaults.test.ts` — quick next-session default-selection coverage
- [ ] `tests/agenda-view-model.test.ts` — day/week agenda ordering, chip labels, and privacy-safe card-input coverage

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Essentials-first patient intake feels progressive rather than bureaucratic | PATI-01, PATI-02 | Interaction pacing and perceived friction are experiential | Create a patient from scratch and confirm the form leads with essentials while optional fields appear only when relevant |
| Patient profile reads identity first while still exposing operational context within the first screenful | PATI-03 | Information hierarchy and readability are visual judgments | Open a patient profile and confirm identity leads, with next/last session, pending items, document count, and finance state immediately below |
| Archived patients disappear from active flows but are easy to recover | PATI-04 | Requires end-to-end navigation review | Archive a patient, confirm they leave active lists/agenda actions, then restore and verify the app returns to the profile |
| Day and week agenda views stay legible and calm at a glance | SCHD-05 | Layout density and scanability require UI review | Review both views with varied statuses and care modes; confirm cards/chips read clearly without spreadsheet-like clutter |
| Quick next-session carries forward useful defaults without silently assuming the next slot | SCHD-07 | Prefill usefulness and trust are interaction-level concerns | Start next-session from patient and completed-appointment contexts; confirm patient, duration, mode, and price prefill while date/time stay explicit |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [x] Feedback latency < 45s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
