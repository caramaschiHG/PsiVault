# Phase 34: Feedback de Ação e Loading - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 34-feedback-de-acao-e-loading
**Areas discussed:** Toast Animation

---

## Toast: AnimatePresence ou CSS puro?

| Option | Description | Selected |
|--------|-------------|----------|
| Manter CSS-first — refinar o que existe | Ajustar keyframes CSS para slide+fade na entrada e fade na saída, sem adicionar bibliotecas. Respeita a decisão CSS-first da Phase 32 e evita bundle adicional. | ✓ |
| Adicionar Framer Motion só para toasts | Usar AnimatePresence para enter/exit mais fluido. Adiciona ~30-40kb ao bundle, mas simplifica animações de entrada/saída. Quebra o padrão CSS-first do milestone. | |
| Você decide | Deixar a escolha técnica a critério do executor/planner. | |

**User's choice:** Manter CSS-first — refinar o que existe
**Notes:** Usuário confirmou que prefere manter a abordagem CSS-first do projeto, sem adicionar Framer Motion apenas para toasts. O sistema atual (toast-provider.tsx com .toast-enter) é suficiente como base.

---

## Duração e comportamento da saída do toast

| Option | Description | Selected |
|--------|-------------|----------|
| Entrada e saída ambas ≤300ms | Ajustar tanto enter quanto exit para 300ms ou menos. Exit com fade puro (sem slide), duração ~200ms. Toast fica visível por ~3s antes de iniciar saída. | ✓ |
| Saída mais lenta que entrada | Entrada rápida (~200ms slide+fade) para aparecer instantaneamente, saída suave (~300ms fade) para desaparecer calmamente. | |

**User's choice:** Entrada e saída ambas ≤300ms
**Notes:** Usuário optou por durações curtas e simétricas, alinhado com o tom discreto e calmo do PsiVault.

---

## Toast stack reposicionamento

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, animar o reposicionamento | Quando um toast é removido, os toasts abaixo deslizam suavemente para cima (~200ms). Visual mais polido, mas mais complexo com CSS puro. | |
| Não, reposicionamento instantâneo | Toasts abaixo pulam instantaneamente para a nova posição. Mais simples e alinhado com o tom discreto do PsiVault. | ✓ |

**User's choice:** Não, reposicionamento instantâneo
**Notes:** Preferência por simplicidade e alinhamento com o tom discreto. Evita complexidade de layout animation com CSS puro.

---

## the agent's Discretion

- Button loading pattern unification (FEED-02) — executor/planner decide abordagem
- Skeleton shimmer refinement (FEED-03) — executor/planner decide se ajusta
- Spinner component extraction (FEED-04) — executor/planner decide
- Form error feedback wiring (FEED-05) — executor/planner verifica e completa

## Deferred Ideas

None — discussion stayed within phase scope.

---
