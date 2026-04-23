# Project Research Summary — v1.5 Motion & Feel

**Project:** PsiVault / PsiLock
**Domain:** Next.js 15 SaaS — Prontuário Eletrônico para Psicólogos
**Researched:** 2026-04-23
**Confidence:** HIGH

## Executive Summary

PsiVault v1.5 "Motion & Feel — Interações Fluidas" é um milestone de **polish subjetivo e qualidade percebida**, paralelo ao v1.4 de performance objetiva. O objetivo é transformar a experiência de uso de "funcional e rápida" (v1.3/v1.4) para "calma, estável e agradável" — uma sensação clinicamente profissional mas humanamente acolhedora.

A arquitetura de motion segue o princípio **CSS-first, JS-surgical**: 80% das animações são puramente CSS (zero bundle, 60fps garantido), 20% usam React 19 hooks (`useTransition`, `useOptimistic`) e framer-motion de forma cirúrgica apenas onde CSS não alcança (exit animations, layout shifts complexos, gestos).

## Key Findings

### Recommended Stack

**Base inalterado:** Next.js 15.2.4, React 19, CSS tokens (no Tailwind).

**Adições mínimas:**
- **`framer-motion@12`** — APENAS para exit animations (`AnimatePresence`), layout animations e gestos. Bundle ~30kb gzipped; usar com tree-shaking e limitado a 3–5 componentes.
- **CSS Motion Tokens** — Extensão do design system existente: `--duration-*`, `--ease-*`, `--stagger-gap`. Zero bundle, zero runtime cost.
- **React 19 built-ins** — `useTransition` para estados de loading otimistas, `useActionState` para formulários. Já disponíveis na stack.

**What NOT to add:** `gsap` (pesado, overkill), `react-spring` (API complexa, bundle similar ao framer-motion), `lottie-react` (JSONs pesados, visual inconsistente), `tailwindcss-animate` (projeto não usa Tailwind), parallax libs, sound effects.

### Expected Features

**Table stakes (obrigatórios):**
- Hover/focus/active states suaves em todos os elementos interativos
- Focus rings elegantes e visíveis (WCAG 2.1 AA)
- Loading states não-bloqueantes (`useTransition`, skeletons)
- Toast/snackbar enter/exit animations
- Reduced motion support (`prefers-reduced-motion: reduce`)
- Smooth scroll

**Differentiators (elevam o feel):**
- Page transitions suaves (fade, View Transition API como progressive enhancement)
- Staggered list animations (listas "respiram" ao carregar)
- Layout animations para expand/collapse (filtros, cards, accordions)
- Skeleton shimmer orgânico (gradient sweep em vez de pulse mecânico)
- Micro-interações em formulários (focus glow, label float, error shake)
- Number counting animation em dashboards (estatísticas financeiras)

**Anti-features (proibidos pelo tom PsiVault):**
- Parallax, 3D transforms, bounce exagerado
- Confetti, celebration effects, sound effects
- Background animated gradients
- Typing animation em textos funcionais
- Full-screen loading spinners

### Architecture Approach

**Progressive enhancement via CSS:** Motion é uma camada aditiva sobre a fundação existente. Componentes, repositories, domain models e testes permanecem inalterados.

**Estrutura:**
1. `src/styles/motion.css` — Tokens e utility classes de motion
2. Componentes base atualizados com estados de hover/focus/active via CSS
3. Wrappers cirúrgicos de framer-motion para toasts, modais, page transitions
4. React 19 hooks para feedback otimista em Server Actions

**Anti-padrões arquiteturais a evitar:**
- Inline styles hardcoded (sempre usar CSS variables)
- Animar propriedades não-compostas (`width`, `height`, `margin`)
- AnimatePresence em listas grandes (>10 itens)
- Ignorar `prefers-reduced-motion`
- Adicionar motion em Server Components via hooks (erro de runtime)

### Critical Pitfalls

1. **INP degradation** — Animar `box-shadow`, `filter`, ou propriedades de layout causa jank e eleva INP acima de 200ms. **Prevenção:** whitelist de propriedades (`transform`, `opacity`); usar `will-change` com parcimônia.

2. **Violação de reduced motion** — Causa desconforto físico e viola WCAG 2.3.3. **Prevenção:** `@media (prefers-reduced-motion: reduce)` em TODAS as animações; teste obrigatório.

3. **Bundle bloat por framer-motion** — Import descontrolado aumenta LCP/TTFB. **Prevenção:** CSS para 80%; framer-motion limitado a 3–5 componentes; verificar via bundle analyzer.

4. **FOUC em animações de entrada** — HTML renderiza antes do CSS de motion carregar. **Prevenção:** Motion CSS no critical path (inline ou `globals.css`); `animation-fill-mode: forwards`.

5. **Memory leak em AnimatePresence** — Exit animations retêm DOM nodes e listeners. **Prevenção:** Cleanup functions em `useEffect`; limitar toasts simultâneos; testar com memlab.

6. **Inconsistência de motion** — Durações/easings diferentes criam sensação de produto inacabado. **Prevenção:** CSS variables obrigatórias; motion audit page-by-page.

