---
phase: 24-continuidade-e-fluxo
plan: "03"
subsystem: ui
tags: [next.js, react, prontuario, navigation, badge]

requires:
  - phase: 24-continuidade-e-fluxo
    provides: view clínica /prontuario/[patientId] criada em 24-01

provides:
  - Link "Ver prontuário" na lista aponta para /prontuario/[patientId]
  - Badge discreto "Novo acompanhamento" para pacientes sem notas clínicas

affects:
  - prontuario navigation
  - patient list UX

tech-stack:
  added: []
  patterns:
    - Badge condicional via estilo discreto (texto itálico, cor text-3, sem background) — segue anti-padrão visual do CLAUDE.md

key-files:
  created: []
  modified:
    - src/app/(vault)/prontuario/page.tsx

key-decisions:
  - "Badge 'Novo acompanhamento' é texto simples itálico sem background — não é chip colorido (anti-padrão visual do produto)"

patterns-established:
  - "Indicadores contextuais de estado usam texto discreto (fontStyle italic, color text-3) sem badge/chip visual"

requirements-completed:
  - CONT-01
  - CONT-04

duration: 5min
completed: 2026-04-03
---

# Phase 24 Plan 03: Continuidade e Fluxo — Lista de Prontuários Summary

**Link "Ver prontuário" corrigido para /prontuario/[id] e badge discreto "Novo acompanhamento" adicionado para pacientes sem notas clínicas**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-03T14:50:00Z
- **Completed:** 2026-04-03T14:55:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Link "Ver prontuário" nos cards agora aponta para `/prontuario/[patientId]` fechando o loop de navegação com a view clínica criada em 24-01
- Badge "Novo acompanhamento" aparece discretamente para pacientes sem histórico de notas, orientando o psicólogo sem ruído visual
- Estilo `newBadgeStyle` — texto itálico pequeno, cor `text-3`, sem background — respeita anti-padrões visuais definidos no CLAUDE.md
- Build limpo e 336 testes passando sem regressão

## Task Commits

1. **Task 1: Ajustar link e badge na lista de prontuários** - `7a0b1bf` (feat)

## Files Created/Modified

- `src/app/(vault)/prontuario/page.tsx` — href corrigido para /prontuario/[id], badge condicional adicionado, estilo newBadgeStyle acrescentado

## Decisions Made

Badge "Novo acompanhamento" implementado como texto simples itálico em vez de chip ou badge visual — segue diretamente a regra "Sem badges, chips coloridos ou indicadores de novidade sem função real" do CLAUDE.md. O indicador comunica estado clínico relevante (primeiro atendimento a registrar) sem adicionar peso visual.

## Deviations from Plan

None - plano executado exatamente como escrito.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Loop de navegação da lista `/prontuario` → view clínica `/prontuario/[id]` está fechado
- Pronto para phase 24 planos seguintes (se houver) ou phase 25

---
*Phase: 24-continuidade-e-fluxo*
*Completed: 2026-04-03*
