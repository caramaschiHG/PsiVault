# UI-SPEC: Phase 33 — Micro-interações em Componentes Base

---

**status:** draft  
**phase:** 33 — Micro-interações em Componentes Base  
**design system:** Custom CSS (IBM Plex Sans/Serif, CSS variables, no shadcn)  
**depends on:** Phase 32 (Motion Tokens & Foundation CSS)  
**requirements:** MICR-01, MICR-02, MICR-03, MICR-04, MICR-05, MICR-06, MICR-07  
**language:** pt-BR (UI copy em português)  

---

## Design System Summary

Este projeto **não utiliza shadcn/ui**. O design system é construído sobre CSS puro com variáveis customizadas em `src/app/globals.css` e utilitários de motion em `src/styles/motion.css`. Componentes React usam `style={... satisfies React.CSSProperties}` com tokens CSS.

**Tokens de motion já estabelecidos (Phase 32):**
- `--duration-100: 100ms`
- `--duration-200: 200ms`
- `--duration-300: 300ms`
- `--ease-out: ease-out`
- `--ease-in-out: ease-in-out`

**Tokens de cor relevantes:**
- `--color-accent: #9a3412`
- `--color-accent-hover: #7c2a0e`
- `--color-focus-ring: rgba(154, 52, 18, 0.25)`
- `--color-sidebar-bg: #2d1810`
- `--color-sidebar-active: rgba(253, 186, 116, 0.15)`
- `--color-error-border: rgba(239, 68, 68, 0.3)`
- `--color-error-text: #dc2626`

**Tokens de sombra relevantes:**
- `--shadow-xs: 0 1px 2px rgba(120, 53, 15, 0.04)`
- `--shadow-sm: 0 2px 6px rgba(120, 53, 15, 0.07), 0 1px 3px rgba(120, 53, 15, 0.05)`
- `--shadow-md: 0 4px 16px rgba(120, 53, 15, 0.08), 0 2px 6px rgba(120, 53, 15, 0.04)`

**Tokens de tipografia relevantes:**
- `--font-size-xs: 0.75rem` (12px)
- `--font-size-sm: 0.8125rem` (13px)
- `--font-size-meta: 0.875rem` (14px)
- `--line-height-tight: 1.1`
- `--line-height-base: 1.5`

**Tokens de spacing:**
- Base 4px — `--space-1: 0.25rem`, `--space-2: 0.5rem`, `--space-3: 0.75rem`, `--space-4: 1rem`

**Tokens de raio:**
- `--radius-sm: 8px`
- `--radius-md: 14px`

---

## Interaction Contracts

### 1. Button States (MICR-01)

Todos os botões interativos do app devem possuir os seguintes estados visuais:

#### Hover
- **Primary (`.btn-primary`):** `background` transiciona de `#9a3412` para `#7c2a0e` (cor atual já definida em globals.css). Duração: `var(--duration-100)`.
- **Secondary (`.btn-secondary`):** `background` transiciona para `rgba(255, 247, 237, 0.7)`; `border-color` para `rgba(146, 64, 14, 0.3)`. Duração: `var(--duration-100)`.
- **Ghost (`.btn-ghost`):** `background` transiciona para `rgba(146, 64, 14, 0.05)`; `color` para `var(--color-text-1)`. Duração: `var(--duration-100)`.
- **Danger (`.btn-danger`):** `background` transiciona para `rgba(239, 68, 68, 0.06)`; `border-color` para `rgba(153, 27, 27, 0.35)`. Duração: `var(--duration-100)`.
- **Todas as variantes:** manter transição `transition: background var(--duration-100)` (ou equivalente combinada).

#### Active / Press
- **Todas as variantes (`.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`):**
  - `transform: scale(0.97)`
  - `transition: transform 60ms var(--ease-out)`
  - Aplica-se apenas no momento do clique; retorna ao normal no release.

#### Disabled / Loading
- **Disabled:** `opacity: 0.6`, `cursor: not-allowed`. Já existe em globals.css.
- **Loading:** o spinner SVG (`SpinnerIcon` em `button.tsx`) gira via `animation: spin 0.6s linear infinite`. O botão mantém `cursor: not-allowed` e `aria-busy="true"`.
- **SubmitButton (`submit-button.tsx`):** quando `useFormStatus().pending` é true, o botão entra no estado de loading automaticamente.

