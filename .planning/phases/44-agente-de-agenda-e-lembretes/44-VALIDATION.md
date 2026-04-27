---
phase: 44
slug: agente-de-agenda-e-lembretes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-27
---

# Phase 44 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.0.9 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test --run --reporter=verbose` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~12 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test --run --reporter=verbose`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 44-01-01 | 01 | 1 | AGEND-02 | T-44-04 | Phone numbers validated before persistence | unit | `vitest run src/lib/patients/model.test.ts` | ❌ W0 | ⬜ pending |
| 44-01-02 | 01 | 1 | ARCH-01 | — | Agent registry builds with all agents | unit | `vitest run src/lib/agents/agenda/agent.test.ts` | ❌ W0 | ⬜ pending |
| 44-01-03 | 01 | 1 | ARCH-01 | T-44-03 | Schema push succeeds without data loss | manual | `npx prisma db push --accept-data-loss` | — | ⬜ pending |
| 44-02-01 | 02 | 2 | AGEND-01 | — | Detects exactly 2 consecutive NO_SHOWs | unit | `vitest run src/lib/agents/agenda/no-show-detector.test.ts` | ❌ W0 | ⬜ pending |
| 44-02-02 | 02 | 2 | AGEND-01 | — | Dot renders with correct title tooltip | unit | `vitest run src/app/(vault)/patients/components/patient-summary-cards.test.tsx` | ❌ W0 | ⬜ pending |
| 44-02-03 | 02 | 2 | AGEND-01 | T-44-02 | Enqueue fires on status mutation | integration | `vitest run src/lib/appointments/actions.test.ts` | ❌ W0 | ⬜ pending |
| 44-03-01 | 03 | 2 | AGEND-02 | — | Mock sender logs expected aggregated message | unit | `vitest run src/lib/agents/agenda/reminder-sender.test.ts` | ❌ W0 | ⬜ pending |
| 44-03-02 | 03 | 2 | AGEND-03 | T-44-01 | Raw SQL uses parameterized queries only | unit | `vitest run src/lib/agents/agenda/schedule-optimizer.test.ts` | ❌ W0 | ⬜ pending |
| 44-03-03 | 03 | 2 | AGEND-03 | — | Badge renders in agenda slot with click handler | unit | `vitest run src/app/(vault)/agenda/components/suggestion-badge.test.tsx` | ❌ W0 | ⬜ pending |
| 44-04-01 | 04 | 3 | AGEND-04 | — | Summary triggers only after last appointment | unit | `vitest run src/lib/agents/agenda/daily-summary.test.ts` | ❌ W0 | ⬜ pending |
| 44-04-02 | 04 | 3 | AGEND-04 | T-44-02 | Idempotency key prevents duplicate tasks | unit | `vitest run src/lib/agents/agenda/daily-summary.test.ts` | ❌ W0 | ⬜ pending |
| 44-04-03 | 04 | 3 | AGEND-04 | — | Notification type extends AppNotification correctly | type | `npx tsc --noEmit` | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/agenda/no-show-detector.test.ts` — stubs for AGEND-01
- [ ] `tests/agenda/schedule-optimizer.test.ts` — stubs for AGEND-03
- [ ] `tests/agenda/reminder-sender.test.ts` — stubs for AGEND-02
- [ ] `tests/agenda/daily-summary.test.ts` — stubs for AGEND-04
- [ ] `tests/agenda/agent.test.ts` — integration stub for ARCH-01

*Note: Tests may be colocated (`*.test.ts` next to source) per project convention.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cron fires at correct UTC time for 20h BRT | AGEND-02 | Vercel Cron runs in UTC; manual verification of schedule mapping required | 1. Deploy to Vercel preview. 2. Check cron execution logs. 3. Verify task `scheduledFor` is 23:00 UTC (20:00 BRT). |
| Resumo do Dia appears after completing last session | AGEND-04 | Requires real appointment state transitions | 1. Create 2 appointments for today. 2. Mark first as COMPLETED. 3. Verify no summary yet. 4. Mark second as COMPLETED. 5. Verify notification appears in dropdown. |
| Badge click fills appointment form | AGEND-03 | Requires DOM interaction and form state | 1. Open agenda. 2. Click "Novo atendimento" for patient with history. 3. Verify green badge appears. 4. Click badge. 5. Verify time field populated. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
