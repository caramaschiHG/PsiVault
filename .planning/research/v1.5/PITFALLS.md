# Domain Pitfalls: Motion & Micro-interactions in Clinical SaaS

**Domain:** Multi-tenant SaaS (PsiVault — prontuário eletrônico para psicólogos)
**Researched:** 2026-04-23
**Context:** Adicionando animações e micro-interações a um sistema de produção com 407 tests, design system maduro, e requisitos de acessibilidade WCAG 2.1 AA.

---

## Critical Pitfalls

### Pitfall 1: Animações que Degradam INP (Interaction to Next Paint)

**What goes wrong:** Micro-interações pesadas (blur filters, box-shadow transitions, animações de largura/altura) aumentam o tempo entre a interação do usuário e a próxima pintura do browser, degradando o INP — métrica crítica de Core Web Vitals.

**Why it happens:** Animar propriedades que forçam composição + paint (box-shadow, filter, border-radius) em vez de propriedades compostas (transform, opacity).

**Consequences:** PSIVault pode sair do range "Good" do INP (<200ms), especialmente em dispositivos de entrada mais lentos. O v1.4 investiu em performance objetiva — v1.5 não pode reverter isso.

**Prevention:**
- **Whitelist de propriedades animáveis:** apenas `transform` e `opacity` para animações contínuas.
- `box-shadow` e `background-color` são aceitáveis em hover states de curta duração (≤200ms), mas nunca em motion contínua.
- NUNCA animar `width`, `height`, `top`, `left`, `margin`, `padding`.
- Usar `will-change: transform` em elementos que animam frequentemente (cards, list items), mas remover após a animação para não consumir GPU o tempo todo.

**Detection:**
- Chrome DevTools → Performance → gravar interação. Verificar se há paint events durante a animação.
- web-vitals library: monitorar INP antes/depois de cada fase v1.5.
- Lighthouse CI: assert INP < 200ms.

**Phase to address:** Todas as fases — especialmente Phase 2 (componentes base) e Phase 4 (listas).

---

### Pitfall 2: Violação de `prefers-reduced-motion` — Risco de Acessibilidade e Legal

**What goes wrong:** Animações de parallax, bounce, ou movimento rápido causam náusea, vertigem ou desconforto em usuários com distúrbios vestibulares. Em um contexto clínico, isso é inaceitável e pode violar WCAG 2.1 AA (critério 2.3.3).

**Why it happens:** Desenvolvedores esquecem de testar com reduced motion ativado, ou assumem que "só uma animação sutil" não faz mal.

**Consequences:**
- Barreira de acessibilidade para psicólogos com sensibilidade a movimento.
- Possível violação de compliance WCAG 2.1 AA (já declarado como atingido em v1.0).
- Reputação de produto que não leva acessibilidade a sério.

**Prevention:**
- TODAS as animações CSS devem ter:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
- framer-motion: configurar `reducedMotion="user"` (padrão em v12, mas verificar).
- NUNCA usar parallax, bounce excessivo, ou rotação 3D.
- Teste obrigatório: ativar reduced motion no macOS/iOS/Android e navegar por TODO o app.

**Detection:**
- Audit manual com reduced motion ativado.
- Teste automatizado: simular `prefers-reduced-motion: reduce` via Puppeteer/Playwright e verificar que nenhum elemento tem `animation-duration > 0`.

**Phase to address:** Phase 1 (tokens CSS) e Phase 5 (audit final).

---

### Pitfall 3: Bundle Bloat por Import Desnecessário do framer-motion

**What goes wrong:** Importar `framer-motion` inteiro (`import { motion } from 'framer-motion'`) em vez de tree-shaking apenas o necessário, ou pior — importar em múltiplos componentes que poderiam usar CSS.

**Why it happens:** framer-motion é ~30kb gzipped. Se importado em 10 componentes sem tree-shaking eficiente, pode aumentar o bundle significativamente.

