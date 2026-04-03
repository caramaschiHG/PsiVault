---
phase: 24-continuidade-e-fluxo
plan: "02"
subsystem: ui
tags: [nextjs, server-components, timeline, prontuario, clinical-view]

requires:
  - phase: 24-01
    provides: testes prontuario-timeline.test.ts em estado RED (módulo ausente)
  - phase: 23-copy-interna
    provides: vocabulário e navegação com item Prontuário inserido

provides:
  - Rota /prontuario/[patientId] como view clínica longitudinal (Server Component puro)
  - timeline.ts com buildTimeline, buildNotesByAppointment, hasNotes (funções puras testáveis)
  - loading.tsx skeleton para a view clínica

affects:
  - 25-plano-premium

tech-stack:
  added: []
  patterns:
    - "View clínica focada separada da página operacional /patients/[id]"
    - "Timeline categorizada: upcoming / completedVisible / completedHidden / dismissedAll"
    - "Funções puras em timeline.ts — testáveis independente do Server Component"
    - "details/summary HTML nativo para dismissed e completedHidden — sem JS adicional"

key-files:
  created:
    - src/app/(vault)/prontuario/[patientId]/timeline.ts
    - src/app/(vault)/prontuario/[patientId]/page.tsx
    - src/app/(vault)/prontuario/[patientId]/loading.tsx
  modified: []

key-decisions:
  - "careMode usado no lugar de serviceMode — plano tinha nome errado, modelo real usa careMode"
  - "patient.fullName usado no lugar de .name — modelo Patient expõe fullName, não name"
  - "PracticeDocument não tem campo title — DOC_LABELS mapeia o type enum diretamente"
  - "details/summary para seções recolhidas (completedHidden e dismissedAll) — HTML nativo, zero JS"

patterns-established:
  - "Funções puras de transformação de dados em arquivo .ts separado do componente — testabilidade independente"
  - "timeline.ts como módulo de domínio colocado junto à rota que o consome"

requirements-completed: [CONT-01, CONT-02, CONT-03, CONT-04]

duration: 8min
completed: "2026-04-03"
---

# Phase 24 Plan 02: Prontuário — View Clínica por Paciente Summary

**Rota /prontuario/[patientId] com timeline longitudinal categorizada (upcoming/completed/dismissed), funções puras testáveis em timeline.ts, e skeleton loading — Server Component puro**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-03T17:45:34Z
- **Completed:** 2026-04-03T17:53:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `timeline.ts` com 3 funções puras exportadas — 16 testes passando (GREEN)
- View clínica `/prontuario/[patientId]`: breadcrumb, H1 serif, seções com h2+hr, flow linear sem cards
- Upcoming marcado como "Próxima", completed numerados, dismissed recolhidos por padrão
- EmptyState com CTA para agendar quando não há atendimentos
- Seção "Documentos clínicos" sempre visível com texto discreto se vazia
- Link para nota clínica quando nota existe (`/sessions/[id]/note`)
- `loading.tsx` sem `use client`, skeleton replicando shell do page

## Task Commits

1. **Task 1: Criar timeline.ts com funções puras** - `b910308` (feat)
2. **Task 2: Criar page.tsx e loading.tsx da view clínica** - `2c869c4` (feat)

## Files Created/Modified

- `src/app/(vault)/prontuario/[patientId]/timeline.ts` - Funções puras: buildTimeline, buildNotesByAppointment, hasNotes
- `src/app/(vault)/prontuario/[patientId]/page.tsx` - View clínica Server Component puro
- `src/app/(vault)/prontuario/[patientId]/loading.tsx` - Skeleton sem use client

## Decisions Made

- `details/summary` HTML nativo para seções recolhidas — sem estado client, sem JS adicional
- Numeração de atendimentos contínua entre completedVisible e completedHidden (sessionNum = idx relativo + offset)
- Dismissed sem numeração — status textual (Cancelado / Não compareceu) como único dado

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrigido campo do modelo Patient: fullName, não name**
- **Found during:** Task 2 (page.tsx)
- **Issue:** Plano referenciava `patient.name` mas o modelo Patient expõe `patient.fullName`
- **Fix:** Substituído `patient.name` por `patient.fullName` em todos os usos
- **Files modified:** src/app/(vault)/prontuario/[patientId]/page.tsx
- **Verification:** pnpm build sem erros TypeScript
- **Committed in:** 2c869c4

**2. [Rule 1 - Bug] Corrigido campo do modelo Appointment: careMode, não serviceMode**
- **Found during:** Task 2 (page.tsx)
- **Issue:** Plano referenciava `appt.serviceMode` mas o modelo Appointment usa `appt.careMode`
- **Fix:** Substituído todos os usos de `serviceMode` por `careMode`; tipo da função `serviceLabel` atualizado para `"IN_PERSON" | "ONLINE" | "HYBRID"`
- **Files modified:** src/app/(vault)/prontuario/[patientId]/page.tsx
- **Verification:** pnpm build sem erros TypeScript
- **Committed in:** 2c869c4

**3. [Rule 1 - Bug] Removida referência a doc.title — campo não existe no modelo PracticeDocument**
- **Found during:** Task 2 (page.tsx)
- **Issue:** Plano mencionava `doc.title` mas PracticeDocument não tem esse campo; apenas `doc.type` (DocumentType enum)
- **Fix:** Seção de documentos usa apenas `DOC_LABELS[doc.type]` e `doc.createdAt`
- **Files modified:** src/app/(vault)/prontuario/[patientId]/page.tsx
- **Verification:** pnpm build sem erros TypeScript
- **Committed in:** 2c869c4

---

**Total deviations:** 3 auto-fixed (3 × Rule 1 — model field name mismatches between plan spec and actual codebase)
**Impact on plan:** Todas as correções necessárias para compatibilidade com os modelos existentes. Sem scope creep.

## Issues Encountered

Nenhum blocker. As correções de modelo foram identificadas pelo build TypeScript e resolvidas imediatamente.

## User Setup Required

None — nenhuma configuração externa necessária.

## Next Phase Readiness

- View clínica `/prontuario/[patientId]` compilada e funcional
- Timeline pronta para consumo — navegação de Prontuário já linka para `/prontuario` (Phase 23)
- Próximo: Phase 25 — Plano Premium UI/conceito (Assistente de Pesquisa)

---
*Phase: 24-continuidade-e-fluxo*
*Completed: 2026-04-03*

## Self-Check: PASSED

- FOUND: src/app/(vault)/prontuario/[patientId]/timeline.ts
- FOUND: src/app/(vault)/prontuario/[patientId]/page.tsx
- FOUND: src/app/(vault)/prontuario/[patientId]/loading.tsx
- FOUND: b910308 (feat: timeline.ts)
- FOUND: 2c869c4 (feat: page.tsx + loading.tsx)
