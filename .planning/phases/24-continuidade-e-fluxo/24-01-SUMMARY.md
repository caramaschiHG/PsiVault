---
phase: 24-continuidade-e-fluxo
plan: 01
subsystem: testing
tags: [vitest, timeline, prontuario, clinical, appointments]

requires:
  - phase: 23-copy-interna
    provides: navegação e vocabulário interno com posicionamento psicanalítico
  - phase: 03-clinical-record-core
    provides: ClinicalNote model e appointmentId linkage

provides:
  - Contratos de teste (RED) para buildTimeline, buildNotesByAppointment e hasNotes
  - Fixtures makeAppt e makeNote reutilizáveis para Plan 02
  - Cobertura de CONT-01 (ordenação cronológica), CONT-02 (lookup por appointmentId), CONT-04 (empty states)

affects:
  - 24-02 (implementação das funções puras da timeline)

tech-stack:
  added: []
  patterns:
    - "Wave 0 scaffold: testes em RED referenciando módulo futuro com import path exato"
    - "makeAppt/makeNote fixture factories com Partial<T> overrides para testabilidade"

key-files:
  created:
    - tests/prontuario-timeline.test.ts
  modified: []

key-decisions:
  - "Import path @/app/(vault)/prontuario/[patientId]/timeline é o contrato — Plan 02 deve criar exatamente este módulo"
  - "buildTimeline retorna estrutura com upcoming (null ou Appointment), completedVisible (até 5), completedHidden (excedente) e dismissedAll (CANCELED + NO_SHOW)"
  - "dismissed em ordem decrescente por startsAt — consistente com completedVisible"

patterns-established:
  - "Wave 0 scaffold: arquivo de teste com imports que falham deliberadamente sinaliza contrato para executor downstream"

requirements-completed: [CONT-01, CONT-02, CONT-04]

duration: 1min
completed: 2026-04-03
---

# Phase 24 Plan 01: Prontuario Timeline — Scaffold de Testes Summary

**Scaffold de testes (RED) para lógica de montagem da timeline cronológica do prontuário, cobrindo buildTimeline, buildNotesByAppointment e hasNotes com 14 casos de teste.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-03T10:08:26Z
- **Completed:** 2026-04-03T10:09:26Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Criado `tests/prontuario-timeline.test.ts` com 14 casos de teste cobrindo CONT-01, CONT-02 e CONT-04
- RED state confirmado: falha por `Cannot find module '@/app/(vault)/prontuario/[patientId]/timeline'` — sem erro de sintaxe TypeScript
- Fixtures reutilizáveis `makeAppt` e `makeNote` com `Partial<T>` overrides estabelecidas para Plan 02

## Task Commits

1. **Task 1: Criar scaffold de testes prontuario-timeline** - `e7a7caf` (test)

**Plan metadata:** (a criar neste commit)

## Files Created/Modified

- `tests/prontuario-timeline.test.ts` - Contratos de teste para buildTimeline, buildNotesByAppointment e hasNotes — 302 linhas, 14 casos

## Decisions Made

- Import path `@/app/(vault)/prontuario/[patientId]/timeline` é o contrato exato que Plan 02 deve implementar — o módulo não existe intencionalmente
- `buildTimeline` retorna estrutura `{ upcoming, completedVisible, completedHidden, dismissedAll }` com semântica clara de cada bucket
- `dismissedAll` em ordem cronológica decrescente (consistente com `completedVisible`) — apenas status CANCELED e NO_SHOW

## Deviations from Plan

None - plano executado exatamente como especificado.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 pode usar `tests/prontuario-timeline.test.ts` diretamente como contrato de implementação
- Criar `src/app/(vault)/prontuario/[patientId]/timeline.ts` com as três funções exportadas faz os testes passar (GREEN)
- Nenhum bloqueador

---
*Phase: 24-continuidade-e-fluxo*
*Completed: 2026-04-03*
