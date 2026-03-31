---
phase: 22-landing-page
plan: "01"
subsystem: landing
tags: [copy, hero, features, posicionamento, nicho-psicanalitico]
dependency_graph:
  requires: [21-brand-foundation]
  provides: [landing-hero-psicanalítico, features-prontuário-first]
  affects: [landing-page.tsx]
tech_stack:
  added: []
  patterns: [inline-styles, server-component]
key_files:
  created: []
  modified:
    - src/app/components/landing/landing-page.tsx
decisions:
  - "[22-01-01]: Eyebrow do hero usa formulação literal 'Para psicólogos de orientação psicanalítica' — posicionamento de nicho explícito desde a primeira linha visível"
  - "[22-01-02]: H1 usa prontuário, continuidade e acompanhamento como vocabulário central — sem jargão teórico psicanalítico (sem transferência/inconsciente/pulsão)"
  - "[22-01-03]: Mockup do hero substituído por tela de prontuário com evoluções cronológicas numeradas — remove agenda de horários que comunicava produto genérico"
  - "[22-01-04]: features[0] é Prontuário e evolução clínica — ordem comunica prioridade clínica da ferramenta"
metrics:
  duration: "~5min"
  completed_date: "2026-03-30"
  tasks_completed: 3
  files_modified: 1
requirements_fulfilled:
  - LAND-01
  - LAND-02
---

# Phase 22 Plan 01: Hero e Features Psicanalíticos — Summary

**One-liner:** Hero reposicionado para nicho psicanalítico com eyebrow explícito, mockup de prontuário com evoluções cronológicas e features reordenadas com Prontuário em primeiro lugar.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Reescrever hero copy (eyebrow, H1, lead, bullets) | fd7a729 | landing-page.tsx |
| 2 | Substituir mockup do hero (Agenda de hoje → Prontuário) | d18ee0c | landing-page.tsx |
| 3 | Reordenar e reescrever features array (Prontuário primeiro) | 7de853d | landing-page.tsx |

## What Was Built

### Task 1 — Hero copy reescrito

Eyebrow: `"Para psicólogos de orientação psicanalítica"` (antes: "Para psicólogos no Brasil")

H1: `"Prontuário, continuidade e acompanhamento para quem pratica psicanálise."` com `<em>` no início.

Lead: foco em continuidade do caso, evoluções cronológicas, ambiente discreto e organizado.

Bullets:
1. "Registros de evolução, acompanhamento e documentos no mesmo contexto."
2. "Prontuário vinculado ao paciente, não ao atendimento isolado."
3. "Acesso exclusivo à sua prática, com sigilo desde a estrutura."

### Task 2 — Mockup substituído

Chrome label: `"PsiVault — Prontuário"` (antes: "PsiVault — Agenda de hoje")

workspaceMain agora exibe:
- Topline: "Prontuário — Helena Prado" com badge "em acompanhamento"
- PatientCard: "Desde março de 2024 / Atendimento semanal" (removido horário 14:00)
- Grid: lista de evoluções com datas (12 mar, 05 mar, 26 fev) e sessões numeradas (Sessão 18/17/16)
- Card de registro: texto neutro e operacional sem interpretações clínicas

### Task 3 — Features reordenadas e reescritas

Nova ordem: Prontuário > Pacientes > Agenda > Documentos > Financeiro > Online/Presencial

Todos os 6 títulos e copies reescritos com vocabulário de prática analítica:
- Prontuário: "O histórico cresce junto com o acompanhamento"
- Pacientes: "contexto clínico preservado em um só lugar"
- Agenda: "para quem atende com continuidade e método"
- Documentos: "próximos do caso, não fora dele"
- Financeiro: mantido direto, sem hype
- Online/Presencial: "organização clínica se mantém a mesma"

## Deviations from Plan

None — plano executado exatamente como escrito.

## Verification

- `pnpm tsc --noEmit`: zero erros
- `grep "Para psicólogos no Brasil"`: 0 resultados
- `grep "psicanalítica"`: 1 resultado (eyebrow)
- `grep "Agenda de hoje"`: 0 resultados
- `features[0].title`: "Prontuário e evolução clínica" — começa com "Prontuário"

## Self-Check: PASSED

- FOUND: src/app/components/landing/landing-page.tsx
- FOUND: fd7a729 (task 1 commit)
- FOUND: d18ee0c (task 2 commit)
- FOUND: 7de853d (task 3 commit)
