# Phase 35: Listas e Transições de Página - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Animar a entrada de listagens, transicionar suavemente entre rotas do vault, animar expand/collapse de cards/filtros, e dar feedback visual em adição/remoção de itens. Esta fase constrói sobre os tokens de motion (Phase 32), micro-interações (Phase 33) e feedback de ação (Phase 34).

**Requirements mapeados:** LIST-01, LIST-02, LIST-03, LIST-04

**O que esta fase entrega:**
- Listagens principais com staggered animation de entrada (cap em 10 itens)
- Transição suave entre rotas do vault (fade ≤150ms, sem bloquear clicks rápidos)
- Cards e filtros expansíveis com layout animation de altura suave
- Feedback visual de movimento em adição/remoção de itens em listas

**O que esta fase NÃO entrega:**
- Motion audit completo (Phase 36)
- Novas funcionalidades de listagem — apenas animação do que já existe

</domain>

<decisions>
## Implementation Decisions

### Staggered List Animation (LIST-01)
- **D-01:** Aplicar stagger via **inline style com `--stagger-index`** em cada `.map()` que renderiza listas.
  - Exemplo: `patients.map((p, i) => <ListItem key={p.id} style={{ '--stagger-index': i }} ... />)`
  - Mantém Server Components como Server Components — sem wrapper Client Component.
- **D-02:** **Apenas listas verticais simples** recebem stagger: `/pacientes`, financeiro charge list, `/prontuário`.
  - Agenda day/week/month view **fica fora** — layout já complexo, stagger competiria visualmente.
- **D-03:** Animação por item: **slideUp** (`fadeIn + translateY(8px)`) com duração `--duration-200`.
  - Reutiliza keyframe `slideUp` existente em `motion.css`.
  - `animation-delay` calculado via `calc(var(--stagger-index) * var(--stagger-gap))`.
- **D-04:** **Cap em 10 itens:** itens 1–10 recebem stagger progressivo, itens 11+ aparecem instantaneamente (sem delay).
  - Condição no `.map()`: `i < 10 ? { '--stagger-index': i } : {}`.
- **D-05:** Stagger dispara **apenas no carregamento inicial da página**.
  - Filtros, buscas, mudanças de estado e re-renders não re-animam a lista.
  - Garante calma e evita distração em uso frequente.

### Page Transitions (LIST-02)
- **D-06:** `.vault-page-enter` já existe em `layout.tsx` com `vaultPageIn` (200ms). Ajustar duração para **≤150ms** conforme requisito.
- **D-07:** Manter abordagem CSS-only — animação via classe `.vault-page-enter` no container de conteúdo do vault.

### Expand/Collapse (LIST-03)
- Não discutido com o usuário — a critério do executor/planner.

### Add/Remove Feedback (LIST-04)
- Não discutido com o usuário — a critério do executor/planner.

### the agent's Discretion
- **Page transitions:** Se a animação deve ser pulada em navegações rápidas consecutivas (ex: double-click no nav).
- **Expand/collapse:** Técnica exata para animar altura (`grid-template-rows` vs `max-height`) e quais componentes recebem (ex: `details`/`summary` existentes na agenda).
- **Add/remove:** Como animar adição/remoção em listas client-side (financeiro) sem Framer Motion — possível uso de `@starting-style` ou classe de transição temporária.
- **Prefers-reduced-motion:** Como `.motion-stagger` deve se comportar em `prefers-reduced-motion: reduce` (provavelmente remover delays e aplicar fade instantâneo).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Visão do milestone v1.5, constraints, key decisions
- `.planning/REQUIREMENTS.md` — LIST-01 a LIST-04 com critérios de aceitação
- `.planning/STATE.md` — Decisões acumuladas, regras de v1.5

