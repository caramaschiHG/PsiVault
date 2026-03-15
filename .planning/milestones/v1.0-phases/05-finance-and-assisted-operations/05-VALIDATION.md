---
phase: 5
slug: finance-and-assisted-operations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.0.9 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 0 | FIN-01 | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | FIN-01 | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | FIN-02 | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 2 | FIN-03 | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-05 | 01 | 2 | FIN-04 | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-06 | 01 | 3 | FIN-05 | unit | `npx vitest run tests/finance-domain.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 0 | ONLN-01 | unit | `npx vitest run tests/appointment-online-care.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | ONLN-01 | unit | `npx vitest run tests/appointment-online-care.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-03 | 02 | 1 | ONLN-02 | unit | `npx vitest run tests/appointment-online-care.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-04 | 02 | 2 | ONLN-03 | unit | `npx vitest run tests/appointment-online-care.test.ts` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 0 | COMM-01 | unit | `npx vitest run tests/communication-templates.test.ts` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 1 | COMM-01 | unit | `npx vitest run tests/communication-templates.test.ts` | ❌ W0 | ⬜ pending |
| 05-03-03 | 03 | 1 | COMM-02 | unit | `npx vitest run tests/communication-templates.test.ts` | ❌ W0 | ⬜ pending |
| 05-03-04 | 03 | 2 | COMM-03 | unit | `npx vitest run tests/communication-templates.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/finance-domain.test.ts` — stubs for FIN-01, FIN-02, FIN-03, FIN-04, FIN-05
- [ ] `tests/appointment-online-care.test.ts` — stubs for ONLN-01, ONLN-02, ONLN-03
- [ ] `tests/communication-templates.test.ts` — stubs for COMM-01, COMM-02, COMM-03

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WhatsApp deep link opens correct prefilled message | COMM-01 | Requires device with WhatsApp installed | Open appointment detail, tap "Lembrete via WhatsApp", verify message text and recipient |
| Email deep link opens mail client with prefilled body | COMM-02 | Requires mail client configured | Tap "Enviar por e-mail", verify subject and body pre-filled |
| Monthly financial summary totals correct for mixed payment statuses | FIN-05 | Requires visual UI verification | Navigate to /financeiro, verify totals match expected for pending/paid/overdue charges |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