7. **Page transition bloqueando navegação** — `AnimatePresence mode="wait"` lento atrasa clicks rápidos. **Prevenção:** Duração ≤150ms; `mode="sync"` ou View Transition API.

## Implications for Roadmap

### Phase 1: Motion Tokens & Foundation CSS
**Rationale:** Sem tokens unificados, o resto do milestone vira patchwork inconsistente. Foundation primeiro.
**Delivers:**
- `src/styles/motion.css` com duration, easing, stagger tokens
- `@media (prefers-reduced-motion: reduce)` fallback global
- Utility classes base: `.motion-fade-in`, `.motion-slide-up`, `.motion-stagger`
- Commit no critical path (integrado a `globals.css`)

### Phase 2: Micro-interações em Componentes Base
**Rationale:** Componentes base (Button, Card, Input, NavItem) são tocados em 100% das interações. Maior ROI de feel.
**Delivers:**
- Hover/focus/active states em todos os elementos interativos
- Focus rings elegantes (WCAG compliance)
- Cursor refinado (`pointer`, `wait`, `not-allowed`)
- Smooth scroll global

### Phase 3: Feedback de Ação e Loading
**Rationale:** Toasts e loading são pontos de fricção percebidos. Transformar em momentos de calma.
**Delivers:**
- `AnimatePresence` no sistema de Toast existente
- `useTransition` padrão em botões de Server Action
- Skeleton shimmer orgânico (substituir pulse)
- Spinner leve (SVG + CSS)

### Phase 4: Listas e Transições de Página
**Rationale:** Adiciona o "respirar" às listagens principais e fluidez à navegação.
**Delivers:**
- Staggered animations em PatientList, AppointmentList, FinanceList
- Page transition fade entre rotas do vault
- Layout animations em filtros/cards expansíveis

### Phase 5: Polish & Measurement
**Rationale:** Validar que motion melhorou o feel sem degradar performance objetiva.
**Delivers:**
- Motion audit page-by-page (consistência)
- Teste reduced motion em todas as animações
- Medição de INP/CLS antes e depois
- Documentação de padrões no CLAUDE.md

### Phase Ordering Rationale

- **Phase 1 first** — Tokens são a fundação. Sem eles, as outras fases produzem inconsistência.
- **Phase 2 follows Phase 1** — Componentes base dependem dos tokens.
- **Phase 3 follows Phase 2** — Feedback systems (toasts, loading) dependem dos componentes base estilizados.
- **Phase 4 follows Phase 3** — Listas e page transitions são os efeitos mais visíveis, mas dependem de componentes e feedback já refinados.
- **Phase 5 last** — Measurement requer todo o motion implementado para validação before/after.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | CSS + framer-motion v12 + React 19 hooks; tudo estável |
| Features | HIGH | Baseado em padrões maduros de UX motion; nada experimental |
| Architecture | HIGH | Progressive enhancement; nenhuma mudança estrutural |
| Pitfalls | HIGH | Bem documentados; prevenções são actionable e verificáveis |

**Overall confidence:** HIGH

### Gaps to Address

1. **Baseline de INP/CLS atual:** Precisamos da métrica v1.4 (ou v1.3) para comparar after v1.5. Coletar via Lighthouse ou web-vitals antes de começar Phase 2.
2. **Decisão sobre View Transition API:** Safari/Firefox ainda não suportam. Precisamos de fallback CSS para transições de página.
3. **Estado atual dos Skeletons:** v1.4 Phase 28 criou skeletons. Precisamos verificar se já usam design tokens antes de aplicar shimmer.
4. **Quantidade de Client Components com Server Actions:** Mapear quais botões disparam Server Actions para aplicar `useTransition` corretamente.

## Sources

### Primary (HIGH confidence)
- **Context7 `/vercel/next.js`** — Next.js 15 App Router, CSS support, View Transitions experimental
- **Context7 `/reactjs/react.dev`** — React 19 `useTransition`, `useOptimistic`, Actions
- **framer-motion docs (v12)** — AnimatePresence, layout, reducedMotion, bundle size
- **web.dev / prefers-reduced-motion** — WCAG 2.3.3 compliance
- **web.dev / INP** — Interaction to Next Paint thresholds e causas
- **Material Design 3 Motion** — Duração, easing, hierarquia de motion
- **Apple HIG — Motion** — Subtle feedback, reduced motion best practices

### Secondary (MEDIUM-HIGH confidence)
- **PsiVault internal codebase** — Design tokens (`globals.css`), component library, CLAUDE.md (anti-padrões)
- **MDN CSS Animations/Transitions** — `cubic-bezier`, `@keyframes`, `will-change`, `animation-fill-mode`
- **Chrome DevTools Performance docs** — Paint profiling, FPS measurement

### Tertiary (MEDIUM confidence)
- **View Transition API** — Chrome/Edge stable; Safari em desenvolvimento; Firefox roadmap

---
*Research completed: 2026-04-23*
*Ready for roadmap: yes*
