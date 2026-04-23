# Architecture Patterns: Motion & Feel Integration

**Project:** PsiVault (PsiLock)
**Domain:** Next.js 15 App Router + React 19 + CSS tokens (no Tailwind)
**Researched:** 2026-04-23
**Confidence:** HIGH

## Executive Summary

Este documento define como as animações e micro-interações do v1.5 "Motion & Feel" integram-se à arquitetura existente do PsiVault. O app já tem: design token system maduro, 50+ CSS variables, componentes reutilizáveis, Server Components por padrão, e 407 testes. v1.5 adiciona uma **camada de motion** sobre essa fundação — sem quebrar padrões, sem adicionar inline styles onde não deve, e sem impactar a performance conquistada em v1.3/v1.4.

O princípio arquitetural é **progressive enhancement via CSS**: 80% das animações são puramente CSS (zero JS, zero bundle impact). As 20% restantes usam React 19 hooks (`useTransition`, `useOptimistic`) e framer-motion de forma cirúrgica, apenas onde CSS não alcança (exit animations, layout shifts, gestos).

## Recommended Architecture

### Layered Motion Model

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION (Pages / Components)                          │
│  • CSS motion classes → hover, focus, active, stagger       │
│  • React 19 hooks → useTransition, useOptimistic            │
│  • framer-motion → AnimatePresence, layout, drag (cirúrgico)│
├─────────────────────────────────────────────────────────────┤
│  DESIGN SYSTEM EXTENSION                                    │
│  • Motion tokens: duration-*, ease-*, stagger-gap           │
│  • Motion utilities: motion.css (utility classes)           │
│  • Skeleton tokens: shimmer gradient, pulse alternatives    │
├─────────────────────────────────────────────────────────────┤
│  EXISTING FOUNDATION (inalterado)                           │
│  • Component library: Card, Button, Toast, etc.             │
│  • CSS variables: colors, shadows, spacing, radius          │
│  • Repository pattern, domain models, tests                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Motion Role |
|-----------|---------------|-------------|
| `Button` | Ação primária/secundária | Hover (`translateY`, `opacity`), active (`scale(0.98)`), loading (`isPending` fade) |
| `Card` | Container de conteúdo | Hover (`box-shadow`, `translateY(-2px)`), enter (staggered fade) |
| `Toast` | Feedback de ação | Enter (`slideIn` + fade), exit (`fadeOut`), auto-dismiss timer |
| `List` / `ListItem` | Listagens de dados | Staggered enter, hover highlight, smooth reorder (se aplicável) |
| `Modal` / `Dialog` | Sobreposição de conteúdo | Backdrop fade, content slide-up, exit reverse |
| `Skeleton` | Placeholder de loading | Shimmer gradient sweep (CSS animation) |
| `Input` / `Field` | Formulários | Focus border glow, label float, error shake |
| `Sidebar` / `NavItem` | Navegação | Active indicator slide, hover background fade |
| `PageShell` | Transição de rota | Fade de conteúdo entre rotas (View Transition ou CSS) |

---

## Patterns to Follow

### Pattern 1: CSS-First Motion (80% Rule)
**What:** Toda micro-interação básica (hover, focus, active, disabled) é implementada via CSS puro usando design tokens de motion.

**Why:** Zero bundle size, 60fps garantido (GPU-accelerated), funciona em Server Components, não quebra com React 19.

**Example:**
```css
/* src/styles/motion.css */
.btn {
  transition: transform var(--duration-fast) var(--ease-out),
              opacity var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-normal) var(--ease-out);
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.btn:active {
  transform: scale(0.98);
}
.btn:disabled,
.btn[aria-busy="true"] {
  opacity: 0.6;
  cursor: wait;
  transform: none;
}
```

**Key rule:** NUNCA animar `width`, `height`, `top`, `left`, `margin`, `padding`. Animar apenas `transform` e `opacity`. Para height auto, usar CSS grid trick ou framer-motion layout.

### Pattern 2: React 19 `useTransition` para Optimistic UI
**What:** Usar `useTransition` em TODOS os botões que disparam Server Actions para feedback visual imediato de loading.

**Example:**
```tsx
'use client'
import { useTransition } from 'react'

export function ActionButton({ action, children }: { action: () => Promise<void>, children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(action)}
      aria-busy={isPending}
      className="btn"
      style={{
        opacity: isPending ? 0.7 : 1,
        transition: 'opacity var(--duration-fast) var(--ease-out)',
      }}
    >
      {isPending ? <Spinner size="sm" /> : children}
    </button>
  )
}
```

### Pattern 3: Staggered Lists via CSS Custom Properties
**What:** Listas onde cada item entra com delay progressivo, criando efeito "respiração".

