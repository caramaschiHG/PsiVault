---
phase: 15
slug: planning-metadata-realignment
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-18
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | shell + GSD CLI consistency checks |
| **Config file** | none |
| **Quick run command** | `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" init plan-phase "15"` |
| **Full suite command** | `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" init plan-phase "15" && node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "16" && find .planning/phases -maxdepth 1 \\( -name '07-*' -o -name '08-*' \\) | sort && rg -n "milestone: v1\\.2|Current Milestone: v1\\.2|# Execution Roadmap: PsiVault v1\\.2" .planning/STATE.md .planning/PROJECT.md .planning/ROADMAP.md` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" init plan-phase "15"`
- **After every plan wave:** Run the full suite command
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 15-01-T1 | 01 | 1 | metadata alignment | grep | `rg -n "Current Milestone: v1\\.2|v1\\.2 Lançamento" .planning/PROJECT.md .planning/ROADMAP.md` | ⬜ pending |
| 15-01-T2 | 01 | 1 | metadata alignment | grep | `rg -n "milestone: v1\\.2|Ready to start Phase 15|Current focus:\\*\\* Phase 15" .planning/STATE.md` | ⬜ pending |
| 15-02-T1 | 02 | 2 | artifact topology | file | `find .planning/phases -maxdepth 1 \\( -name '07-*' -o -name '08-*' \\) | sort` | ⬜ pending |
| 15-02-T2 | 02 | 2 | artifact topology | grep | `rg -n "\\.planning/milestones/v1\\.1-phases/(07|08)-" .planning/phases` | ⬜ pending |
| 15-03-T1 | 03 | 3 | GSD continuity | cli | `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" init plan-phase "15"` | ⬜ pending |
| 15-03-T2 | 03 | 3 | GSD continuity | cli | `node "$HOME/.codex/get-shit-done/bin/gsd-tools.cjs" roadmap get-phase "16"` | ⬜ pending |
| 15-03-T3 | 03 | 3 | launch-scope boundary | grep | `rg -n "current unarchived launch scope|launch scope|Phase 15" .planning/PROJECT.md .planning/ROADMAP.md .planning/STATE.md .planning/v1.1-MILESTONE-AUDIT.md` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test scaffolding needed before execution.

---

## Manual-Only Verifications

All phase behaviors are file-system or CLI based and can be validated automatically.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
