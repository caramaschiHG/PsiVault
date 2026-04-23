# Phase 33: Micro-interações em Componentes Base - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Adicionar micro-interações visuais (hover, focus, active, disabled, cursor, scroll) em todos os elementos interativos do app — botões, cards, inputs, navegação. Esta fase constrói sobre os tokens de motion estabelecidos na Phase 32.

**Requirements mapeados:** MICR-01, MICR-02, MICR-03, MICR-04, MICR-05, MICR-06, MICR-07

**O que esta fase entrega:**
- Hover/elevation consistente em todos os cards interativos
- Focus rings elegantes e visíveis em todos os elementos focáveis (WCAG 2.1 AA)
- Micro-interações em inputs: floating labels, border glow no focus, shake sutil em erro
- Indicador de estado ativo com transição suave na navegação
- Cursores apropriados em todos os elementos interativos
- Smooth scroll global (já existe, verificar reduced motion fallback)

**O que esta fase NÃO entrega:**
- Animações de entrada/saída de listas (Phase 35)
- Estados de loading/toast/skeleton (Phase 34)
- Page transitions (Phase 35)
- Motion audit completo (Phase 36)

</domain>

<decisions>
## Implementation Decisions

### Card Hover (MICR-02)
- **D-01:** Cards clicáveis mantêm hover com `translateY(-2px)` + elevação de sombra (`--shadow-xs` → `--shadow-md`).
- **D-02:** O componente `Card` aplica estilos de hover **automaticamente** quando é interativo (quando `onClick` está presente ou está dentro de um link).
- **D-03:** Cards não-clicáveis (containers de informação estáticos) — **a critério do executor**. Se aplicar hover, usar sombra sutil crescente sem movimento vertical.

### Focus Ring Refinement (MICR-03)
- **D-04:** Migrar focus ring de `outline` para `box-shadow` em todos os elementos focáveis (botões, links, nav items). Box-shadow respeita `border-radius` em todos os browsers e é visualmente mais refinado.
- **D-05:** Focus ring com transição suave de aparecimento (`transition: box-shadow var(--duration-100)`).
- **D-06:** Inputs mantêm glow suave diferenciado (`box-shadow: 0 0 0 3px rgba(..., 0.1)`) — não usar o ring visível dos botões em campos de formulário.
- **D-07:** Em fundo escuro (sidebar, `--color-sidebar-bg: #2d1810`), usar variante clara do focus ring para garantir contraste.
- **D-08:** Manter offset de 2px entre o elemento e o ring, simulado via técnica de double-shadow (`box-shadow: 0 0 0 2px bg, 0 0 0 4px accent`).
- **D-09:** Focus ring visível **apenas na navegação por teclado** (`:focus-visible`). Cliques de mouse/touch não mostram ring.
- **D-10:** Ao perder foco, o ring faz fade-out suave (mesma transição `var(--duration-100)`).

### Input Micro-interactions (MICR-04)
- **D-11:** Incluir **floating labels** em todos os inputs focáveis: `text`, `email`, `password`, `select`, `textarea`.
- **D-12:** Labels flutuam (sobem e diminuem) tanto no **focus** quanto quando o input tem **valor preenchido**.
- **D-13:** **Shake de erro** é disparado por classe CSS (`.input-error-shake`) adicionada pelos componentes de formulário quando detectam erro.
- **D-14:** Shake sutil: movimento lateral de 2px (`translateX(-2px)` → `translateX(2px)` → `0`), duração `--duration-200`.
- **D-15:** Shake acompanhado de **transição de cor da borda** para vermelho (`var(--color-error-border)`).
- **D-16:** Shake ocorre **uma única vez** quando o erro é detectado. Não repete.

### Navigation Active State (MICR-05)
- **D-17:** O indicador de item ativo na **sidebar desktop** transiciona suavemente (`transition: background-color, color, box-shadow` com `--duration-200`).
- **D-18:** A transição do indicador ativo aplica-se **apenas à sidebar desktop**. Bottom nav mobile mantém mudança instantânea.
- **D-19:** O `box-shadow: inset` (borda laranja à esquerda do item ativo) **faz parte da transição** — aparece/desaparece suavemente.
- **D-20:** Nav items **não têm feedback de press/active** (sem `scale` ou `opacity` no click). Apenas hover + indicador ativo.
- **D-21:** Hover em nav items da sidebar usa transição mais lenta (`--duration-300`) que botões (`--duration-200`), criando sensação de calma na navegação.

### Cursor Strategy (MICR-06)
- **D-22:** Auditoria de cursores **elemento por elemento**. Revisar manualmente todos os componentes interativos (cards clicáveis, rows interativas, FABs, etc.) e garantir `cursor: pointer` (ou `wait`, `not-allowed` onde apropriado).

