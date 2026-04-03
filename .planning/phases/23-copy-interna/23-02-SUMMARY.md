---
phase: 23-copy-interna
plan: "02"
subsystem: ui
tags: [next.js, react, server-components, clinical-copy, prontuario]

requires:
  - phase: 23-01
    provides: navegação vault com item Prontuário ativo
provides:
  - Rota /prontuario com lista de pacientes ordenada por atividade clínica recente
  - loading.tsx skeleton consistente com padrão vault
affects: [24-continuidade-e-fluxo]

tech-stack:
  added: []
  patterns:
    - "Promise.all para buscar notas de múltiplos pacientes em paralelo"
    - "Ordenação client-side por latestNote.createdAt para priorizar pacientes com atividade recente"

key-files:
  created:
    - src/app/(vault)/prontuario/page.tsx
    - src/app/(vault)/prontuario/loading.tsx
  modified: []

key-decisions:
  - "getClinicalNoteRepository é o export correto do store (não getClinicalRepository)"
  - "listByPatient recebe (patientId, workspaceId) — ordem confirmada no contrato da interface"

patterns-established:
  - "Página clínica ordena pacientes por data da última nota, sem nota ficam ao final"

requirements-completed: [NAV-01]

duration: 8min
completed: 2026-04-02
---

# Phase 23 Plan 02: Copy Interna — Rota /prontuario Summary

**Rota /prontuario com lista de pacientes ativos ordenada por data da última evolução clínica, usando vocabulário psicanalítico correto em todo copy**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-02T08:54:00Z
- **Completed:** 2026-04-02T09:02:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- page.tsx como Server Component async com resolveSession() + workspaceId scope, buscando pacientes e notas em paralelo via Promise.all
- Ordenação por atividade clínica: pacientes com nota mais recente primeiro, sem nota ficam ao final
- loading.tsx com skeleton-pulse, shellStyle idêntico ao page.tsx para evitar layout shift

## Task Commits

1. **Task 1: Criar prontuario/page.tsx** - `21798d8` (feat)
2. **Task 2: Criar prontuario/loading.tsx** - `c83095e` (feat)

## Files Created/Modified

- `src/app/(vault)/prontuario/page.tsx` — Lista clínica ordenada por atividade recente, vocabulário psicanalítico correto
- `src/app/(vault)/prontuario/loading.tsx` — Skeleton Server Component com 3 cards placeholder

## Decisions Made

- `getClinicalNoteRepository` é o export correto do store, não `getClinicalRepository` (corrigido via Rule 1)
- `listByPatient` recebe `(patientId, workspaceId)` — ordem confirmada ao ler a interface, não seguia o plano que tinha ordem invertida

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Nome de export incorreto no clinical store**
- **Found during:** Task 1 (compilação TypeScript)
- **Issue:** Plano referenciava `getClinicalRepository` mas o export real é `getClinicalNoteRepository`
- **Fix:** Corrigido import e chamada para `getClinicalNoteRepository`
- **Files modified:** src/app/(vault)/prontuario/page.tsx
- **Verification:** pnpm tsc --noEmit sem erros
- **Committed in:** 21798d8 (Task 1 commit)

**2. [Rule 1 - Bug] Ordem dos parâmetros de listByPatient invertida no plano**
- **Found during:** Task 1 (revisão do contrato da interface)
- **Issue:** Plano dizia `listByPatient(workspaceId, patientId)` mas interface real é `listByPatient(patientId, workspaceId)`
- **Fix:** Corrigida ordem para `clinicalRepo.listByPatient(p.id, workspaceId)`
- **Files modified:** src/app/(vault)/prontuario/page.tsx
- **Verification:** Lógica de filtragem correta ao ler implementação in-memory
- **Committed in:** 21798d8 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 - Bug)
**Impact on plan:** Ambos necessários para corretude. Sem scope creep.

## Issues Encountered

Nenhum além das deviations documentadas acima.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Rota /prontuario acessível e funcional — item de navegação da sidebar (23-01) já aponta para ela
- Vocabulário clínico correto em todo copy da rota
- Phase 24 (Continuidade e Fluxo) pode construir sobre este padrão para hierarquia de prontuário e empty states

---
*Phase: 23-copy-interna*
*Completed: 2026-04-02*