**Example:**
```tsx
// Server Component — renderiza a lista normalmente
export function PatientList({ patients }: { patients: Patient[] }) {
  return (
    <ul className="motion-stagger" style={{ '--stagger-count': patients.length } as React.CSSProperties}>
      {patients.map((p, i) => (
        <li key={p.id} style={{ '--stagger-index': i } as React.CSSProperties} className="motion-fade-in">
          <PatientCard patient={p} />
        </li>
      ))}
    </ul>
  )
}
```

```css
.motion-stagger > * {
  opacity: 0;
  animation: fadeInSlideUp var(--duration-normal) var(--ease-out) forwards;
  animation-delay: calc(var(--stagger-gap) * min(var(--stagger-index, 0), 10));
}

@keyframes fadeInSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Limit:** Cap em 10 itens para não criar delay excessivo. Listas paginadas: resetar delay a cada página.

### Pattern 4: Skeleton Shimmer (Organic Loading)
**What:** Substituir o pulse mecânico de opacidade por um gradient sweep suave horizontal.

**Example:**
```css
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-surface-elevated) 50%,
    var(--color-surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Pattern 5: AnimatePresence para Exit Animations (framer-motion)
**What:** Usar framer-motion APENAS quando um componente precisa animar ao SAIR do DOM (CSS não suporta exit animations).

**Example:**
```tsx
'use client'
import { AnimatePresence, motion } from 'framer-motion'

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-stack">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Toast {...t} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
```

**Regra:** framer-motion só em Client Components, e apenas para casos onde CSS é insuficiente.

### Pattern 6: Layout Animation para Expand/Collapse
**What:** Animação de altura suave em cards, accordions, filtros expansíveis.

**CSS Grid Trick (preferido — zero JS):**
```css
.accordion {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-slow) var(--ease-out);
}
.accordion.open {
  grid-template-rows: 1fr;
}
.accordion > .content {
  overflow: hidden;
}
```

**Framer-motion (fallback para casos complexos):**
```tsx
<motion.div layout style={{ overflow: 'hidden' }}>
  {isOpen && <Content />}
</motion.div>
```

### Pattern 7: Page Transition Shell
**What:** Wrapper leve em rotas do vault para fade suave de conteúdo entre navegações.

**Example:**
```tsx
// app/(vault)/layout.tsx ou componente de transição
'use client'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  )
}
```

**Cuidado:** `mode="wait"` pode causar delay na navegação. Usar duração MUITO curta (150ms) ou preferir View Transition API quando disponível.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Inline Styles de Motion em Componentes Reutilizáveis
**What:** Hardcodar `transition: 'all 0.3s ease'` em cada componente.
**Why bad:** Inconsistente, não respeita reduced motion, difícil de manter.
**Instead:** Centralizar em `motion.css` e usar classes ou CSS variables.

### Anti-Pattern 2: Animar Propriedades Não-Compostas
**What:** `transition: height 0.3s ease` ou animar `margin`, `padding`, `top`.
**Why bad:** Força reflow do browser, causa jank (baixo FPS), especialmente em mobile.
**Instead:** Usar `transform` e `opacity`. Para height, usar CSS grid trick ou framer-motion layout.

### Anti-Pattern 3: `AnimatePresence` em Listas Grandes
**What:** Wrapping listas de 50+ itens em AnimatePresence.
**Why bad:** Cada item cria um motion.div — overhead de React significativo, queda de performance.
**Instead:** CSS stagger para lists. AnimatePresence apenas para toasts, modais, notificações (coleções pequenas).

### Anti-Pattern 4: Ignorar `prefers-reduced-motion`
**What:** Animacões sempre ativas, independente de acessibilidade do sistema.
**Why bad:** Viola WCAG 2.1 AA, pode causar desconforto físico (vestibular disorders), proibido em contextos clínicos.
**Instead:** Todas as animações CSS devem ter `@media (prefers-reduced-motion: reduce)` que as desativa. framer-motion respeita automaticamente se configurado.

### Anti-Pattern 5: Adicionar motion em Server Components sem cuidado
**What:** Tentar usar framer-motion ou hooks em Server Components.
**Why bad:** Server Components não executam hooks nem têm acesso ao DOM. Erro de runtime.
**Instead:** Motion puramente visual (CSS) pode ser aplicada em Server Components via classes. Interatividade (exit animations, gestures) requer Client Component wrapper.

---

## Integration Points: New vs Modified

### New Files (Additive)

| File | Purpose | Location |
|------|---------|----------|
| `src/styles/motion.css` | Tokens e utility classes de motion | `src/styles/` |
| `src/components/motion/` | Wrappers reutilizáveis (AnimatePresence, PageTransition, StaggerList) | `src/components/motion/` |
| `src/components/feedback/` | Spinner, shimmer skeleton variants | `src/components/feedback/` |

### Modified Files (Non-Breaking)

| File | Change | Risk |
|------|--------|------|
| `globals.css` | Adicionar motion tokens CSS | LOW — additive |
| `Button` component | Adicionar classes de hover/active/loading | LOW — visual only |
| `Card` component | Adicionar hover transition | LOW — visual only |
| `Toast` system | Integrar AnimatePresence | LOW — Client Component já |
| `Skeleton` components | Substituir pulse por shimmer | LOW — visual only |
| `Input` / `Field` | Adicionar focus micro-interactions | LOW — visual only |
| `List` component | Adicionar stagger support | LOW — CSS class condicional |
| `next.config.ts` | Habilitar View Transitions experimental (opcional) | LOW — config only |

### Unchanged (Invariant)

| File | Why Unchanged |
|------|---------------|
| `src/lib/[domain]/repository.ts` | Motion é presentation-only |
| `src/lib/[domain]/model.ts` | Domain models inalterados |
| Server Actions | Lógica de negócio inalterada; apenas feedback visual muda |
| All 407 tests | Motion é additive e visual; não quebra lógica existente |

---

## Suggested Build Order (Phase Dependencies)

### Phase 1: Motion Tokens & Foundation CSS
**Goal:** Estabelecer o sistema de tokens e utility classes.
1. Criar `src/styles/motion.css` com tokens de duration, easing, stagger.
2. Adicionar `@media (prefers-reduced-motion: reduce)` fallback.
3. Criar utility classes base: `.motion-fade-in`, `.motion-slide-up`, `.motion-stagger`.
4. Integrar `motion.css` em `globals.css` ou layout root.

**Depends on:** Nada. Pode começar imediatamente.
**Blocks:** Todas as outras fases.

### Phase 2: Micro-interações em Componentes Base
**Goal:** Hover, focus, active, disabled em botões, cards, links, inputs.
1. Atualizar `Button` com estados de motion.
2. Atualizar `Card` com hover suave.
3. Atualizar `Input` / `Field` com focus ring e border transitions.
4. Atualizar `NavItem` / sidebar com active indicator.
5. Atualizar focus rings globais (WCAG).

**Depends on:** Phase 1
**Blocks:** Phase 3, 4

### Phase 3: Feedback de Ação e Loading
**Goal:** Toasts, botões com `useTransition`, skeletons refinados.
1. Integrar `AnimatePresence` no sistema de Toast existente.
2. Adicionar `useTransition` padrão em todos os botões de Server Action.
3. Substituir skeleton pulse por skeleton shimmer.
4. Criar componente `Spinner` leve (SVG animado com CSS).

**Depends on:** Phase 1, 2
**Blocks:** Phase 4

### Phase 4: Listas e Transições de Página
**Goal:** Staggered lists, page transitions, layout animations.
1. Adicionar stagger em `PatientList`, `AppointmentList`, `FinanceList`.
2. Implementar page transition fade entre rotas do vault.
3. Adicionar layout animations em filtros/cards expansíveis.
4. Testar reduced motion em todas as animações.

**Depends on:** Phase 1, 2, 3
**Blocks:** Phase 5

### Phase 5: Polish & Measurement
**Goal:** Validar feel, performance, accessibility.
1. Audit de TODOS os elementos interativos — estão consistentes?
2. Testar `prefers-reduced-motion` em cada animação.
3. Medir FPS durante navegação (Chrome DevTools Performance).
4. Garantir que nenhuma animação causa CLS ou INP degradation.
5. Documentar padrões de motion no CLAUDE.md.

**Depends on:** Phases 1–4.
**Blocks:** Nada.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Animações causam jank em listas grandes | MED | MED | Limitar stagger a 10 itens; usar `content-visibility: auto` em listas longas |
| `framer-motion` aumenta bundle significativamente | LOW | MED | Importar apenas `motion` e `AnimatePresence` (tree-shake); usar CSS para 80% |
| Page transition delay na navegação | MED | MED | Duração ≤150ms; usar `mode="sync"` em vez de `"wait"` se possível |
| Reduced motion não aplicado em algum componente | MED | HIGH | Checklist de audit; teste automatizado com media query simulada |
| Motion CSS quebra em browsers antigos | LOW | LOW | CSS transitions são suportadas há 10+ anos; graceful degradation |

## Sources

- Framer Motion docs (v12) — layout, AnimatePresence, reducedMotion
- React 19 docs — useTransition, useOptimistic
- MDN CSS Animations & Transitions
- web.dev / prefers-reduced-motion
- web.dev / INP (Interaction to Next Paint) — animações devem ser leves para não degradar INP
- Next.js 15 View Transitions experimental
- PsiVault internal codebase — design tokens, component library, CLAUDE.md

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| CSS motion tokens | HIGH | Zero risco técnico |
| React 19 transition hooks | HIGH | APIs estáveis |
| framer-motion integration | HIGH | Uso cirúrgico minimiza risco |
| Accessibility (reduced motion) | HIGH | Media query universal |
| Performance impact | HIGH | CSS-only para maioria; baixo risco de regressão |
