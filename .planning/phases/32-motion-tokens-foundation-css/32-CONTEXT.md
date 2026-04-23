# Phase 32: Motion Tokens & Foundation CSS - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Criar tokens unificados de motion (duration, easing, stagger) e utility classes CSS que servem como fundação para todo o milestone v1.5. Esta fase é puramente infraestrutura — nenhuma feature visível nova, apenas a base sobre a qual fases 33–36 construirão.

**Requirements mapeados:** MOTF-01, MOTF-02, MOTF-03, MOTF-04

</domain>

<decisions>
## Implementation Decisions

### Token Granularity & Migration
- **D-01:** Criar tokens canônicos `--duration-*` e `--ease-*`. Deprecar `--transition-fast`, `--transition-normal`, `--transition-slow` existentes e migrar todos os usos para os novos tokens nesta fase.
- **D-02:** Granularidade minimal: 3 durations + 2 easings.
  - Durations: `--duration-100` (100ms), `--duration-200` (200ms), `--duration-300` (300ms)
  - Easings: `--ease-out` (ease-out), `--ease-in-out` (ease-in-out)
- **D-03:** Stagger gap: `--stagger-gap: 60ms` — delay base entre itens em animações sequenciais.

### Reduced Motion Strategy
- **D-04:** Agent discretion — executor decide granularidade durante implementação, seguindo o princípio: transições sem movimento espacial (translate, scale > 1.02) podem permanecer em `prefers-reduced-motion: reduce`.
- **D-05:** A media query `prefers-reduced-motion: reduce` existente em `globals.css` é mantida como base. Refinamentos podem ser adicionados em `motion.css` se necessário.

### Utility Class Scope
- **D-06:** Migrar **todas** as classes animadas existentes para usar os novos tokens nesta fase. Classes a migrar: `.vault-page-transition`, `.toast-enter`, `.fab-enter`, `.search-dropdown-enter`, `.skeleton-shimmer`, `.card-hover`, `.side-panel-drawer`, `.notif-dropdown`, `.tab-panel`, `.kbd-overlay`, `.popoverFadeIn`.
- **D-07:** Criar kit básico de utilities de motion:
  - Exigidas por MOTF-03: `.motion-fade-in`, `.motion-slide-up`, `.motion-stagger`
  - Adicionais: `.motion-scale-in`, `.motion-fade-out`, `.motion-slide-down`

### File Organization & FOUC Prevention
- **D-08:** `globals.css` mantém os tokens `--duration-*` e `--ease-*` (variáveis de design system).
- **D-09:** `src/styles/motion.css` contém: keyframes, utility classes de motion, e a media query `prefers-reduced-motion`.
- **D-10:** `motion.css` é importado no topo de `globals.css` via `@import './motion.css'` (ou path relativo correto). Isso garante carregamento síncrono no critical path sem FOUC, pois `globals.css` já é importado em `layout.tsx`.
- **D-11:** Zero mudanças em `layout.tsx` — o import de `globals.css` já carrega tudo.

### the agent's Discretion
- O executor pode decidir se `--duration-100` substitui diretamente `--transition-fast` (80ms) ou se ajusta para 80ms para manter comportamento idêntico.
- O executor pode decidir a ordem exata das seções dentro de `motion.css`.
- O executor pode decidir se `.skeleton-shimmer` usa `--duration-300` ou fica com duração própria (~1.4s) fora do token scale (shimmer é exceção por ser looping).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Visão do milestone v1.5, constraints, key decisions
- `.planning/REQUIREMENTS.md` — MOTF-01 a MOTF-04 com critérios de aceitação
- `.planning/STATE.md` — Decisões acumuladas, incluindo regras de v1.5 (nada decorativo, reduced motion obrigatório)

### Existing CSS & Tokens
- `src/app/globals.css` — Tokens existentes (`--transition-*`, keyframes, hover/active states, media query `prefers-reduced-motion`)
- `src/app/layout.tsx` — Import de `globals.css` no critical path

### Out of Scope (regras do milestone)
- Parallax, 3D transforms, celebration effects, sound effects, typing animation, full-screen loading spinners, background animated gradients, dark mode motion tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `globals.css` já contém ~15 keyframes (vaultPageIn, toastSlideIn, fabEnter, searchDropdownIn, skeleton-shimmer, sidePanelFadeIn, sidePanelSlideIn, notifDropdownIn, tabFadeIn, kbdFadeIn, popoverFadeIn, badgeDotPulse, spin)
- `globals.css` já tem media query `prefers-reduced-motion: reduce` no final
- Classes utilitárias existentes: `.card-hover`, `.btn-primary`/`.btn-secondary`/`.btn-ghost`/`.btn-danger` com hover/active, `.input-field` com focus, `.nav-link` com hover/active

### Established Patterns
- Tokens CSS no `:root` de `globals.css` — 50+ variáveis organizadas por categoria (colors, typography, spacing, shadows, radii, z-index)
- Transições atualmente usam durações hardcoded (0.12s, 0.15s, 0.08s) ou `--transition-fast/normal/slow`
- `scroll-behavior: smooth` no html
- `:focus-visible` com outline sólido

### Integration Points
- `src/app/layout.tsx` importa `globals.css` — ponto único de injeção CSS
- `src/app/(vault)/layout.tsx` herda o CSS do root layout
- Componentes Server Components usam classes CSS puras (sem JS) — utilities de motion devem funcionar sem JavaScript

</code_context>

<specifics>
## Specific Ideas

- Shimmer de skeleton (`skeleton-shimmer`) é uma exceção — duração ~1.4s em loop, fora do scale de tokens de interação. Pode manter sua própria duração ou usar `--duration-300` como base e multiplicar via animation-duration hardcoded.
- A migração de `--transition-*` para `--duration-*` + `--ease-*` deve ser mecânica: substituir `var(--transition-fast)` por `var(--duration-100) var(--ease-out)`, etc.
- `--stagger-gap: 60ms` deve ser usado via `animation-delay: calc(var(--stagger-index) * var(--stagger-gap))` ou `transition-delay` em `.motion-stagger`.

</specifics>

<deferred>
## Deferred Ideas

- Ripple effect em botões — questionável para o tom PsiVault; prototipar antes (REQUIREMENTS.md "Future Requirements")
- View Transition API nativa do browser — esperar suporte cross-browser estável
- Dark mode motion tokens — dark mode não está no roadmap atual

</deferred>

---

*Phase: 32-motion-tokens-foundation-css*
*Context gathered: 2026-04-23*
