---
phase: 6
slug: retrieval-recovery-and-launch-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.0.9 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 0 | TASK-01, TASK-03 | unit | `pnpm test -- --reporter=verbose tests/reminder-domain.test.ts` | ❌ W0 | ⬜ pending |
| 6-01-02 | 01 | 0 | TASK-02, DASH-01, DASH-02 | unit | `pnpm test -- --reporter=verbose tests/dashboard-aggregation.test.ts` | ❌ W0 | ⬜ pending |
| 6-01-03 | 01 | 0 | SRCH-01, SRCH-02 | unit | `pnpm test -- --reporter=verbose tests/search-domain.test.ts` | ❌ W0 | ⬜ pending |
| 6-01-04 | 01 | 0 | SECU-03, SECU-04 | unit | `pnpm test -- --reporter=verbose tests/export-backup.test.ts` | ❌ W0 | ⬜ pending |
| 6-01-05 | 01 | 1 | TASK-01, TASK-03 | unit | `pnpm test -- --reporter=verbose tests/reminder-domain.test.ts` | ❌ W0 | ⬜ pending |
| 6-02-01 | 02 | 1 | TASK-02, DASH-01, DASH-02 | unit | `pnpm test -- --reporter=verbose tests/dashboard-aggregation.test.ts` | ❌ W0 | ⬜ pending |
| 6-02-02 | 02 | 1 | SRCH-01, SRCH-02 | unit | `pnpm test -- --reporter=verbose tests/search-domain.test.ts` | ❌ W0 | ⬜ pending |
| 6-03-01 | 03 | 2 | SECU-03, SECU-04 | unit | `pnpm test -- --reporter=verbose tests/export-backup.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/reminder-domain.test.ts` — stubs for TASK-01, TASK-03 (model + repository)
- [ ] `tests/dashboard-aggregation.test.ts` — stubs for TASK-02, DASH-01, DASH-02 (aggregation utilities)
- [ ] `tests/search-domain.test.ts` — stubs for SRCH-01, SRCH-02 (search function + SECU-05 guard)
- [ ] `tests/export-backup.test.ts` — stubs for SECU-03, SECU-04 (serializer + validator)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dashboard home screen renders correctly with live data | DASH-01, DASH-02 | UI layout and visual orientation requires human review | Open app, verify today's sessions, reminders, and payment pendencies appear correctly |
| Global search bar appears in layout and returns grouped results | SRCH-01, SRCH-02 | Full integration across server action + UI requires browser | Open app, type a partial patient name, verify grouped results appear |
| Export download triggers with re-auth gate | SECU-03 | Browser file download + sensitive-action confirmation dialog | Navigate to export page, trigger export, verify re-auth prompt appears and file downloads |
| Backup import restores data correctly | SECU-04 | File upload + validation requires browser interaction | Export backup, clear data, import backup, verify data restored |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
