---
phase: 21
slug: brand-foundation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-28
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

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
| 21-01-01 | 01 | 1 | BRAND-01 | grep | `grep -n "Posicionamento Psicanalítico" CLAUDE.md && grep -n "Vocabulário obrigatório" CLAUDE.md && grep -n "Anti-padrões de tom" CLAUDE.md && grep -n "Assistente de Pesquisa" CLAUDE.md && grep -n "copyright" CLAUDE.md` | ✅ | ⬜ pending |
| 21-02-01 | 02 | 2 | BRAND-02 | grep | `grep -n "space-section-gap" src/app/globals.css && grep -n "line-height: 1.6" src/app/globals.css && grep -n "letter-spacing" src/app/globals.css` | ✅ | ⬜ pending |
| 21-02-02 | 02 | 2 | BRAND-02 | grep | `grep -n "1.5rem 1.25rem" "src/app/(vault)/layout.tsx" && grep -n "0.75rem 0.875rem" "src/app/(vault)/components/vault-sidebar-nav.tsx"` | ✅ | ⬜ pending |
| 21-02-03 | 02 | 2 | BRAND-02 | manual + pnpm test | `pnpm test` (regressão) + verificação visual no browser | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. This phase edits CLAUDE.md and globals.css — no new test infrastructure needed.

*Vitest suite must stay green after every edit (regression gate).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sidebar exibe espaçamento e tipografia refinados visualmente | BRAND-02 | Verificação visual no browser | Rodar `pnpm dev`, acessar /inicio, confirmar brand block e nav items com mais respiro |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