#### Focus-visible (botões)
- Migrar de `outline` para `box-shadow` em todos os botões focáveis.
- **Light background (app principal):**
  ```css
  .btn-primary:focus-visible,
  .btn-secondary:focus-visible,
  .btn-ghost:focus-visible,
  .btn-danger:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-accent);
    transition: box-shadow var(--duration-100) var(--ease-out);
  }
  ```
- **Dark background (sidebar):**
  ```css
  .vault-sidebar .nav-link:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-sidebar-bg), 0 0 0 4px rgba(253, 186, 116, 0.5);
    transition: box-shadow var(--duration-100) var(--ease-out);
  }
  ```

---

### 2. Card Hover Behavior (MICR-02)

#### Cards interativos (clicáveis)
**Critério de interatividade:** Card possui `onClick` ou está envolvido por um `<Link>` / `<a>`.

**Comportamento:**
- `transform: translateY(-2px)`
- `box-shadow: var(--shadow-md)` (elevação de `--shadow-xs` para `--shadow-md`)
- `transition: box-shadow var(--duration-200) var(--ease-out), transform var(--duration-200) var(--ease-out)`
- `cursor: pointer`

**Implementação no componente `Card` (`src/components/ui/card.tsx`):**
- O componente já detecta `onClick` e renderiza como `<button>`.
- Quando `onClick` está presente, aplicar classe `card-hover` automaticamente.
- Quando `Card` está dentro de um `Link` (determinado via context ou prop `asLink`), aplicar classe `card-hover` automaticamente.
- Variante `interactive` do Card já possui `cursor: pointer` e transições inline — alinhar com a classe CSS `card-hover` para consistência.

#### Cards não-interativos (containers estáticos)
**Critério:** Card sem `onClick` e não dentro de link.

**Comportamento (a critério do executor):**
- **Opção A (recomendada):** Sem hover visual — mantém estado estático.
- **Opção B:** Hover sutil apenas com sombra crescente, **sem** movimento vertical:
  ```css
  .card-static:hover {
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--duration-200) var(--ease-out);
  }
  ```

**Classe CSS existente a refinar:**
```css
.card-hover {
  transition: box-shadow var(--duration-200) var(--ease-out), transform var(--duration-200) var(--ease-out);
}
.card-hover:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

---

### 3. Focus Ring System (MICR-03)

#### Princípio geral
- **Migrar de `outline` para `box-shadow`** em todos os elementos focáveis.
- Focus ring visível **apenas na navegação por teclado** (`:focus-visible`).
- Cliques de mouse/touch não mostram ring.
- Ao perder foco, ring faz fade-out suave (`transition: box-shadow var(--duration-100)`).

#### Offset de 2px (técnica de double-shadow)
Simular offset de 2px entre elemento e ring:
```css
box-shadow: 0 0 0 2px <bg-color>, 0 0 0 4px <ring-color>;
```

#### Variantes por contexto

**A. Fundo claro (app principal, cards, formulários):**
```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-accent);
  border-radius: inherit;
  transition: box-shadow var(--duration-100) var(--ease-out);
}
```

**B. Inputs (`.input-field`, `.auth-input`, `.auth-otp-digit`):**
- **Não usar o ring visível dos botões.** Manter glow suave diferenciado:
```css
.input-field:focus-visible,
.auth-input:focus-visible,
.auth-otp-digit:focus-visible {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(154, 52, 18, 0.1);
  transition: border-color var(--duration-100) var(--ease-out), box-shadow var(--duration-100) var(--ease-out);
}
```
- Nota: `rgba(154, 52, 18, 0.1)` é intencionalmente mais suave que `var(--color-focus-ring)` (`rgba(154, 52, 18, 0.25)`) para criar diferenciação visual entre inputs e botões.

**C. Fundo escuro (sidebar, `.vault-sidebar`):**
```css
.vault-sidebar .nav-link:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-sidebar-bg), 0 0 0 4px rgba(253, 186, 116, 0.5);
  border-radius: var(--radius-md);
  transition: box-shadow var(--duration-100) var(--ease-out);
}
```
- Cor do ring em fundo escuro: `rgba(253, 186, 116, 0.5)` — tom claro quente para garantir contraste contra `#2d1810`.

**D. Tabs (`.tab`):**
```css
.tab:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-accent);
  border-radius: inherit;
  transition: box-shadow var(--duration-100) var(--ease-out);
}
```
- Usar `inset` para tabs para não quebrar o layout da borda inferior.

