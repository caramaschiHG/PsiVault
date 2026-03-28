---
phase: 21-brand-foundation
plan: 01
subsystem: ui
tags: [brand, copy, vocabulary, psychoanalysis, design-system]

requires: []
provides:
  - Vocabulário canônico PsiVault com tabela de 5 pares contrastivos
  - Distinção explícita PsiVault (produto) vs PsiLock (técnico)
  - Frases proibidas literais para copy e agentes AI
  - Regras do Assistente de Pesquisa (plano premium) — o que faz e não faz
  - Limites de copyright como regras gerais sem lista por autor
  - Anti-padrões visuais do app interno separados dos da landing
affects:
  - 22-landing-page
  - 23-copy-interna
  - 24-continuidade-fluxo
  - 25-plano-premium

tech-stack:
  added: []
  patterns:
    - "CLAUDE.md como fonte única de verdade de marca para agentes AI e contribuidores"

key-files:
  created: []
  modified:
    - CLAUDE.md

key-decisions:
  - "PsiVault é o nome do produto em toda superfície voltada ao usuário; PsiLock fica restrito ao repositório e ambiente técnico"
  - "Cinco pares vocabulário obrigatório/proibido documentados com contrastivos explícitos"
  - "Anti-padrões visuais do app interno documentados separados dos da landing para governar produto inteiro"

patterns-established:
  - "Posicionamento Psicanalítico como seção canônica em CLAUDE.md lida por todos os agentes antes de gerar copy"

requirements-completed:
  - BRAND-01

duration: 5min
completed: 2026-03-28
---

# Phase 21 Plan 01: Brand Foundation Summary

**Seção "Posicionamento Psicanalítico" adicionada ao CLAUDE.md com vocabulário obrigatório, frases proibidas, regras do Assistente de Pesquisa, limites de copyright e anti-padrões visuais para governar todas as fases 22–25**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-28T12:32:13Z
- **Completed:** 2026-03-28T12:37:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Nova seção `## Posicionamento Psicanalítico` inserida antes de `## Direção de Marca — Landing PsiVault`
- Distinção PsiVault/PsiLock documentada com exemplos de contexto onde cada nome se aplica
- Tabela de vocabulário com 5 pares obrigatórios/proibidos
- 5 frases proibidas literais (anti-padrões de tom)
- Regras do Assistente de Pesquisa premium: 4 capacidades + 4 limitações
- Limites de copyright como regras gerais sem lista por autor
- Anti-padrões visuais do app interno em subseção própria

## Task Commits

1. **Task 1: Adicionar seção Posicionamento Psicanalítico ao CLAUDE.md** - `97fb83e` (feat)

**Plan metadata:** _(a seguir)_

## Files Created/Modified
- `CLAUDE.md` - Nova seção de 63 linhas inserida na linha 65, antes de Direção de Marca

## Decisions Made
- PsiVault em toda superfície voltada ao usuário; PsiLock restrito ao repositório e ambiente técnico — distinção explícita com exemplos de contexto
- Anti-padrões visuais do app interno documentados em subseção própria (governa produto inteiro, não só a landing)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CLAUDE.md agora serve de fonte única de verdade de marca para qualquer agente AI ou contribuidor
- Fases 22–25 podem ser executadas com vocabulário, tom e regras visuais consistentes
- Nenhum bloqueio para Phase 21 Plan 02 (tokens visuais)

---
*Phase: 21-brand-foundation*
*Completed: 2026-03-28*