**Consequences:** Aumento de LCP e TTFB — exatamente o oposto do que v1.4 buscou.

**Prevention:**
- Usar importação granular:
```tsx
import { motion, AnimatePresence } from 'framer-motion'
```
- Limitar framer-motion a NO MÁXIMO 3–5 componentes no app inteiro (toasts, modais, page transition, layout animations pontuais).
- 80% das animações devem ser CSS puro — nenhum import de JS.
- Verificar bundle impact via `@next/bundle-analyzer` após adicionar framer-motion.

**Detection:**
- `next experimental-analyze` após Phase 1.
- `bundlesize` ou Lighthouse CI alertando aumento inesperado.

**Phase to address:** Phase 1 (setup) e Phase 5 (measurement).

---

### Pitfall 4: Flash de Conteúdo Não-Estilizado (FOUC) em Animações de Entrada

**What goes wrong:** Server Components renderizam o HTML com a classe de animação, mas o CSS de motion ainda não carregou. O conteúdo aparece "no estado final" por um instante, depois "pula" para o estado inicial e anima — efeito estranho e pouco profissional.

**Why it happens:** CSS async loading ou renderização server-side onde a classe `.motion-fade-in` aplica `opacity: 0` e `animation`, mas o CSS não foi processado ainda no primeiro paint.

**Consequences:** CLS e experiência visual quebrada — parece bug, não feature.

**Prevention:**
- Motion CSS deve ser carregado no critical path (inline em `<head>` ou parte do `globals.css` que é `import` no layout root).
- NUNCA carregar `motion.css` de forma lazy.
- Para Server Components, usar `animation-fill-mode: forwards` e garantir que o estado inicial (`opacity: 0`) está definido inline OU no CSS síncrono.

**Detection:**
- Lighthouse CLS audit.
- Throttle network para "Slow 3G" e observar first paint.

**Phase to address:** Phase 1 (foundation CSS) e Phase 4 (listas).

---

### Pitfall 5: AnimatePresence Causando Memory Leak em Long Sessions

**What goes wrong:** Toasts ou notificações que usam `AnimatePresence` para exit animations, mas o componente filho não é completamente desmontado devido a closures ou event listeners não removidos.

**Why it happens:** framer-motion mantém referências ao DOM node durante exit animation. Se o componente filho registra listeners de `setTimeout`, `setInterval`, ou `ResizeObserver` sem cleanup, esses objetos ficam retidos.

**Consequences:** Degradação de performance em sessões longas (dashboard aberto por horas), exatamente o cenário de uso do PsiVault.

**Prevention:**
- Garantir que TODOS os componentes dentro de `AnimatePresence` usem `useEffect` com cleanup functions.
- Limitar o número de toasts/notificações simultâneas (max 5).
- Usar `AnimatePresence` apenas para coleções pequenas e de curta duração.

**Detection:**
- Chrome DevTools Memory tab — heap snapshots após adicionar/remover 100 toasts.
- `memlab` scenario para fluxo de notificações.

**Phase to address:** Phase 3 (toasts/feedback).

---

### Pitfall 6: Inconsistência de Motion Criando Sensação de Produto Inacabado

**What goes wrong:** Alguns botões têm hover de 100ms, outros 300ms. Cards de uma página têm sombra animada, de outra não. Inputs em um formulário têm focus glow, em outro não.

**Why it happens:** Motion é adicionada incrementalmente por diferentes developers ou fases sem sistema unificado.

**Consequences:** Produto parece "patchwork" — mais amador do que antes de adicionar motion. A sensação "soft and flowing" exige consistência absoluta.

**Prevention:**
- NUNCA hardcodar valores de duration/easing em componentes. SEMPRE usar CSS variables.
- Criar checklist de "Motion Audit" — toda página nova deve validar todos os elementos interativos.
- Documentar no CLAUDE.md: "Todo elemento clicável deve ter feedback visual de hover, focus e active."