### Smooth Scroll (MICR-07)
- **D-23:** `scroll-behavior: smooth` já está habilitado globalmente no `html`. Verificar que o fallback para `prefers-reduced-motion: reduce` está funcionando (já existe em globals.css).

### the agent's Discretion
- O executor pode decidir se cards não-clicáveis devem ter hover e, se sim, com que intensidade.
- O executor pode decidir detalhes de implementação dos floating labels (markup exato, classes CSS, comportamento de selects).
- O executor pode decidir a abordagem técnica exata para o double-shadow de offset no focus ring.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Visão do milestone v1.5, constraints, key decisions
- `.planning/REQUIREMENTS.md` — MICR-01 a MICR-07 com critérios de aceitação
- `.planning/STATE.md` — Decisões acumuladas, incluindo regras de v1.5
- `.planning/phases/32-motion-tokens-foundation-css/32-CONTEXT.md` — Tokens de motion, utility classes, prefers-reduced-motion

### Existing CSS & Components
- `src/app/globals.css` — Estilos existentes: `.btn-*`, `.input-field`, `.nav-link`, `.card-hover`, `.vault-sidebar`, `:focus-visible`, `prefers-reduced-motion`
- `src/styles/motion.css` — Keyframes, utility classes de motion, media query reduced motion
- `src/components/ui/card.tsx` — Componente Card com variants e onClick
- `src/components/ui/button.tsx` — Componente Button com variants e isLoading
- `src/components/ui/submit-button.tsx` — SubmitButton com useFormStatus
- `src/app/(vault)/layout.tsx` — Layout com sidebar, bottom nav, content area
- `src/app/(vault)/components/vault-sidebar-nav.tsx` — Navegação da sidebar

### Out of Scope (regras do milestone)
- Parallax, 3D transforms, celebration effects, sound effects, typing animation, full-screen loading spinners, background animated gradients, dark mode motion tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Card component** (`src/components/ui/card.tsx`): Tem variant `interactive` com transição inline. Já detecta `onClick` para renderizar como `<button>`. Pode ser estendido para aplicar hover automaticamente.
- **Button component** (`src/components/ui/button.tsx`): Já tem `isLoading` prop com spinner SVG. Hover/active já existem em `.btn-*` classes no globals.css.
- **SubmitButton** (`src/components/ui/submit-button.tsx`): Consome Button + `useFormStatus`. Estado de loading já existe.
- **motion.css** (`src/styles/motion.css`): Já tem keyframes e utility classes. Novos keyframes de shake e floating label devem ser adicionados aqui.

### Established Patterns
- **CSS-first approach**: Componentes usam classes CSS puras para estados (`.btn-primary:hover`, `.input-field:focus`). Novas micro-interações devem seguir este padrão.
- **Tokens em globals.css**: `--duration-*` e `--ease-*` já disponíveis. Todas as transições devem usar estes tokens.
- **prefers-reduced-motion**: Já existe media query global em globals.css e específica em motion.css. Qualquer nova animação deve ser coberta.
- **Focus glow em inputs**: Já usa `box-shadow: 0 0 0 3px rgba(154, 52, 18, 0.1)`. Este padrão deve ser mantido para inputs.
- **Card hover existente**: `.card-hover` em globals.css já faz `translateY(-2px)` + sombra. Pode ser reutilizado/estendido.

### Integration Points
- **Vault layout** (`src/app/(vault)/layout.tsx`): Sidebar + content + bottom nav. Mudanças em nav items afetam `vault-sidebar-nav` e `bottom-nav`.
- **Todos os formulários**: Floating labels e shake afetarão todos os inputs do app. O executor deve identificar todos os inputs (`.input-field`, `.auth-input`, selects, textareas).
- **Focus ring global**: Mudança de `:focus-visible` afeta todos os elementos interativos. Deve ser testado em botões, links, inputs, nav items, tabs, etc.

</code_context>

<specifics>
## Specific Ideas

- Shake de erro deve ser sutil e não punitivo — 2px lateral é suficiente para notar sem ser agressivo.
- Nav hover mais lento (300ms vs 200ms dos botões) cria ritmo calmo adequado ao tom clínico do PsiVault.
- Focus ring em fundo escuro deve usar tom claro (ex: `rgba(253, 186, 116, 0.5)`) para manter visibilidade.
- Floating labels devem respeitar o sistema de tipografia existente — label flutuada usa `--font-size-xs` ou `--font-size-sm`.
- Cards com `onClick` devem ter `cursor: pointer` — o executor deve auditar isso como parte do cursor audit.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 33-micro-interacoes-em-componentes-base*
*Context gathered: 2026-04-23*
