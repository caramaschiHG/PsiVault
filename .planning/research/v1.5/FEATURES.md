# Feature Landscape: Motion, Micro-interactions & Visual Polish

**Domain:** Next.js 15 SaaS (PsiVault — Prontuário Eletrônico para Psicólogos)
**Stack Context:** Next.js 15, React 19, CSS tokens (no Tailwind), 407 tests
**Researched:** 2026-04-23
**Overall confidence:** HIGH

---

## Table Stakes

Features que um produto moderno, premium, deve ter para parecer "acabado". Sem elas, o produto parece bruto ou amador.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Hover states suaves** | Feedback instantâneo de interatividade | Low | Todos os elementos clicáveis (botões, links, cards, rows) devem ter transição de `opacity`, `transform`, ou `background-color`. Duração: 100–200ms. |
| **Focus rings visíveis e elegantes** | Acessibilidade + orientação visual | Low | Substituir outline padrão do browser por ring com `box-shadow` e transição suave. ESSENCIAL para keyboard navigation (WCAG 2.1 AA já exige). |
| **Active/pressed states** | Confirmação tátil visual de clique | Low | Escala leve (`scale(0.98)`) ou escurecimento no momento do clique. Duração: 50–100ms. |
| **Loading states não-bloqueantes** | Feedback de que o sistema está respondendo | Low-Med | Botões com `isPending` (`useTransition`), skeletons com pulso suave (não piscar agressivo). |
| **Toast / snackbar animations** | Feedback de ação concluída com elegância | Low | Enter: slide-in + fade. Exit: fade-out. Duração: 300ms. Nunca bloquear interação. |
| **Reduced motion support** | Acessibilidade obrigatória | Low | Respeitar `prefers-reduced-motion: reduce`. Todas as animações devem degradar gracefuly para instantâneo. |
| **Smooth scroll** | Navegação fluida em páginas longas | Low | `scroll-behavior: smooth` no `html`. Cuidado com anchor links — deve respeitar reduced motion. |

---

## Differentiators

Features que elevam PsiVault de "funcional" para "delicioso de usar" — a sensação "soft and flowing".

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Page transitions suaves** | Navegação entre páginas não parece "corte seco" | Medium | View Transition API (progressive enhancement) OU shell animation com fade de conteúdo. NÃO usar full-page spinners. |
| **Staggered list animations** | Listas que "respiram" ao carregar — itens entram em sequência, não todos de uma vez | Low-Med | CSS `animation-delay` com `calc(var(--stagger-gap) * var(--i))`. Limitar a 8–10 itens visíveis para não causar fadiga. |
| **Layout animations (height auto)** | Expansão/colapso de cards, accordions, dropdowns sem "jump" | Medium | `framer-motion` `layout` prop OU CSS `grid-template-rows: 0fr → 1fr` trick. Essencial para filtros, detalhes, formulários expansíveis. |
| **Micro-interactions em formulários** | Labels que flutuam, bordas que acendem suavemente, shake sutil em erro | Low-Med | CSS `:focus-within` + `transition` para borders. Shake: `translateX` keyframe de 3–4px, 200ms, em erros de validação. |
| **Skeletons com movimento orgânico** | Loading que parece "respirar" em vez de piscar | Low | Gradient shimmer horizontal suave (`background-position` animation) em vez de pulso de opacidade. Duração lenta: 1.5–2s. |
| **Gestos sutis (swipe to dismiss)** | Toque natural em notificações e listas mobile | Medium | `framer-motion` `drag="x"` com `dragConstraints`. Apenas em componentes mobile-first (notificações, lembretes). |
| **Cursor refinado** | Estados de cursor que comunicam intenção (`pointer`, `not-allowed`, `wait`) | Low | Garantir que todo elemento interativo tenha cursor correto. Áreas de drag: `grab`/`grabbing`. |
| **Scroll-triggered reveals** | Conteúdo que aparece suavemente ao entrar no viewport | Low-Med | `IntersectionObserver` + CSS animation. Usar com parcimônia — apenas em landing ou dashboards com muito conteúdo. NÃO usar em listagens operacionais. |
| **Number counting animation** | Valores financeiros que "contam até" o valor final | Low | `requestAnimationFrame` com easing. Duração: 600–800ms. Apenas em dashboards (estatísticas, totais). |
| **Ripple effect sutil** | Onda de pressão em botões (Material-style, mas discreto) | Low | CSS `@keyframes ripple` ou pseudo-elemento. Opacidade muito baixa (0.05–0.1), duração rápida (300ms). |

---

## Anti-Features

