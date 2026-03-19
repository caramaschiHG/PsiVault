---
phase: 10
slug: clinical-document-persistence
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run tests/clinical-domain.test.ts tests/clinical-session-number.test.ts tests/document-domain.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/clinical-domain.test.ts tests/clinical-session-number.test.ts tests/document-domain.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | REPO-03, REPO-04 | unit (domain contract) | `npx vitest run tests/clinical-domain.test.ts tests/clinical-session-number.test.ts tests/document-domain.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test files are needed.

The three existing test files collectively verify the domain contract:
- `tests/clinical-domain.test.ts` — REPO-03 behavioral contract
- `tests/clinical-session-number.test.ts` — REPO-03 session number invariant
- `tests/document-domain.test.ts` — REPO-04 behavioral contract

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Clinical notes persist across server restarts | REPO-03 | Requires live Supabase DB + server restart cycle | 1. Create appointment + clinical note. 2. Restart dev server. 3. Navigate to the appointment — note must be visible. |
| Generated documents persist across server restarts | REPO-04 | Requires live Supabase DB + server restart cycle | 1. Generate a document for a patient. 2. Restart dev server. 3. Navigate to the patient's documents — document must be visible. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