**E. Bottom nav items (`.bottom-nav-item`):**
```css
.bottom-nav-item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-surface-0), 0 0 0 4px var(--color-accent);
  border-radius: var(--radius-md);
  transition: box-shadow var(--duration-100) var(--ease-out);
}
```

---

### 4. Input Micro-interactions (MICR-04)

#### A. Floating Labels
**Escopo:** Todos os inputs focáveis: `text`, `email`, `password`, `select`, `textarea`.

**Comportamento:**
- Label flutua (sobe e diminui) quando:
  1. Input recebe **focus**, OU
  2. Input possui **valor preenchido** (`:not(:placeholder-shown)`)

**Especificações visuais:**
- Label padrão: `font-size: var(--font-size-meta)` (14px), `color: var(--color-text-2)`, `font-weight: 500`.
- Label flutuada: `color: var(--color-accent)`, `transform: translateY(-1.25rem) scale(0.85)` — tamanho efetivo ~12px (14px × 0.85), mantido dentro da escala tipográfica.
- Transição: `transition: transform var(--duration-200) var(--ease-out), color var(--duration-200) var(--ease-out)`.
- Container do input deve ter `position: relative` e `padding-top: 1rem` para acomodar o label flutuado.

**Classes CSS propostas:**
```css
.input-floating-label-wrap {
  position: relative;
  padding-top: 1rem;
}

.input-floating-label {
  position: absolute;
  left: 0.75rem;
  top: 1.5rem;
  font-size: var(--font-size-meta);
  color: var(--color-text-2);
  font-weight: 500;
  pointer-events: none;
  transform-origin: left top;
  transition: transform var(--duration-200) var(--ease-out), color var(--duration-200) var(--ease-out);
}

.input-field:focus ~ .input-floating-label,
.input-field:not(:placeholder-shown) ~ .input-floating-label,
.auth-input:focus ~ .input-floating-label,
.auth-input:not(:placeholder-shown) ~ .input-floating-label {
  transform: translateY(-1.25rem) scale(0.85);
  color: var(--color-accent);
}
```

**Nota para selects:** Selects não suportam `:placeholder-shown`. Detectar valor preenchido via classe adicionada pelo React (`has-value`) ou verificar `value !== ''`.

#### B. Border Glow no Focus
- Já existe para `.input-field` e `.auth-input` em globals.css.
- Manter o padrão:
```css
.input-field:focus,
.auth-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(154, 52, 18, 0.1);
  transition: border-color var(--duration-100) var(--ease-out), box-shadow var(--duration-100) var(--ease-out);
}
```

#### C. Error Shake
**Disparo:** Classe `.input-error-shake` adicionada pelo componente de formulário quando detecta erro de validação.

**Especificações:**
- Shake sutil lateral: `translateX(-2px)` → `translateX(2px)` → `translateX(0)`.
- Duração: `var(--duration-200)` (200ms).
- Timing: `ease-in-out`.
- Ocorre **uma única vez** — usar `animation-iteration-count: 1`.
- Acompanhado de transição de cor da borda para vermelho:
```css
.input-error {
  border-color: var(--color-error-border);
  transition: border-color var(--duration-200) var(--ease-out);
}
```

**Keyframes:**
```css
@keyframes inputShake {
  0%   { transform: translateX(0); }
  25%  { transform: translateX(-2px); }
  75%  { transform: translateX(2px); }
  100% { transform: translateX(0); }
}
```

**Classe de aplicação:**
```css
.input-error-shake {
  animation: inputShake var(--duration-200) var(--ease-in-out) 1;
}
```

**Comportamento combinado:**
Quando erro é detectado:
1. Adicionar `.input-error-shake` ao input.
2. Adicionar `.input-error` ao input (mantém borda vermelha).
3. Remover `.input-error-shake` após a animação completar (ou deixar o browser remover naturalmente após `animationend`).

---

### 5. Navigation Active State Transitions (MICR-05)

#### Sidebar Desktop (`.vault-sidebar .nav-link`)
**Indicador de ativo:**
- `color: rgba(255, 255, 255, 0.98)`
- `background-color: rgba(255, 255, 255, 0.12)`
- `font-weight: 600`
- `box-shadow: inset 2px 0 0 rgba(253, 186, 116, 0.7)` — borda laranja à esquerda

**Transição do estado ativo:**
```css
.vault-sidebar .nav-link {
  transition: background-color var(--duration-200) var(--ease-out),
              color var(--duration-200) var(--ease-out),
              box-shadow var(--duration-200) var(--ease-out);
}
```
- O `box-shadow: inset` faz parte da transição — aparece/desaparece suavemente.

