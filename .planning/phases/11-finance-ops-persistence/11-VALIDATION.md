---
phase: 11
slug: finance-ops-persistence
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` — `environment: "node"`, `include: ["tests/**/*.test.ts"]` |
| **Quick run command** | `npx vitest run tests/finance-domain.test.ts tests/audit-events.test.ts tests/reminder-domain.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/finance-domain.test.ts tests/audit-events.test.ts tests/reminder-domain.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | REPO-05 | unit | `npx vitest run tests/finance-domain.test.ts` | ✅ | ⬜ pending |
| 11-01-02 | 01 | 1 | REPO-05 | unit | `npx vitest run tests/finance-domain.test.ts` | ✅ | ⬜ pending |
| 11-02-01 | 02 | 1 | REPO-06 | unit | `npx vitest run tests/audit-events.test.ts` | ✅ | ⬜ pending |
| 11-02-02 | 02 | 1 | REPO-06 | unit | `npx vitest run tests/audit-events.test.ts` | ✅ | ⬜ pending |
| 11-03-01 | 03 | 1 | REPO-06 | unit | `npx vitest run tests/reminder-domain.test.ts` | ✅ | ⬜ pending |
| 11-03-02 | 03 | 1 | REPO-06 | unit | `npx vitest run tests/reminder-domain.test.ts` | ✅ | ⬜ pending |
| 11-04-01 | 04 | 2 | REPO-05, REPO-06 | integration | `npx vitest run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — existing test infrastructure covers all phase requirements. All three test files exist and pass against in-memory implementations. Store swaps make the application use Prisma without modifying the tests (except for the async interface migration in `audit-events.test.ts`).

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Financial charges persist across server restart | REPO-05 | Requires dev server restart cycle | 1. Create a charge, 2. Restart Next.js server, 3. Navigate to patient — charge must still appear |
| Audit events persist across server restart | REPO-06 | Requires dev server restart cycle | 1. Perform an action that creates audit event, 2. Restart server, 3. Check logs/backup — event must be present |
| No in-memory state leakage | REPO-05, REPO-06 | Cross-request isolation requires live server | 1. Clear DB, 2. Create data in one browser session, 3. Open new incognito session — data must be visible (not session-isolated) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
