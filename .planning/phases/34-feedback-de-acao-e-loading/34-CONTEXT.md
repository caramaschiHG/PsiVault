# Phase 34: Feedback de Ação e Loading - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Adicionar feedback visual calmo e imediato sobre o estado de ações do usuário — toasts com animação refinada, botões de Server Action com estado de loading visual, skeletons com shimmer orgânico, spinner leve, e erros de formulário com feedback imediato. Esta fase constrói sobre os tokens de motion (Phase 32) e micro-interações (Phase 33).

**Requirements mapeados:** FEED-01, FEED-02, FEED-03, FEED-04, FEED-05

**O que esta fase entrega:**
- Toasts com entrada slide+fade e saída fade, ≤300ms, sem bloquear interação
- Botões de Server Action exibindo estado de loading via useTransition (opacity + spinner)
- Skeletons com shimmer gradient orgânico (sem pulse mecânico)
- Componente Spinner leve e reutilizável (SVG + CSS)
- Erros de formulário com border color transition + shake sutil imediato

**O que esta fase NÃO entrega:**
- Animações de entrada/saída de listas (Phase 35)
- Page transitions (Phase 35)
- Motion audit completo (Phase 36)

</domain>

<decisions>
## Implementation Decisions

### Toast Animation (FEED-01)
- **D-01:** Manter abordagem **CSS-first** — sem Framer Motion ou AnimatePresence. Refinar o sistema existente (`toast-provider.tsx`) com keyframes e classes CSS.
- **D-02:** Entrada do toast: **slide + fade**, duração ≤300ms. Reutilizar/adaptar o keyframe `toastSlideIn` existente em `motion.css`.
- **D-03:** Saída do toast: **fade puro**, duração ≤300ms. Manter o padrão de estado `fading` no React para atrasar remoção do DOM até a animação completar.
- **D-04:** Toast permanece visível por **~3s** antes de iniciar animação de saída.
- **D-05:** **Não animar reposicionamento do stack**. Quando um toast some, os demais pulam instantaneamente para a nova posição. Abordagem mais simples, alinhada ao tom discreto do PsiVault.
- **D-06:** Manter limite de **max 4 toasts** simultâneos e posição fixa **bottom-right**.

### Button Loading State (FEED-02)
- **D-07:** A critério do executor/planner. O componente `Button` já possui `isLoading` + `SpinnerIcon`. O `SubmitButton` já conecta `useFormStatus` ao `isLoading`. O executor deve decidir se padroniza os ~10 componentes que usam `useTransition` manualmente para também exibirem `isLoading`, ou se cria um wrapper `ActionButton`.

### Skeleton Shimmer (FEED-03)
- **D-08:** A critério do executor/planner. O skeleton atual (`src/components/ui/skeleton.tsx`) já usa `skeleton-shimmer` com gradiente linear — não é pulse mecânico. O executor avalia se o gradiente atual é "orgânico" o suficiente ou se precisa de ajuste de cores/velocidade/formato. Phase 32 já deixou duração do shimmer a critério do executor.

### Spinner Component (FEED-04)
- **D-09:** A critério do executor/planner. Extrair o `SpinnerIcon` existente em `button.tsx` para um componente `Spinner` standalone reutilizável, ou manter como está.

### Form Error Feedback (FEED-05)
- **D-10:** A critério do executor/planner. Phase 33 já definiu shake de 2px lateral + border glow em erro. Esta fase deve verificar se está wired em todos os formulários do app e completar onde faltar.

### the agent's Discretion
- O executor pode decidir a abordagem técnica exata para exit animation dos toasts (classe CSS vs inline style vs ambos).
- O executor pode decidir se ajusta a curva de easing do toast para diferenciar enter (mais snappy) e exit (mais suave).
- O executor pode decidir detalhes de implementação do shimmer (cores do gradiente, velocidade do loop).
- O executor pode decidir se cria um hook reutilizável (`useActionButton`) ou padroniza manualmente.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Visão do milestone v1.5, constraints, key decisions
- `.planning/REQUIREMENTS.md` — FEED-01 a FEED-05 com critérios de aceitação
- `.planning/STATE.md` — Decisões acumuladas, incluindo regras de v1.5
- `.planning/phases/32-motion-tokens-foundation-css/32-CONTEXT.md` — Tokens de motion, utility classes, prefers-reduced-motion
- `.planning/phases/33-micro-interacoes-em-componentes-base/33-CONTEXT.md` — Shake de erro, focus rings, border glow, micro-interações base