**Hover em sidebar nav items:**
```css
.vault-sidebar .nav-link:hover {
  color: rgba(255, 255, 255, 0.95);
  background-color: rgba(255, 255, 255, 0.08);
  transition: background-color var(--duration-300) var(--ease-out),
              color var(--duration-300) var(--ease-out);
}
```
- **Duração de hover na sidebar: `var(--duration-300)` (300ms)** — mais lenta que botões (`var(--duration-200)`), criando sensação de calma na navegação.

**Nav items NÃO têm feedback de press/active:**
- Sem `scale` ou `opacity` no click.
- Apenas hover + indicador ativo.

#### Bottom Nav Mobile (`.bottom-nav-item`)
- **Mudança instantânea** — sem transição no estado ativo.
- `color` muda imediatamente para `var(--color-accent)`;
- `font-weight` muda imediatamente para `600`.
- Hover permitido com `transition: color var(--duration-200)` (já existe).

#### Breadcrumb (`.breadcrumb-link`)
- `transition: color var(--duration-100) var(--ease-out)`
- Hover: `color: var(--color-accent)`

---

### 6. Cursor Audit Requirements (MICR-06)

**Auditoria elemento por elemento.** Todo elemento interativo deve ter cursor apropriado.

#### Regras por tipo de elemento

| Elemento | Cursor esperado | Onde verificar |
|----------|----------------|----------------|
| Botões (`<button>`, `[role="button"]`) | `pointer` | `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `Button` component |
| Links (`<a>`, `<Link>`) | `pointer` | Nav links, breadcrumb, auth links, footer links |
| Cards clicáveis | `pointer` | `Card` com `onClick` ou dentro de `Link` |
| Rows interativas (listas, tabelas) | `pointer` | `.row-interactive`, rows de lista de pacientes/atendimentos |
| Inputs | `text` | `.input-field`, `.auth-input`, `.auth-otp-digit` |
| Inputs desabilitados | `not-allowed` | `[disabled]` |
| Botões desabilitados/loading | `not-allowed` | `.btn-*:disabled` |
| FABs | `pointer` | `.fab-mobile`, quick action FAB |
| Áreas de drop | `copy` / `pointer` | `.receipt-drop-zone` |
| Áreas de resize/drag | `grab` / `grabbing` | Se houver em algum componente |
| Tabs | `pointer` | `.tab` |
| Notif bell | `pointer` | `.notif-bell` |
| Side panel close | `pointer` | `.side-panel-close` |
| Mini calendar days | `pointer` | `.mini-cal-day` |
| Month calendar bars | `pointer` | `.month-cal-bar` |
| Select inputs | `pointer` | `select.input-field` |
| Template cards | `pointer` | `.template-card` |

#### Catch-all já existente
```css
a, button, [role="button"],
label[for], .nav-link, summary {
  cursor: pointer;
}
```

#### Verificações adicionais necessárias
- `Card` com `onClick` deve garantir `cursor: pointer` (já existe no variant `interactive`, verificar nos outros casos).
- `.row-interactive` deve ter `cursor: pointer` (já existe).
- Inputs (`<input>`, `<textarea>`) devem ter `cursor: text` (padrão do browser; verificar se não está sendo sobrescrito).

---

### 7. Smooth Scroll + Reduced Motion (MICR-07)

#### Smooth scroll global
```css
html {
  scroll-behavior: smooth;
}
```
- **Já existe em globals.css** — não requer alteração.

#### Fallback para reduced motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
- **Já existe em globals.css** — não requer alteração.
- **Verificação necessária:** Garantir que novas animações/shakes/floating labels também sejam capturadas por este catch-all.

#### Reduced motion para motion.css
```css
@media (prefers-reduced-motion: reduce) {
  .motion-fade-in, .motion-slide-up, .motion-scale-in, .motion-stagger > *,
  .vault-page-transition, .toast-enter, .skeleton-shimmer,
  .input-error-shake {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```
- Adicionar **apenas** `.input-error-shake` à lista existente em `motion.css`.
- **Não** adicionar classes de floating label a esse bloco — o catch-all global em `globals.css` (`transition-duration: 0.01ms`) já garante transição instantânea sem destruir o posicionamento final das labels.

---

## CSS Contracts

### Novos Keyframes (adicionar em `src/styles/motion.css`)

```css
/* Input error shake */
@keyframes inputShake {
  0%   { transform: translateX(0); }
  25%  { transform: translateX(-2px); }
  75%  { transform: translateX(2px); }
  100% { transform: translateX(0); }
}
```

### Novas Classes CSS (adicionar em `src/app/globals.css`)

```css
/* ─── Focus ring system — box-shadow based ─────────────────────────────────── */

/* Override global outline para todos os elementos focáveis */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-accent);
  border-radius: inherit;
  transition: box-shadow var(--duration-100) var(--ease-out);
}

