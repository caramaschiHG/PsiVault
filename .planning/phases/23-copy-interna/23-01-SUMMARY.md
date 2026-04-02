---
phase: 23-copy-interna
plan: "01"
subsystem: ui
tags: [copy, navigation, vocabulary, dashboard, onboarding]

# Dependency graph
requires:
  - phase: 21-brand-foundation
    provides: vocabulário obrigatório e anti-padrões de tom como ground truth
  - phase: 13-ui-ux-polish
    provides: vault-sidebar-nav.tsx, bottom-nav.tsx, inicio/page.tsx existentes
provides:
  - Sidebar e bottom-nav com item Prontuário entre Pacientes e Financeiro
  - Dashboard com strings clínicas corretas (atendimento, A receber)
  - Onboarding com framing de consultório ("Configure seu consultório.")
affects: [24-continuidade-e-fluxo, 25-plano-premium]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Substituição cirúrgica de strings: edição inline sem tocar em lógica ou estilos"

key-files:
  created: []
  modified:
    - src/app/(vault)/components/vault-sidebar-nav.tsx
    - src/app/(vault)/components/bottom-nav.tsx
    - src/app/(vault)/inicio/page.tsx
    - src/app/(auth)/complete-profile/page.tsx

key-decisions:
  - "Item Prontuário inserido entre Pacientes e Financeiro em ambas as navs — ordem comunica prioridade clínica"
  - "Config removido do bottom-nav mobile — Configurações acessível apenas via sidebar desktop para simplificar navegação mobile"
  - "A receber usado para singular e plural do badge de cobranças — reduz peso de jargão financeiro"

patterns-established:
  - "Guard isActive() para /prontuario segue o padrão já existente de /patients (startsWith)"

requirements-completed: [NAV-01, NAV-02, NAV-03]

# Metrics
duration: 10min
completed: 2026-04-02
---

# Phase 23 Plan 01: Copy Interna — Navegação e Vocabulário Summary

**Prontuário adicionado à sidebar e bottom-nav; strings proibidas (sessão, cobranças em aberto, Complete seu cadastro) substituídas por vocabulário clínico correto em dashboard e onboarding**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-02T11:46:00Z
- **Completed:** 2026-04-02T11:56:00Z
- **Tasks:** 2 (Task 1 pré-existente, Task 2 executada nesta sessão)
- **Files modified:** 4

## Accomplishments

- Sidebar exibe Início / Agenda / Pacientes / Prontuário / Financeiro / Configurações (ordem clínica)
- Bottom-nav mobile exibe Início / Agenda / Pacientes / Prontuário / Financeiro (Config removido)
- Dashboard: "Sem atendimentos hoje.", "Atendimentos realizados", "A receber", "Seu próximo atendimento começa em X min"
- Onboarding: h1 "Configure seu consultório." (era "Complete seu cadastro.")

## Task Commits

1. **Task 1: Adicionar Prontuário à sidebar e bottom-nav** - `5f5a3ac` (feat) — sessão anterior
2. **Task 2: Corrigir vocabulário no dashboard e onboarding** - `fee3ddb` (feat)

## Files Created/Modified

- `src/app/(vault)/components/vault-sidebar-nav.tsx` — item Prontuário + guard isActive /prontuario
- `src/app/(vault)/components/bottom-nav.tsx` — item Prontuário, remoção de Config, guard isActive /prontuario
- `src/app/(vault)/inicio/page.tsx` — 4 substituições de string (sessão → atendimento, cobranças → A receber)
- `src/app/(auth)/complete-profile/page.tsx` — h1 "Configure seu consultório."

## Decisions Made

- Item Prontuário posicionado entre Pacientes e Financeiro em ambas as navs: comunica que prontuário é anterior ao financeiro na hierarquia clínica.
- "A receber" substitui tanto singular quanto plural de "cobranças em aberto": reduz tom de cobrança agressiva e usa vocabulário neutro.
- Guard `isActive` para `/prontuario` segue o padrão existente de `/patients` com `startsWith` para suportar sub-rotas futuras.

## Deviations from Plan

None — plano executado exatamente como especificado. Task 2 encontrou os arquivos com algumas strings já modificadas no working tree (mudanças não commitadas de sessão anterior), commitadas normalmente como parte desta execução.

## Issues Encountered

Task 1 já estava commitada (`5f5a3ac`) de sessão anterior. Task 2 tinha as substituições presentes no working tree como mudanças não commitadas — commitadas nesta sessão.

## User Setup Required

None — sem configuração externa necessária.

## Next Phase Readiness

- Navegação interna alinhada ao vocabulário psicanalítico — pronto para Phase 24 (Continuidade e Fluxo)
- Prontuário aparece na nav mas a rota `/prontuario` ainda não existe — Phase 24 deve criar essa superfície

---
*Phase: 23-copy-interna*
*Completed: 2026-04-02*