### Prior Phase Context
- `.planning/phases/32-motion-tokens-foundation-css/32-CONTEXT.md` — Tokens de motion, utility classes, prefers-reduced-motion
- `.planning/phases/33-micro-interacoes-em-componentes-base/33-CONTEXT.md` — Micro-interações base, card hover, focus rings
- `.planning/phases/34-feedback-de-acao-e-loading/34-CONTEXT.md` — Toast animations, skeleton shimmer, spinner, CSS-only approach

### Existing Code
- `src/styles/motion.css` — Keyframes (`slideUp`, `fadeIn`, `vaultPageIn`), utility classes (`.motion-stagger`, `.motion-fade-in`, `.motion-slide-up`), `prefers-reduced-motion` media query
- `src/app/globals.css` — `.vault-page-enter`, `.vault-page-transition`, tokens `--duration-*`, `--ease-*`, `--stagger-gap`
- `src/app/(vault)/layout.tsx` — Vault layout com `<div className="vault-page-enter">{children}</div>`
- `src/components/ui/list.tsx` — Componentes `List`, `ListItem`, `ListEmpty`
- `src/components/ui/card.tsx` — Componente `Card` com variantes e `card-hover`

### Out of Scope (regras do milestone)
- Parallax, 3D transforms, celebration effects, sound effects, typing animation, full-screen loading spinners, background animated gradients, dark mode motion tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`.motion-stagger`** (`motion.css`): Utility CSS que aplica `animation-delay` baseado em `--stagger-index`. Pronto para uso — só precisa de `--stagger-index` inline em cada filho.
- **Keyframe `slideUp`** (`motion.css`): `translateY(8px) + fadeIn`, duração tokenizada. Perfeito para entrada de listas.
- **`.vault-page-enter`** (`layout.tsx` + `globals.css`): Container de conteúdo do vault já anima com `vaultPageIn`. Só precisa de ajuste de duração para 150ms.
- **`List` / `ListItem`** (`src/components/ui/list.tsx`): Server Components que renderizam `<ul>` / `<li>`. Fácil de estender com inline styles para stagger.

### Established Patterns
- **CSS-first approach:** Todas as animações usam keyframes CSS e classes. Zero bibliotecas de animação (Framer Motion, etc.).
- **Tokens em globals.css:** `--duration-100/200/300`, `--ease-out/in-out`, `--stagger-gap: 60ms`. Todas as transições devem usar estes tokens.
- **prefers-reduced-motion:** Media query em `motion.css` cobre `.motion-fade-in`, `.motion-slide-up`, `.motion-stagger`, `.vault-page-enter`, etc. Qualquer nova classe de animação deve ser adicionada aqui.
- **Server Components puros:** `List`, `ListItem`, `Card` são Server Components. Stagger deve funcionar sem torná-los Client Components.

### Integration Points
- **Vault layout** (`src/app/(vault)/layout.tsx`): `.vault-page-enter` envolve todo o conteúdo da rota. Mudanças na duração afetam todas as páginas do vault.
- **Páginas com listas:** `/pacientes` (server, usa `List`/`ListItem`), `/financeiro` (client-side charge list em `FinanceiroPageClient`), `/prontuario` (server). Stagger deve ser aplicado em cada uma.
- **`details`/`summary` na agenda:** Elementos nativos de expand/collapse em `agenda/page.tsx`. Se forem animados, requer técnica de height animation.

</code_context>

<specifics>
## Specific Ideas

- Stagger aplicado apenas no carregamento inicial — filtros e buscas não devem causar re-animar. Isso evita "dança" visual em uso frequente.
- Cap em 10 itens evita delays excessivos em listas longas — item 10 aparece em 540ms, o resto é instantâneo.
- Agenda day/week view tem layout complexo com cards de horário e grid — stagger aqui seria visualmente confuso, por isso fica fora.
- `.vault-page-enter` já existe — não criar novo mecanismo, apenas ajustar duração do token ou do keyframe.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 35-listas-e-transi-es-de-p-gina*
*Context gathered: 2026-04-24*