/* Input focus glow — diferenciado do ring de botões */
.input-field:focus-visible,
.auth-input:focus-visible,
.auth-otp-digit:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(154, 52, 18, 0.1);
  border-color: var(--color-accent);
}

/* Sidebar focus ring — variante clara para fundo escuro */
.vault-sidebar .nav-link:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-sidebar-bg), 0 0 0 4px rgba(253, 186, 116, 0.5);
  border-radius: var(--radius-md);
}

/* Tab focus ring — inset para não quebrar layout */
.tab:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--color-accent);
  border-radius: inherit;
}

/* Bottom nav focus ring */
.bottom-nav-item:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-surface-0), 0 0 0 4px var(--color-accent);
  border-radius: var(--radius-md);
}

/* ─── Card hover — refinado ────────────────────────────────────────────────── */

.card-hover {
  transition: box-shadow var(--duration-200) var(--ease-out),
              transform var(--duration-200) var(--ease-out);
}

.card-hover:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Card estático com hover sutil (sem movimento vertical) */
.card-static-hover:hover {
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-200) var(--ease-out);
}

/* ─── Input error states ───────────────────────────────────────────────────── */

.input-error {
  border-color: var(--color-error-border) !important;
}

.input-error-shake {
  animation: inputShake var(--duration-200) var(--ease-in-out) 1;
}

/* ─── Floating labels ──────────────────────────────────────────────────────── */

.input-floating-label-wrap {
  position: relative;
  padding-top: 1rem;
}

.input-floating-label {
  position: absolute;
  left: 0.75rem;
  top: 1.5rem;
  font-size: var(--font-size-meta);
  color: var(--color-text-2);
  font-weight: 500;
  pointer-events: none;
  transform-origin: left top;
  transition: transform var(--duration-200) var(--ease-out),
              color var(--duration-200) var(--ease-out);
}

.input-field:focus ~ .input-floating-label,
.input-field:not(:placeholder-shown) ~ .input-floating-label,
.auth-input:focus ~ .input-floating-label,
.auth-input:not(:placeholder-shown) ~ .input-floating-label,
.select-has-value ~ .input-floating-label {
  transform: translateY(-1.25rem) scale(0.85);
  color: var(--color-accent);
}

/* ─── Sidebar nav transitions ──────────────────────────────────────────────── */

.vault-sidebar .nav-link {
  color: rgba(255, 255, 255, 0.75);
  transition: background-color var(--duration-200) var(--ease-out),
              color var(--duration-200) var(--ease-out),
              box-shadow var(--duration-200) var(--ease-out);
  line-height: 1.4;
  letter-spacing: 0.005em;
}

.vault-sidebar .nav-link:hover {
  color: rgba(255, 255, 255, 0.95);
  background-color: rgba(255, 255, 255, 0.08);
  transition: background-color var(--duration-300) var(--ease-out),
              color var(--duration-300) var(--ease-out);
}

.vault-sidebar .nav-link.active {
  color: rgba(255, 255, 255, 0.98);
  background-color: rgba(255, 255, 255, 0.12);
  font-weight: 600;
  box-shadow: inset 2px 0 0 rgba(253, 186, 116, 0.7);
}

/* ─── Button active states ─────────────────────────────────────────────────── */

.btn-primary:active,
.btn-secondary:active,
.btn-ghost:active,
.btn-danger:active {
  transform: scale(0.97);
  transition: transform 60ms var(--ease-out);
}
```

### Componente Card — ajustes (`src/components/ui/card.tsx`)

```typescript
// Adicionar prop `asLink` ou detectar automaticamente
interface CardProps {
  variant?: CardVariant;
  padding?: "sm" | "md" | "lg";
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
  asLink?: boolean; // NOVO
}

// No render:
const isInteractive = onClick || asLink;
const combinedClassName = [
  className,
  isInteractive ? "card-hover" : "",
].filter(Boolean).join(" ");