**Detection:**
- Audit visual page-by-page.
- `grep -r "transition:" src/components` deve mostrar apenas referências a CSS variables, nunca valores hardcoded.

**Phase to address:** Todas as fases — especialmente Phase 5 (polish).

---

### Pitfall 7: Page Transition Bloqueando Navegação Rápida

**What goes wrong:** Usar `AnimatePresence mode="wait"` com duração longa (300ms+) entre rotas. Usuários que clicam rapidamente em nav items sentem o app "lento" porque cada navegação espera a exit animation.

**Why it happens:** `mode="wait"` só monta o novo componente depois que o anterior completou exit.

**Consequences:** Percepção de lentidão — o oposto do objetivo de v1.5.

**Prevention:**
- Duração de page transition ≤ 150ms.
- Preferir `mode="sync"` (sobrepõe) ou simples fade simultâneo.
- NÃO usar page transitions em rotas de dados pesados — deixar o streaming do v1.4 cuidar da percepção de velocidade.
- Considerar View Transition API (nativo do browser) em vez de JS-driven transitions.

**Detection:**
- Teste de navegação rápida: clicar 5x em nav items em 2 segundos. O app deve responder imediatamente.
- INP monitoring em navegação entre rotas.

**Phase to address:** Phase 4 (page transitions).

---

## Moderate Pitfalls

### Pitfall 1: Skeleton Shimmer Causando Flicker em Dark Mode (se houver)

**What goes wrong:** Gradient de shimmer é otimizado para light mode (off-white base). Se futuramente houver dark mode, o shimmer pode parecer um flash branco.

**Prevention:** Definir shimmer colors via CSS variables (`--skeleton-base`, `--skeleton-highlight`) que serão sobrescritas em tema escuro.

**Phase to address:** Phase 1 (tokens).

### Pitfall 2: Hover em Touch Devices

**What goes wrong:** Estados de hover (translateY, shadow) "ficam presos" em dispositivos touch após o toque, criando estado visual inconsistente.

**Prevention:** Usar media query `@media (hover: hover)` para aplicar hover effects apenas em dispositivos com pointer fino.

```css
@media (hover: hover) {
  .card:hover {
    transform: translateY(-2px);
  }
}
```

**Phase to address:** Phase 2 (componentes base).

### Pitfall 3: Z-Index Conflicts com Modais Animados

**What goes wrong:** Modais com AnimatePresence que animam `scale` e `opacity` podem aparecer ABAIXO de outros elementos com z-index alto durante a animação.

**Prevention:** Garantir que o backdrop e o modal estejam em um portal com z-index do design token system (`--z-modal`). Animação não deve alterar z-index.

**Phase to address:** Phase 3 (modais).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Motion tokens | Valores hardcoded espalhados | CSS variables obrigatórias; grep audit |
| Component base | INP degradation em hover | Animar apenas transform/opacity; evitar blur/shadow animation contínua |
| Feedback (toasts) | Memory leak em AnimatePresence | Cleanup de listeners; limitar quantidade |
| Lists | FOUC em stagger | CSS síncrono no critical path; animation-fill-mode: forwards |
| Page transitions | Bloqueio de navegação rápida | Duração ≤150ms; mode="sync" ou View Transition API |
| Polish | Inconsistência visual | Checklist de motion audit page-by-page |

---

## Sources

- web.dev / INP (Interaction to Next Paint) — thresholds e causas
- web.dev / prefers-reduced-motion — WCAG 2.3.3 compliance
- web.dev / CLS — previne flash de conteúdo
- Framer Motion docs — AnimatePresence, memory, cleanup
- Chrome DevTools Performance — paint profiling
- MDN CSS — `will-change`, `transform`, `animation-fill-mode`
- PsiVault CLAUDE.md — anti-padrões visuais, requisitos de acessibilidade WCAG 2.1 AA
