---
phase: 01
slug: vault-foundation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-13
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm vitest run tests/auth-session.test.ts tests/setup-readiness.test.ts tests/audit-events.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run tests/auth-session.test.ts tests/setup-readiness.test.ts tests/audit-events.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | AUTH-01 | unit/integration | `pnpm vitest run tests/auth-session.test.ts -t "signup flow"` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | AUTH-02 | unit/integration | `pnpm vitest run tests/auth-session.test.ts -t "session persistence"` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | AUTH-03 | unit/integration | `pnpm vitest run tests/auth-session.test.ts -t "mfa gate"` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | AUTH-04 | unit/integration | `pnpm vitest run tests/auth-session.test.ts -t "password recovery"` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | PROF-01 | unit/integration | `pnpm vitest run tests/setup-readiness.test.ts -t "profile completeness"` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | PROF-02 | unit/integration | `pnpm vitest run tests/setup-readiness.test.ts -t "practice defaults"` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | SECU-01 | unit/integration | `pnpm vitest run tests/auth-session.test.ts -t "account boundary"` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | SECU-02 | unit/integration | `pnpm vitest run tests/audit-events.test.ts -t "audit event contract"` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | SECU-05 | unit/integration | `pnpm vitest run tests/audit-events.test.ts -t "privacy-safe surfaces"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — framework baseline
- [ ] `tests/auth-session.test.ts` — auth, session, MFA, recovery coverage stubs
- [ ] `tests/setup-readiness.test.ts` — setup checklist/profile/defaults coverage stubs
- [ ] `tests/audit-events.test.ts` — audit event and privacy-safe surface coverage stubs
- [ ] `pnpm test` script — stable full-suite entrypoint

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Setup hub feels like preparing a vault, not completing enterprise admin forms | PROF-01, PROF-02 | Tone and perceived friction are experiential | Run the setup flow as a first-time user and inspect copy, order, and emotional framing |
| Sensitive re-auth feels calm, not alarming | AUTH-03, SECU-05 | Tone and user trust cues are hard to reduce to automation | Trigger a sensitive action flow and confirm wording, density, and interruption feel |
| Trust controls are visible but discreet | SECU-02, SECU-05 | Requires subjective UI review | Review settings/trust screens and confirm audit/session controls are discoverable without dominating the UI |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