Features para NÃO construir — violam o tom discreto do PsiVault ou adicionam complexidade sem valor.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Parallax scrolling** | Efeito "marketing site" que desestabiliza a percepção de profissionalismo clínico. Cansa os olhos em uso prolongado. | Scroll normal com `scroll-behavior: smooth`. |
| **Bounce/elastic overshoot exagerado** | Parece "brinquedo", não ferramenta de trabalho séria. | `ease-out` suave (`cubic-bezier(0.16, 1, 0.3, 1)`). Usar spring MUITO leve apenas em micro-interações. |
| **Confetti / celebration effects** | Anti-padrão de tom — proibido pelo CLAUDE.md (nada de "revolucione sua rotina"). | Toast discreto com fade-in. |
| **3D transforms (rotateX/Y, perspective)** | Glassmorphism/crypto aesthetic. Proibido pelo anti-padrão visual do PsiVault. | 2D transforms apenas (`translate`, `scale`, `opacity`). |
| **Background animated gradients / mesh** | Distrator, consome GPU, quebra o tom off-white/sage do design system. | Cores sólidas do token system. |
| **Sound effects** | Inapropriado para ambiente clínico (pacientes podem estar presentes). | Feedback visual exclusivo. |
| **Typing animation em textos funcionais** | Aumenta tempo de leitura, frustra usuários experientes. | Texto estático com fade-in se necessário. |
| **Loading spinners em full-screen** | Bloqueia a percepção de fluidez. Parece que o app travou. | Skeletons progressivos + streaming (já em v1.4). |

---

## Feature Dependencies

```
Page transitions (View Transition API)
  → Requer: Navegação client-side via <Link> (já implementado v1.3)
  → Limitação: Safari/Firefox sem suporte nativo — degradar para fade simples

Layout animations (height auto)
  → Requer: framer-motion (caso CSS grid trick não seja suficiente)
  → Depende de: Componentes com estado de expand/collapse já existentes

Staggered list animations
  → Requer: CSS apenas (animation-delay variável)
  → Depende de: Estrutura de lista já renderizada (Server Component → Client)

Micro-interactions em formulários
  → Requer: CSS :focus-within, :has() (progressive enhancement)
  → Depende de: Design tokens de cor/borda já existentes

Skeleton shimmer
  → Requer: CSS linear-gradient animation
  → Depende de: Skeletons já existentes (v1.4 Phase 28)
```

---

## MVP Recommendation for v1.5

### Prioritize (Alto Impacto, Baixa Complexidade)
1. **Hover/focus/active states em TODOS os elementos interativos** — Consistência básica de micro-interação.
2. **Focus rings elegantes** — WCAG compliance + sensação premium.
3. **Toast enter/exit animations** — Sistema de notificação existente ganha vida.
4. **Button loading states com `useTransition`** — Feedback óbvio e imediato.
5. **Smooth scroll** — Uma linha de CSS, impacto global.

### Medium Priority (Alto Impacto, Média Complexidade)
6. **Staggered list animations** — Listas de pacientes, atendimentos, financeiro "respiram".
7. **Skeleton shimmer orgânico** — Substituir pulse mecânico por gradient suave.
8. **Layout animations (expand/collapse)** — Filtros, cards de detalhes, sidebar.
9. **Form micro-interactions** — Labels flutuantes, border glow, shake em erro.
10. **Page transition fade** — Shell fade entre rotas (degradar de View Transition API).

### Defer (Complexo ou Menos Crítico)
- **Number counting animation** — Bonito, mas apenas em dashboards. Pode esperar.
- **Swipe gestures** — Mobile-specific; priorizar se app mobile for estratégia.
- **Ripple effect** — Esteticamente questionável para o tom PsiVault; prototipar antes.
- **Scroll-triggered reveals** — Não usar em interfaces operacionais; só landing (fora do scope deste milestone).

---

## Complexity Matrix

| Feature | Implementation | Validation | Risk |
|---------|---------------|------------|------|
| Hover/focus/active states | Low | Low | None |
| Focus rings | Low | Low | None |
| Toast animations | Low | Low | Low |
| Button loading (useTransition) | Low | Low | None |
| Smooth scroll | Low | Low | None |
| Staggered lists | Low-Med | Low | Low (reduced motion) |
| Skeleton shimmer | Low | Low | None |
| Layout animations | Medium | Medium | Low (framer-motion) |
| Form micro-interactions | Medium | Medium | Low |
| Page transitions | Medium | Medium | Medium (browser support) |
| Number counting | Low | Low | None |
| Swipe gestures | Medium | Medium | Medium (mobile-only) |

---

## Sources

- Material Design 3 Motion Guidelines — princípios de duração, easing, hierarquia
- Apple Human Interface Guidelines — Motion (reduced motion, subtle feedback)
- web.dev / prefers-reduced-motion — accessibility best practices
- Framer Motion docs — layout animations, AnimatePresence, drag
- Next.js 15 View Transitions — experimental support
- PsiVault CLAUDE.md — anti-padrões visuais e de tom (regras de marca)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| CSS transitions/animations | HIGH | APIs estáveis há décadas |
| React 19 transition hooks | HIGH | Lançamento estável |
| framer-motion | HIGH | v12 compatível com React 19 |
| View Transitions API | MEDIUM | Chrome/Edge only; degradar gracefully |
| Accessibility (reduced motion) | HIGH | Media query universalmente suportada |
