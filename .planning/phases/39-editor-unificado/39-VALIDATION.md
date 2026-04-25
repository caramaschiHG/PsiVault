---
phase: 39
slug: editor-unificado
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-25
---

# Phase 39 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 39-01-01 | 01 | 1 | EDIT-01 | T-39-01 / — | HTML parser sanitizes disallowed tags | unit | `pnpm test -- tests/html-to-pdf-nodes.test.ts` | ❌ W0 | ⬜ pending |
| 39-01-02 | 01 | 1 | EDIT-05 | T-39-01 / — | PDF buffer generated for rich text input | unit | `pnpm test -- tests/pdf-generation.test.ts` | ❌ W0 | ⬜ pending |
| 39-02-01 | 02 | 1 | EDIT-02 | — / — | A4 component renders with correct CSS | visual | `pnpm build` passes | ❌ W0 | ⬜ pending |
| 39-03-01 | 03 | 2 | EDIT-03 | T-39-02 / — | Modal lazy-loads; not in initial bundle | unit | `pnpm test -- tests/bundle.test.ts` | ❌ W0 | ⬜ pending |
| 39-04-01 | 04 | 2 | EDIT-04 | T-39-03 / — | Sign action rejects without signature asset | unit | `pnpm test -- tests/document-sign.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/html-to-pdf-nodes.test.ts` — HTML parser unit tests
- [ ] `tests/pdf-generation.test.ts` — PDF generation integration tests
- [ ] `tests/document-sign.test.ts` — Signature gate tests

*Wave 0 needed: new test files for HTML→PDF mapper and signature gate logic.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| A4 preview visual fidelity | EDIT-02 | Layout/pixel perfection requires human eye | Open document view; verify paper proportions, typography, margins match real A4 |
| PDF preview modal UX | EDIT-03 | iframe behavior varies by browser | Click "Visualizar PDF"; verify modal opens, PDF renders, buttons work |
| Rich text formatting in PDF | EDIT-05 | Visual comparison of bold/lists/etc | Generate PDF from session_record with bold, lists, headings; verify formatting |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
