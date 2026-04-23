---
phase: 31-medi-o-observabilidade-e-itera-o
plan: 01
subsystem: infra
tags: [lighthouse, memlab, react-scan, performance, observability]

requires:
  - phase: 27-performance-tooling
    provides: "Bundle analyzer e CWV collector ativos"
provides:
  - "Configuração Lighthouse CI com thresholds LCP < 2.5s e CLS < 0.1"
  - "Cenário memlab para navegação pacientes -> atendimentos -> prontuario"
  - "Componente react-scan com import dinâmico dev-only no vault layout"
affects:
  - "32-motion-tokens-foundation"
  - "33-micro-interacoes-em-componentes-base"

tech-stack:
  added: [lighthouse@13.1.0, @lhci/cli@0.15.1, memlab@2.0.1, react-scan@0.5.3]
  patterns: ["Dynamic import gated by NODE_ENV para exclusão de bundle de produção"]

key-files:
  created:
    - lighthouserc.js
    - tests/memory/patient-navigation.scenario.js
    - src/components/react-scan.tsx
  modified:
    - package.json
    - src/app/(vault)/layout.tsx

key-decisions:
  - "react-scan importado dinamicamente com gate NODE_ENV === 'development' para garantir zero impacto no bundle de produção"
  - "Lighthouse CI configura 8 rotas do vault com 3 runs e thresholds rigorosos de CWV"
  - "memlab scenario navega pacientes -> atendimentos -> prontuario com waits de 2s entre passos"

patterns-established:
  - "Dev-only observability tools: dynamic import + NODE_ENV gate para ferramentas de diagnóstico local"
  - "Performance artifacts em .planning/performance/ para centralizar relatórios de auditoria"

requirements-completed: [OBS-01, OBS-03, OBS-04]

duration: 5min
completed: 2026-04-23
---

# Phase 31 Plan 01: Observability Dev-Tools Summary

**Lighthouse CI, memlab e react-scan integrados para diagnóstico local de CWV, memory leaks e re-renders — sem impacto no bundle de produção**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-23T17:33:00Z
- **Completed:** 2026-04-23T17:38:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Script `pnpm lighthouse` executa Lighthouse CI contra 8 rotas do vault com thresholds LCP < 2.5s e CLS < 0.1
- Script `pnpm memlab` executa cenário de navegação pacientes -> atendimentos -> prontuario via Puppeteer
- react-scan ativo apenas em `NODE_ENV === 'development'` via import dinâmico, montado no vault layout
- Build de produção passa sem erros e sem inclusão de react-scan no bundle

## Task Commits

Each task was committed atomically:

1. **Task 1: Instalar e configurar Lighthouse CI** - `fbbfd4a` (chore)
2. **Task 2: Configurar memlab para fluxo de navegação de pacientes** - `6edeae3` (chore)
3. **Task 3: Integrar react-scan em ambiente de desenvolvimento** - `ce94801` (feat)

**Plan metadata:** [pending]

## Files Created/Modified
- `lighthouserc.js` - Configuração Lighthouse CI com URLs do vault, thresholds LCP/CLS, e saída para filesystem
- `tests/memory/patient-navigation.scenario.js` - Cenário memlab para fluxo principal de navegação clínica
- `src/components/react-scan.tsx` - Componente client-only com import dinâmico de react-scan gated por NODE_ENV
- `src/app/(vault)/layout.tsx` - Montagem condicional de `<ReactScan />` após `<CwvCollector />`
- `package.json` - Scripts `lighthouse`, `memlab` e devDependencies adicionadas

## Decisions Made
- Seguido o plano exatamente como especificado — nenhuma decisão arquitetural adicional necessária

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Instalação do memlab gerou falha de build do módulo nativo `sleep` (dependência transitiva opcional), mas memlab@2.0.1 foi instalado com sucesso e está funcional

## Known Stubs

None.

## Threat Flags

None - todas as mitigações do threat model foram aplicadas:
- T-31-03 (react-scan information disclosure): mitigada via import dinâmico condicional a `NODE_ENV === 'development'`

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ferramentas de observabilidade prontas para uso imediato em desenvolvimento
- Próximas fases de motion e micro-interações podem usar react-scan para validar re-renders
- Lighthouse CI pode ser executado após otimizações para verificar regressões de CWV

---
*Phase: 31-medi-o-observabilidade-e-itera-o*
*Completed: 2026-04-23*