// O cursor: pointer já é aplicado quando onClick existe
// Quando asLink é true, garantir cursor: pointer via style
```

---

## Accessibility Contracts

### WCAG 2.1 AA Compliance

| Critério | Implementação | Status |
|----------|--------------|--------|
| **Focus Visible** (2.4.7) | Focus ring via `box-shadow` visível em todos os elementos focáveis (`:focus-visible`). | A implementar |
| **Focus Appearance** (2.4.13 — AAA, mas recomendado) | Ring de 2px de espessura, cor `--color-accent` (#9a3412), contraste 5.1:1 contra `--color-bg`. | A implementar |
| **Reduced Motion** | Media query `prefers-reduced-motion: reduce` desativa todas as transições e animações. | Já existe |
| **Non-text Contrast** (1.4.11) | Estados de erro usam borda vermelha (`--color-error-border`) + shake visual. | A implementar |
| **Label in Name** (2.5.3) | Floating labels mantêm texto acessível; usar `aria-label` quando label flutuada pode causar issues em leitores de tela. | Verificar |

### Regras de acessibilidade específicas

1. **Focus ring apenas no teclado:** Usar exclusivamente `:focus-visible`, nunca `:focus`.
2. **Não remover outline sem substituto:** Sempre que `outline: none` for aplicado, um `box-shadow` substituto deve estar presente.
3. **Shake não deve causar seizures:** Shake de 2px lateral, 200ms, 1 iteração — está abaixo dos limites de flash.
4. **Reduced motion coverage:** Toda nova animação deve ser coberta pelo catch-all `prefers-reduced-motion` ou explicitamente listada em `motion.css`.
5. **Touch targets:** Manter `min-height: 44px` e `min-width: 44px` em todos os elementos interativos (já existe em globals.css).

---

## Copywriting Contract

Esta fase é predominantemente visual/interaction. Copy mínimo envolvido:

- **Floating labels:** Reutilizar labels existentes dos formulários — não alterar texto.
- **Estados de erro:** Manter mensagens de erro existentes; esta fase apenas adiciona feedback visual (shake + cor).
- **Nenhum CTA novo** é introduzido nesta fase.

---

## Registry Safety

**Não aplicável.** Esta fase utiliza exclusivamente CSS custom e componentes existentes. Nenhum registro de terceiros é utilizado.

---

## Checker Sign-Off — 6 Dimensions

| Dimensão | Status | Evidência |
|----------|--------|-----------|
| **1. Visual Consistency** | ✅ Contrato definido | Tokens CSS centralizados; sombras limitadas a `--shadow-xs`/`--shadow-sm`/`--shadow-md`; sem gradientes decorativos. |
| **2. Interaction Clarity** | ✅ Contrato definido | Hover/active/focus/disabled documentados para botões, cards, inputs, navegação. Cursor audit mapeado elemento por elemento. |
| **3. Accessibility** | ✅ Contrato definido | Focus-visible obrigatório; reduced motion catch-all; contrastes verificados; touch targets 44px. |
| **4. Responsiveness** | ✅ Contrato definido | Bottom nav mobile sem transições ativas (instantâneo); sidebar desktop com transições suaves. |
| **5. Performance** | ✅ Contrato definido | Todas as animações via CSS (GPU-accelerated: transform, opacity, box-shadow). Nenhuma animação de layout (width, height, margin). |
| **6. Brand Alignment** | ✅ Contrato definido | Tom calmo: nav hover mais lento (300ms), shake sutil (2px), sombras contidas, sem efeitos decorativos. |

---

## Summary of Changes per File

| Arquivo | Tipo de mudança | Descrição |
|---------|----------------|-----------|
| `src/app/globals.css` | Adicionar | Novas classes: focus ring system, card hover refinado, input error states, floating labels, sidebar nav transitions. |
| `src/styles/motion.css` | Adicionar | Keyframe `inputShake`; adicionar `.input-error-shake` à lista de reduced motion. |
| `src/components/ui/card.tsx` | Modificar | Aplicar `card-hover` automaticamente quando interativo (`onClick` ou `asLink`). |
| `src/components/ui/button.tsx` | Verificar | Garantir que focus ring via box-shadow seja aplicado (herdado do globals.css). |
| `src/app/(vault)/components/vault-sidebar-nav.tsx` | Verificar | Garantir que transições de hover/active estejam aplicadas nas classes CSS. |
| Formulários do app | Modificar | Envolver inputs com `.input-floating-label-wrap` e adicionar floating labels; aplicar `.input-error-shake` em erro. |

---

*UI-SPEC gerado em 2026-04-23. Revisar após implementação antes de merge.*
