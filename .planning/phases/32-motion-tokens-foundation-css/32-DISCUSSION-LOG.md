# Phase 32: Motion Tokens & Foundation CSS - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 32-Motion Tokens & Foundation CSS
**Areas discussed:** Token Granularity & Migration, Reduced Motion Strategy, Utility Class Scope, File Organization & FOUC Prevention

---

## Token Granularity & Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Substituir tudo | Criar tokens canônicos --duration-* e --ease-*; deprecar --transition-* e migrar todos os usos nesta fase | V |
| Coexistir com aliases | Manter --transition-* como aliases apontando para novos tokens | |
| Manter separados | Duas famílias com propósitos distintos | |

**User's choice:** Substituir tudo
**Notes:** Tokens existentes --transition-fast/normal/slow serão totalmente substituídos por --duration-* e --ease-*.

---

## Token Steps

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal (3+2) | Durations: 100ms, 200ms, 300ms. Easings: ease-out, ease-in-out | V |
| Standard (5+3) | Durations: 50, 100, 150, 200, 300, 500ms. Easings: out, in-out, spring-like | |
| Comprehensive (7+4) | Durations: 50, 100, 150, 200, 300, 500, 800ms. Easings: out, in-out, spring-like, smooth | |

**User's choice:** Minimal (3+2)
**Notes:** Cobre 90% dos casos do milestone com pouco excesso.

---

## Stagger Gap

| Option | Description | Selected |
|--------|-------------|----------|
| 40ms | Rápido e sutil. 10 itens = 400ms total | |
| 60ms (recomendado) | Equilíbrio entre ritmo perceptível e velocidade. 10 itens = 600ms total | V |
| 80ms | Ritmo mais deliberado. 10 itens = 800ms total | |

**User's choice:** 60ms
**Notes:** Recomendado — cada item claramente sequencial, mas não lento.

---

## Reduced Motion Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Nuclear — tudo instantâneo | Manter regra atual. Zero transições e zero animações em reduced motion | |
| Preservar transições de estado | Regra nuclear + classe .motion-essential para estado com duration mínima | |
| Deixar o sistema decidir | Executor decide granularidade durante implementação | V |

**User's choice:** Deixar o sistema decidir
**Notes:** Executor segue princípio: transições sem movimento espacial (translate, scale > 1.02) podem permanecer em reduced motion.

---

## Utility Class Scope — Existing Classes

| Option | Description | Selected |
|--------|-------------|----------|
| Migrar tudo nesta fase | Todas as classes animadas existentes refatoradas para usar novos tokens | V |
| Migrar apenas as 3 exigidas | Criar .motion-fade-in, .motion-slide-up, .motion-stagger; deixar resto como está | |
| Criar utilities genéricas + migrar gradual | Kit completo + migração gradual nas próximas fases | |

**User's choice:** Migrar tudo nesta fase
**Notes:** Inclui: .vault-page-transition, .toast-enter, .fab-enter, .skeleton-shimmer, .card-hover, .side-panel-drawer, .notif-dropdown, .tab-panel, .kbd-overlay, .popoverFadeIn.

---

## Utility Class Scope — Extra Utilities

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas o mínimo + migração | Só as 3 exigidas por MOTF-03 | |
| Kit básico de entrada | 3 exigidas + .motion-scale-in, .motion-fade-out, .motion-slide-down | V |
| Kit completo de entrada/saída | Todas as anteriores + .motion-slide-left, .motion-slide-right, .motion-expand, .motion-collapse | |

**User's choice:** Kit básico de entrada
**Notes:** Cobre 95% dos casos do milestone.

---

## File Organization & FOUC Prevention

| Option | Description | Selected |
|--------|-------------|----------|
| Motion.css como @import em globals.css | Tokens em globals.css; keyframes/utilities/reduced-motion em motion.css; importado via @import no topo de globals.css | V |
| Motion.css importado no layout.tsx | Import explícito no root layout.tsx | |
| Tudo unificado em globals.css | Seção única dentro de globals.css, sem arquivo separado | |

**User's choice:** Motion.css como @import em globals.css
**Notes:** Zero mudanças em layout.tsx; globals.css já está no critical path.

---

## the agent's Discretion

- Reduced Motion Strategy: user explicitly deferred to agent discretion.
- Skeleton shimmer duration: agent may decide if it stays outside token scale (~1.4s loop) or uses --duration-300 as base.
- Exact transition value mapping: agent may adjust --duration-100 to 80ms if exact behavioral parity with old --transition-fast is desired.

## Deferred Ideas

- Ripple effect em botões — questionável para tom PsiVault; prototipar antes
- View Transition API nativa do browser — esperar suporte cross-browser estável
- Dark mode motion tokens — dark mode não está no roadmap

---

*Phase: 32-motion-tokens-foundation-css*
*Discussion log: 2026-04-23*
