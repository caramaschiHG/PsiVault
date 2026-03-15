---
phase: 3
slug: clinical-record-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.0.9 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run tests/clinical-domain.test.ts tests/clinical-session-number.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/clinical-domain.test.ts tests/clinical-session-number.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 0 | CLIN-01, CLIN-02, CLIN-03, CLIN-04, CLIN-05 | unit | `npx vitest run tests/clinical-domain.test.ts tests/clinical-session-number.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | CLIN-01 | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 1 | CLIN-02, CLIN-03 | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 1 | CLIN-04 | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-05 | 01 | 1 | CLIN-05 | unit | `npx vitest run tests/clinical-session-number.test.ts` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 2 | CLIN-01, CLIN-02, CLIN-03 | manual | UI: create note from completed appointment | N/A | ⬜ pending |
| 3-02-02 | 02 | 2 | CLIN-02, CLIN-03 | manual | UI: compose note with free text + structured blocks | N/A | ⬜ pending |
| 3-02-03 | 02 | 2 | CLIN-04 | manual | UI: edit note, verify audit log entry | N/A | ⬜ pending |
| 3-03-01 | 03 | 3 | CLIN-05 | manual | UI: patient timeline shows notes in chronological order | N/A | ⬜ pending |
| 3-03-02 | 03 | 3 | CLIN-05 | unit | `npx vitest run tests/clinical-domain.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/clinical-domain.test.ts` — stubs for CLIN-01, CLIN-02, CLIN-03, CLIN-04 (model, repository, audit event contract)
- [ ] `tests/clinical-session-number.test.ts` — stubs for CLIN-05 session number derivation
- No framework install needed — Vitest already configured

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Note composition UX with free text + optional structured blocks | CLIN-02, CLIN-03 | React component rendering / UX flow not suitable for unit tests | Navigate to `/sessions/[appointmentId]/note`, verify free text works alone and structured blocks can be optionally added |
| Unsaved draft guard triggers on navigation | CLIN-02 | `beforeunload` / in-app link confirm dialog — requires browser interaction | Edit note, click away without saving, confirm warning dialog appears |
| Agenda card shows correct "Registrar evolução" / "Ver nota" state | CLIN-01 | UI rendering based on data state | Complete an appointment with and without a note; verify correct CTA shown |
| Patient timeline shows session evolution chronologically | CLIN-05 | UI rendering and ordering | Open patient profile, verify timeline section with multiple notes shows most recent first |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