### Existing Components
- `src/components/ui/toast-provider.tsx` — Sistema de toast atual (vanilla React, createPortal, max 4 toasts)
- `src/components/ui/skeleton.tsx` — Componente Skeleton com `skeleton-shimmer` class
- `src/components/ui/button.tsx` — Button com `isLoading`, `SpinnerIcon`, variants
- `src/components/ui/submit-button.tsx` — SubmitButton com `useFormStatus`

### Existing Styles
- `src/styles/motion.css` — Keyframes (`toastSlideIn`, `skeleton-shimmer`, `spin`, `inputShake`), utility classes, prefers-reduced-motion
- `src/app/globals.css` — `.skeleton-shimmer` styles, `.toast-enter` class, tokens `--duration-*`, `--ease-*`

### Out of Scope (regras do milestone)
- Parallax, 3D transforms, celebration effects, sound effects, typing animation, full-screen loading spinners, background animated gradients, dark mode motion tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **ToastProvider** (`src/components/ui/toast-provider.tsx`): Sistema funcional com contexto, portal, max 4 toasts, dismiss manual, tipos (success/error/info). Já tem `.toast-enter` para animação de entrada.
- **Skeleton** (`src/components/ui/skeleton.tsx`): Componente simples com `width`, `height`, `borderRadius`, `delay`. Usa classe `skeleton-shimmer` do motion.css.
- **Button** (`src/components/ui/button.tsx`): Suporta `isLoading` com `SpinnerIcon` SVG inline. Variants: primary, secondary, ghost, danger.
- **SubmitButton** (`src/components/ui/submit-button.tsx`): Consome Button + `useFormStatus`. Padrão já funcional para formulários React 19.
- **SpinnerIcon** (dentro de `button.tsx`): SVG com `strokeDasharray` e animação `spin 0.6s linear infinite`.

### Established Patterns
- **CSS-first approach**: Todas as animações usam keyframes CSS e classes. Sem bibliotecas de animação (framer-motion, etc.).
- **Tokens em globals.css**: `--duration-100/200/300`, `--ease-out/in-out` disponíveis. Todas as transições devem usar estes tokens.
- **prefers-reduced-motion**: Media query em `motion.css` cobre `.toast-enter`, `.skeleton-shimmer`, `.input-error-shake`, etc.
- **useTransition pattern**: ~10 componentes já usam `useTransition` para Server Actions (financeiro, agenda, settings, patients). Nem todos conectam `isPending` a estado visual.
- **createPortal para toasts**: ToastProvider renderiza fora da árvore React normal via portal no `document.body`.

### Integration Points
- **Vault layout** (`src/app/(vault)/layout.tsx`): ToastProvider está no root do vault — todos os toasts aparecem dentro do contexto do app protegido.
- **Todos os formulários**: SubmitButton já conecta loading visual para formulários. Botões fora de formulários (ex: ações rápidas na agenda) usam `useTransition` manualmente e precisam de padronização.
- **Skeletons em loading.tsx**: Várias rotas (`/inicio`, `/financeiro`, `/prontuario`, etc.) usam `loading.tsx` com Skeleton. Qualquer mudança no shimmer afeta todas.
- **motion.css**: Novos keyframes de toast devem ser adicionados aqui (ou ajustar `toastSlideIn` existente). A media query `prefers-reduced-motion` deve ser atualizada para cobrir novas classes.

</code_context>

<specifics>
## Specific Ideas

- Exit animation de toast com CSS puro requer sincronia entre React state e CSS transition. O padrão atual (estado `fading` + setTimeout) é aceitável — apenas ajustar durações para ≤300ms.
- Stack de toasts sem reposicionamento animado reduz complexidade e evita layout shifts acumulados.
- Shimmer "orgânico" pode ser interpretado como: gradiente suave com transição lenta (1.5–2s), cores próximas ao fundo do app (`#f0ebe2`, `#e8e2d9`), sem contraste agressivo.
- O spinner atual (SVG com `spin` keyframe) já é leve e funcional. Extrair para componente standalone é baixo esforço e alto reuso.
- Erros de formulário: Phase 33 definiu `.input-error-shake` keyframe. Esta fase deve garantir que todos os inputs do app apliquem essa classe quando `error` está presente.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 34-feedback-de-acao-e-loading*
*Context gathered: 2026-04-23*
