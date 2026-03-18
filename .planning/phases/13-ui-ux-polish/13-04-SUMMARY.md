---
phase: 13-ui-ux-polish
plan: 04
subsystem: ui
tags: [react, nextjs, css, design-system, empty-state, mobile, responsive]

requires:
  - phase: 13-01
    provides: tokens tipográficos CSS (--font-size-page-title, --font-serif, etc.) e variáveis de espaçamento
  - phase: 13-02
    provides: sidebar dark, bottom nav mobile, vault layout responsivo
  - phase: 13-03
    provides: loading/error states, skeleton loaders por rota

provides:
  - EmptyState component reutilizável com ícone SVG, mensagem humanizada e botão de ação
  - 5 views primárias polidas com tipografia via tokens (inicio, agenda, pacientes, perfil, financeiro)
  - FAB mobile em /patients e /agenda para ação primária
  - Formulários de criação responsivos com .form-grid (2 colunas desktop, 1 coluna mobile)
  - Todos os títulos h1 usando var(--font-size-page-title) + var(--font-serif)

affects:
  - 14-quality-production-hardening

tech-stack:
  added: []
  patterns:
    - "EmptyState component: icon (SVG ReactNode) + title + description + actionLabel/actionHref"
    - "FAB mobile via className=fab-mobile: position fixed, hidden em desktop, flex em mobile via CSS"
    - "form-grid CSS class: 2 colunas em desktop, 1 coluna em mobile via media query 767px"

key-files:
  created:
    - src/app/(vault)/components/empty-state.tsx
  modified:
    - src/app/(vault)/inicio/page.tsx
    - src/app/(vault)/patients/page.tsx
    - src/app/(vault)/agenda/page.tsx
    - src/app/(vault)/agenda/components/agenda-day-view.tsx
    - src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx
    - src/app/(vault)/patients/[patientId]/components/documents-section.tsx
    - src/app/(vault)/patients/[patientId]/components/reminders-section.tsx
    - src/app/(vault)/patients/components/patient-profile-header.tsx
    - src/app/(vault)/financeiro/page.tsx
    - src/app/(vault)/appointments/new/page.tsx
    - src/app/(vault)/appointments/components/appointment-form.tsx
    - src/app/(vault)/patients/components/patient-form.tsx
    - src/app/globals.css

key-decisions:
  - "EmptyState é server component puro (sem use client) — pode ser importado em ambos server e client components"
  - "FAB mobile controlado exclusivamente por CSS class .fab-mobile (display:none em desktop) pois inline styles não suportam media queries"
  - "form-grid CSS class substitui fieldGridStyle inline para colapsar para 1 coluna em mobile — fieldGridStyle removido de appointment-form e patient-form"
  - "Lista de pacientes em /patients migrada de cards com gap para rows densas: border container único com minHeight por row"
  - "EmptyState aplicado em 6 superfícies: patients, agenda-day-view, clinical-timeline, documents-section, financeiro, inicio (já tinha versão inline)"

requirements-completed: [UIUX-02, UIUX-03, UIUX-04, UIUX-05, UIUX-06]

duration: 10min
completed: 2026-03-18
---

# Phase 13 Plan 04: Visual Polish — EmptyState + Typography + Mobile Summary

**EmptyState component reutilizável com SVG e ações + tipografia tokenizada em todas as views primárias + FAB mobile + formulários 1 coluna em 375px**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-18T11:16:00Z
- **Completed:** 2026-03-18T11:26:26Z
- **Tasks:** 2 de 3 (Task 3 é checkpoint humano — aguarda verificação)
- **Files modified:** 13

## Accomplishments

- Criado `EmptyState` component reutilizável: ícone SVG, título, descrição, botão de ação — aplicado em 6 superfícies
- Todos os títulos h1 das views primárias usam `var(--font-size-page-title)` (1.5rem) + `var(--font-serif)` via tokens
- Lista de pacientes migrada para rows densas com `minHeight: var(--space-row-height)` e `borderBottom` dentro de container único
- FAB mobile `+` em `/patients` e `/agenda` via CSS class `.fab-mobile`
- Formulários `/appointments/new` e `/patients/new` responsivos: `.form-grid` colapsa para 1 coluna em ≤767px

## Task Commits

1. **Task 1: Criar EmptyState e polir inicio e patients** - `d1691e8` (feat)
2. **Task 2: Polir agenda, perfil de paciente, financeiro e formulários** - `2d63016` (feat)

## Files Created/Modified

- `src/app/(vault)/components/empty-state.tsx` — EmptyState component criado
- `src/app/(vault)/inicio/page.tsx` — titleStyle e sectionTitleStyle usam tokens tipográficos
- `src/app/(vault)/patients/page.tsx` — rows densas, EmptyState, FAB mobile
- `src/app/(vault)/agenda/page.tsx` — titleStyle token, FAB mobile
- `src/app/(vault)/agenda/components/agenda-day-view.tsx` — EmptyState com ícone e botão
- `src/app/(vault)/patients/[patientId]/components/clinical-timeline.tsx` — EmptyState humanizado
- `src/app/(vault)/patients/[patientId]/components/documents-section.tsx` — EmptyState com botão de ação
- `src/app/(vault)/patients/[patientId]/components/reminders-section.tsx` — mensagem "Tudo em dia!"
- `src/app/(vault)/patients/components/patient-profile-header.tsx` — nameStyle token
- `src/app/(vault)/financeiro/page.tsx` — titleStyle token, EmptyState
- `src/app/(vault)/appointments/new/page.tsx` — titleStyle token
- `src/app/(vault)/appointments/components/appointment-form.tsx` — form-grid CSS class
- `src/app/(vault)/patients/components/patient-form.tsx` — form-grid CSS class
- `src/app/globals.css` — .fab-mobile e .form-grid com media queries

## Decisions Made

- `EmptyState` server component puro: pode ser importado em client components sem restrições
- FAB mobile via CSS class `.fab-mobile` (não inline style) pois media queries não funcionam em inline styles
- `.form-grid` CSS class substitui `fieldGridStyle` inline nos dois formulários de criação
- Lista de pacientes usa container `<ul>` com border/shadow único e items com `borderBottom` (não cards separados)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removido fieldGridStyle obsoleto após migração para .form-grid**
- **Found during:** Task 2 (appointment-form e patient-form)
- **Issue:** Variável `fieldGridStyle` declarada mas não usada após trocar para className
- **Fix:** Removida declaração de `fieldGridStyle` de ambos os arquivos
- **Files modified:** appointment-form.tsx, patient-form.tsx
- **Committed in:** 2d63016 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — cleanup de variável obsoleta)
**Impact on plan:** Limpeza necessária, sem impacto no comportamento.

## Issues Encountered

- `pnpm build` falha com erro de Prisma (DB não disponível em ambiente de build) — pré-existente, não introduzido por este plano
- 2 testes em `patient-summary.test.ts` falhando — pré-existente (verificado com git stash), não relacionado a este plano

## Next Phase Readiness

- Design system visual completo: tokens, sidebar, bottom nav, loading states, empty states, polish das views
- Task 3 (checkpoint:human-verify) aguarda verificação visual em browser (pnpm dev)
- Após aprovação: Phase 14 (Quality & Production Hardening)

---
*Phase: 13-ui-ux-polish*
*Completed: 2026-03-18*
