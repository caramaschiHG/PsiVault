---
phase: 23
slug: copy-interna
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 23 — Validation Strategy

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
| 23-01-01 | 01 | 1 | NAV-01 | manual | inspect sidebar render | ❌ manual | ⬜ pending |
| 23-01-02 | 01 | 1 | NAV-02 | manual | inspect dashboard labels | ❌ manual | ⬜ pending |
| 23-01-03 | 01 | 1 | NAV-03 | manual | inspect onboarding h1 | ❌ manual | ⬜ pending |
| 23-02-01 | 02 | 2 | NAV-01 | unit | `pnpm test` | ✅ existing | ⬜ pending |
| 23-02-02 | 02 | 2 | NAV-01 | manual | visit /prontuario in browser | ❌ manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

Esta fase é copy/vocabulary — não requer novos arquivos de teste. `pnpm test` cobre a regressão TypeScript. Verificações de UI são manuais (inspeção visual de labels e strings).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Labels de sidebar em pt-BR com "Prontuário" | NAV-01 | Strings no JSX — sem testes de snapshot | Navegar no app autenticado, verificar sidebar e bottom-nav |
| Dashboard sem "Sessões realizadas" e "cobranças em aberto" | NAV-02 | Labels dinâmicos do page.tsx | Abrir /inicio, verificar seção "Resumo do mês" |
| Onboarding h1 "Configure seu consultório." | NAV-03 | Texto no JSX do page.tsx | Navegar para /complete-profile ou primeiro acesso |
| Rota /prontuario renderiza sem erro | NAV-01 | Nova rota — sem teste unitário | Acessar /prontuario autenticado, verificar listagem |
| Vocabulário da rota /prontuario não usa termos proibidos | NAV-01 | Revisão de copy | Ler todos os textos visíveis em /prontuario |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
