---
phase: 4
slug: document-vault
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.0.9 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `pnpm test tests/document-domain.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~10 seconds (quick), ~30 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test tests/document-domain.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | DOCS-01–08, SECU-05 | unit | `pnpm test tests/document-domain.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 1 | DOCS-01 | unit | `pnpm test tests/document-domain.test.ts` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 1 | DOCS-08 | unit | `pnpm test tests/document-domain.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 1 | DOCS-02, DOCS-03 | unit | `pnpm test tests/document-domain.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 1 | DOCS-04 | unit | `pnpm test tests/document-domain.test.ts` | ❌ W0 | ⬜ pending |
| 4-02-03 | 02 | 1 | DOCS-05, DOCS-06, DOCS-07 | unit | `pnpm test tests/document-domain.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-01 | 03 | 2 | DOCS-08 | unit | `pnpm test tests/document-domain.test.ts` | ❌ W0 | ⬜ pending |
| 4-03-02 | 03 | 2 | SECU-05 | unit | `pnpm test tests/document-domain.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/document-domain.test.ts` — stubs covering DOCS-01 through DOCS-08 and SECU-05 audit constraint
- [ ] No new framework install needed — Vitest already present

*No new test infrastructure required; existing Vitest setup covers all phase needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Document pre-fill renders correctly in browser UI | DOCS-02 | DOM rendering fidelity requires visual inspection | Open `/patients/[id]/documents/new?type=declaration`, verify patient name, date, and professional name appear pre-filled |
| Vault posture: document content not visible in patient list or audit log UI | SECU-05 | Requires browser navigation across multiple surfaces | Check patient list, session history, and audit log — confirm no document content leaks into these views |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
