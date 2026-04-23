# Technology Stack: v1.5 Motion & Feel Additions

**Project:** PsiVault / PsiLock
**Base Stack:** Next.js 15.2.4, React 19, TypeScript 5.8, CSS tokens (no Tailwind), Prisma 6, Supabase
**Researched:** 2026-04-23
**Confidence:** HIGH

---

## Recommended Stack Additions

### Core Motion (Production Dependencies)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **CSS Transitions / Animations** | built-in | Base para 80% das micro-interações | Zero bundle cost. Usar `transition`, `@keyframes` com CSS variables para `duration` e `easing`. |
| **`framer-motion`** | `12.x` | Animações declarativas complexas (layout, gestures, AnimatePresence) | API madura para React 19. Usar APENAS onde CSS não alcança: exit animations, layout shifts suaves, drag. Bundle ~30kb gzipped — importar sob demanda. |
| **React 19 `useTransition` + `useActionState`** | built-in | Feedback visual otimista para Server Actions | Já disponível. Usar `isPending` para estados de loading em botões e formulários. |
| **`View Transition API` (Chrome)** | built-in (browser) | Transições nativas de página via `document.startViewTransition` | Suporte crescente. Usar como progressive enhancement para navegação entre páginas. Next.js 15 tem suporte experimental. |

### Motion Tokens (Design System Extension)

Zero pacotes — estender o design token system existente com tokens de motion:

```css
/* globals.css ou motion.tokens.css */
:root {
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-page: 400ms;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);       /* suave, clínico */
  --ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);   /* balanceado */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* leve overshoot para micro-interações */

  --stagger-gap: 40ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
    --duration-page: 0ms;
  }
}
```

> **Decisão:** Não usar `transition: all` — sempre especificar a propriedade (`transform`, `opacity`, `height`). Performance: animar apenas `transform` e `opacity` onde possível.

---

## What NOT to Add

| Tool / Package | Why Not | What to Use Instead |
|----------------|---------|---------------------|
| `react-spring` | API mais complexa que framer-motion; bundle similar. framer-motion tem melhor integração com React 19 e AnimatePresence. | `framer-motion` (casos complexos) ou CSS transitions (base) |
| `gsap` | Peso excessivo (~90kb) e licença comercial para alguns plugins. Overkill para micro-interações sutis. | CSS + framer-motion para casos pontuais |
| `lottie-react` | JSONs de animação são pesados, difíceis de manter, e visualmente inconsistentes com design tokens. Anti-padrão para UI de produto sério. | SVG inline animado com CSS ou framer-motion |
| `react-transition-group` | Imperativo, verboso, sem suporte a layout animations. framer-motion substitui completamente. | `framer-motion` AnimatePresence |
| `tailwindcss-animate` | Projeto não usa Tailwind. Adicionar Tailwind só para animações quebra a arquitetura de tokens existente. | CSS variables + classes utilitárias customizadas |
| `velocity.js` / `jquery.animate` | Legado, jQuery-based, incompatível com React 19. | CSS transitions ou framer-motion |

---

## Integration Points

### CSS Motion Tokens → Components
```tsx
// Inline style com tokens (padrão existente do PsiVault)
const cardHover = {
  transition: 'transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out)',
  ':hover': { /* não funciona inline — usar CSS modules ou className + CSS */
}
```

**Abordagem recomendada para PsiVault:**
- Criar arquivo `src/styles/motion.css` com utility classes:
```css
.motion-fade-in { animation: fadeIn var(--duration-normal) var(--ease-out) forwards; }
.motion-slide-up { animation: slideUp var(--duration-slow) var(--ease-out) forwards; }
.motion-stagger > * { animation: fadeIn var(--duration-normal) var(--ease-out) forwards; opacity: 0; }
.motion-stagger > *:nth-child(1) { animation-delay: calc(var(--stagger-gap) * 0); }
.motion-stagger > *:nth-child(2) { animation-delay: calc(var(--stagger-gap) * 1); }
/* ... */

@media (prefers-reduced-motion: reduce) {
  .motion-fade-in, .motion-slide-up, .motion-stagger > * {
    animation: none; opacity: 1; transform: none;
  }
}
```

### Framer Motion — Uso Cirúrgico
```tsx
// Usar SÓ para: exit animations, layout animations, gestos
'use client'
import { motion, AnimatePresence } from 'framer-motion'

// Modal/dialog com enter/exit suave
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

### React 19 `useTransition` para Server Actions
```tsx
'use client'
import { useTransition } from 'react'

function SaveButton({ action }: { action: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(action)}
      style={{
        opacity: isPending ? 0.7 : 1,
        transition: 'opacity var(--duration-fast) var(--ease-out)',
        cursor: isPending ? 'wait' : 'pointer',
      }}
    >
      {isPending ? 'Salvando...' : 'Salvar'}
    </button>
  )
}
```

---

## Installation

```bash
# Produção — framer-motion apenas (se necessário)
pnpm add framer-motion@12

# Nada mais é necessário — motion é principalmente CSS + React 19 built-ins
```

---

## Sources

- **Context7 `/vercel/next.js`** — App Router, CSS support, View Transitions experimental
- **Context7 `/reactjs/react.dev`** — React 19 `useTransition`, `useActionState`, `useOptimistic`
- **framer-motion docs** (v12) — AnimatePresence, layout animations, reduced motion support
- **web.dev / prefers-reduced-motion** — Accessibility requirements for motion
- **MDN CSS Transitions & Animations** — `cubic-bezier`, `@keyframes`, `will-change`

---

## Confidence Notes

| Area | Confidence | Reason |
|------|------------|--------|
| CSS transitions | HIGH | Nativo, zero bundle, bem documentado |
| framer-motion v12 | HIGH | Biblioteca madura, React 19 compatível |
| React 19 hooks | HIGH | APIs estáveis, documentação oficial |
| View Transitions API | MEDIUM | Suporte Chrome/Edge crescente; Safari/Firefox em desenvolvimento |
| reduced-motion | HIGH | Media query bem suportada, obrigatória por acessibilidade |
