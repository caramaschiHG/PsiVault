# Phase 36: Polish, Accessibility & Measurement — Context

**Gathered:** 2026-04-26
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous execution)

<domain>
## Phase Boundary

Motion é consistente, acessível e não regressa a performance objetiva. Audit page-by-page confirma feedback visual consistente. Teste com `prefers-reduced-motion: reduce` ativo mostra zero animações persistentes. INP e CLS permanecem dentro dos thresholds. CLAUDE.md documenta padrões de motion.

</domain>

<decisions>
## Implementation Decisions

### Already Implemented
- `prefers-reduced-motion: reduce` em motion.css cobre classes utilitárias, keyframes e transições
- Tokens `--duration-*` e `--ease-*` consolidados em globals.css
- Skeleton shimmer, toast animations, input shake, page transitions já existem

### Gaps Found
- `quick-create-popover.tsx` usava `animation: "popoverFadeIn ..."` inline — não coberto por `prefers-reduced-motion`
- CLAUDE.md não documentava padrões de motion

</decisions>

<code_context>
## Existing Code Insights

### motion.css
- `@media (prefers-reduced-motion: reduce)` cobre 20+ classes
- Keyframes: fadeIn, fadeOut, slideUp, slideDown, scaleIn, skeleton-shimmer, vaultPageIn, spin, toastSlideIn, fabEnter, searchDropdownIn, badgeDotPulse, tabFadeIn, kbdFadeIn, notifDropdownIn, sidePanelFadeIn, sidePanelSlideIn, popoverFadeIn, inputShake, toastFadeOut

### globals.css
- Transições de hover/focus em botões, cards, inputs — todas usam `--duration-100` ou `--duration-200`

</code_context>

<specifics>
## Specific Ideas

- Mover `popoverFadeIn` de inline para classe `.popover-enter` em motion.css
- Adicionar `.popover-enter` ao `prefers-reduced-motion`
- Documentar motion tokens e anti-padrões em CLAUDE.md

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
