# PsiVault — Sistema de Design (App Interno)

Documento de design system para rotas `(vault)` do PsiVault. Escrito em pt-BR. Leia antes de gerar UI nova.

---

## 1. Tema Visual e Atmosfera

**Identidade.** Prontuario eletrônico para psicólogos brasileiros. A ferramenta de trabalho da rotina clínica.

**Mood.** Discreto, premium sem exibicionismo, clinicamente profissional sem frieza hospitalar. Ritmo editorial e muito espaço. A calma do consultório traduzida para a interface.

**Densidade.** Média-alta quando necessario — dados clínicos podem ser densos, mas sempre com respiro suficiente para não sufocar a leitura.

**Filosofia visual.**
- Hierarquia via tipografia e espaçamento, nunca via cor excessiva.
- Superfícies quentes, bordas sensiveis, acento terracota contido.
- Movimento apenas para orientar ou responder a interacao — nunca decorativo.

**Anti-mood (nunca).**
- Visual fintech, crypto, dashboard fantasioso.
- AI gimmick, glow, glassmorphism, gradientes espalhafatosos.
- Wellness brand, coach, startup hype.

---

## 2. Paleta e Papéis Semânticos

Use sempre `var(--token)`; nunca hex cru em componentes novos. As tabelas abaixo mostram o par light / dark lado a lado.

### 2.1 Superfícies

| Papel | Token | Light | Dark |
|-------|-------|-------|------|
| Fundo da página | `--color-bg` | `#f7f3ed` | `#161412` |
| Card primário | `--color-surface-0` | `#ffffff` | `#1e1b18` |
| Card secundário / list row | `--color-surface-1` | `#fffcf7` | `#24201c` |
| Sobreposição translúcida | `--color-surface-2` | `rgba(255,252,247,0.95)` | `rgba(36,32,28,0.95)` |
| Hover / terciário | `--color-surface-3` | `#f5f0e8` | `#2a2622` |

**Superfícies nomeadas por elevação:**
- `--surface-base` = `--color-surface-1` (cards normais)
- `--surface-raised` = `--color-surface-0` (cards elevados)
- `--surface-overlay` = `--color-surface-0` (dropdowns, modais)

### 2.2 Bordas

| Papel | Token | Light | Dark |
|-------|-------|-------|------|
| Padrão | `--color-border` | `rgba(146,64,14,0.12)` | `rgba(247,243,237,0.08)` |
| Média / input | `--color-border-med` | `rgba(146,64,14,0.20)` | `rgba(247,243,237,0.14)` |

### 2.3 Texto

| Papel | Token | Light | Dark | Contraste |
|-------|-------|-------|------|-----------|
| Primário (títulos, body) | `--color-text-1` | `#1c1917` | `#f0ebe2` | AAA |
| Secundário (labels, metadados) | `--color-text-2` | `#57534e` | `#b8b0a4` | AA |
| Terciário (helper, placeholder) | `--color-text-3` | `#57534e` | `#a8a095` | AA |
| Quaternário (desativado, hint) | `--color-text-4` | `#78716c` | `#8a8278` | AA |

### 2.4 Acento (terracota)

| Papel | Token | Light | Dark |
|-------|-------|-------|------|
| Principal | `--color-accent` | `#9a3412` | `#c26a4a` |
| Hover / pressed | `--color-accent-hover` | `#7c2a0e` | `#e08a6a` |
| Superfície sutil | `--color-accent-light` | `rgba(154,52,18,0.08)` | `rgba(194,106,74,0.12)` |
| Focus ring | `--color-focus-ring` | `rgba(154,52,18,0.25)` | `rgba(194,106,74,0.35)` |

**Uso correto do acento.**
- CTAs primários (`btn-primary`).
- Estados ativos de navegação (sidebar, tabs).
- Links acionáveis e ícones de ação principal.
- Focus-visible em inputs e botões.
- Nunca como fundo de listagem, nunca em blocos grandes.

### 2.5 Sidebar

| Papel | Token | Light | Dark |
|-------|-------|-------|------|
| Fundo | `--color-sidebar-bg` | `#2d1810` | `#11100e` |
| Versão light (fallback) | `--color-sidebar-bg-light` | `#f0ebe2` | `#1e1b18` |
| Item ativo | `--color-sidebar-active` | `rgba(253,186,116,0.15)` | `rgba(194,106,74,0.15)` |

Texto no sidebar: `rgba(255,255,255,0.75)` inativo, `rgba(255,255,255,0.95)` hover, `rgba(255,255,255,0.98)` ativo.

### 2.6 Semânticos (feedback)

| Papel | Token (Light) | Hex (Light) | Token (Dark) | Hex (Dark) |
|-------|---------------|-------------|--------------|------------|
| Aviso — fundo | `--color-warning-bg` | `rgba(245,158,11,0.10)` | `rgba(245,158,11,0.12)` | idem |
| Aviso — texto | `--color-warning-text` | `#92400e` | `#fbbf24` | idem |
| Sucesso — fundo | `--color-success-bg` | `#dcfce7` | `rgba(34,197,94,0.12)` | idem |
| Sucesso — borda | `--color-success-border` | `#86efac` | `rgba(34,197,94,0.35)` | idem |
| Sucesso — texto | `--color-success-text` | `#166534` | `#4ade80` | idem |
| Erro — fundo | `--color-error-bg` | `rgba(239,68,68,0.08)` | `rgba(239,68,68,0.10)` | idem |
| Erro — borda | `--color-error-border` | `rgba(239,68,68,0.30)` | `rgba(239,68,68,0.35)` | idem |
| Erro — texto | `--color-error-text` | `#dc2626` | `#f87171` | idem |

### 2.7 Status de atendimento

| Status | Fundo (Light) | Borda (Light) | Fundo (Dark) | Borda (Dark) |
|--------|---------------|---------------|--------------|--------------|
| Agendado | `rgba(255,247,237,0.90)` | `rgba(154,52,18,0.20)` | `rgba(194,106,74,0.10)` | `rgba(194,106,74,0.30)` |
| Confirmado | `rgba(245,250,246,0.90)` | `rgba(34,197,94,0.25)` | `rgba(34,197,94,0.10)` | `rgba(34,197,94,0.30)` |
| Concluído | `rgba(245,235,220,0.90)` | `rgba(146,64,14,0.18)` | `rgba(168,160,149,0.10)` | `rgba(168,160,149,0.25)` |
| Cancelado | `rgba(248,250,252,0.90)` | `rgba(148,163,184,0.25)` | `rgba(100,116,139,0.12)` | `rgba(100,116,139,0.30)` |
| Faltou | `rgba(255,241,242,0.90)` | `rgba(244,63,94,0.20)` | `rgba(244,63,94,0.10)` | `rgba(244,63,94,0.25)` |

*Tokens CSS alternativos (legado):* `--status-*` e `--appt-*`. Preferir `--appt-*` em código novo.

### 2.8 Status financeiro

| Status | Fundo (Light) | Texto (Light) | Fundo (Dark) | Texto (Dark) |
|--------|---------------|---------------|--------------|--------------|
| Pago | `rgba(34,197,94,0.10)` | `#166534` | `rgba(34,197,94,0.12)` | `#4ade80` |
| Pendente | `rgba(245,158,11,0.10)` | `#92400e` | `rgba(245,158,11,0.12)` | `#fbbf24` |
| Atrasado | `rgba(239,68,68,0.10)` | `#991b1b` | `rgba(239,68,68,0.12)` | `#f87171` |

### 2.9 Cores auxiliares (legado — uso pontual, evitar em código novo)

| Token | Light | Dark | Nota |
|-------|-------|------|------|
| `--color-rose` | `#9f1239` | `#f43f5e` | Badges de notificacao |
| `--color-warm-brown` | `#44403c` | `#d4c5b5` | Texto de calendario |
| `--color-slate` | `#64748b` | `#94a3b8` | Icones secundarios |
| `--color-forest` | `#2d6a4f` | `#6ee7b7` | Texto de sucesso alternativo |
| `--color-teal` | `#2d7d6f` | `#5eead4` | Destaques pontuais |
| `--color-amber-dark` | `#78350f` | `#fbbf24` | Destaque ambar |
| `--color-emerald` | `#047857` | `#34d399` | Estados positivos |
| `--color-note-blue` | `#1e40af` | `#60a5fa` | Lembretes |
| `--color-brown-mid` | `#b45309` | `#d48c5e` | Eyebrow labels |

**Regra:** em componentes novos, sempre preferir tokens das tabelas 2.1–2.8. As cores acima existem para compatibilidade com componentes legados.

---

## 3. Tipografia

**Famílias.**
- Display / títulos editoriais: `"IBM Plex Serif", Georgia, serif`
- UI / corpo / labels: `"IBM Plex Sans", "Segoe UI", sans-serif`

### 3.1 Escala

| Token | Tamanho | Uso |
|-------|---------|-----|
| `--font-size-2xs` | `0.6875rem` (11px) | Dots de badge, captions mínimas |
| `--font-size-xs` | `0.75rem` (12px) | Timestamps, captions, eyebrow labels |
| `--font-size-sm` | `0.8125rem` (13px) | Labels, badges, metadados |
| `--font-size-meta` | `0.875rem` (14px) | Metadata, datas, status, helper text |
| `--font-size-body-sm` | `0.9375rem` (15px) | Body secundário |
| `--font-size-body` | `1rem` (16px) | Body padrão (base) |
| `--font-size-h3` | `1.0625rem` (17px) | Subseções, card titles |
| `--font-size-h2` | `clamp(1.125rem, 2.5vw, 1.25rem)` | Títulos de seção (18–20px) |
| `--font-size-h1` | `clamp(1.5rem, 3.5vw, 1.875rem)` | Títulos de página (24–30px) |
| `--font-size-display` | `1.875rem` (30px) | Números grandes em stat cards |

### 3.2 Altura de linha

| Token | Valor | Uso |
|-------|-------|-----|
| `--line-height-tight` | `1.1` | Números, display |
| `--line-height-base` | `1.5` | Body padrão |
| `--line-height-relaxed` | `1.65` | Parágrafos longos |
| `--line-height-loose` | `1.75` | Texto raro, leitura prolongada |

### 3.3 Espaçamento entre letras

| Token | Valor | Uso |
|-------|-------|-----|
| `--letter-spacing-tight` | `-0.02em` | Display, h1, brand mark |
| `--letter-spacing-normal` | `0` | Body, labels padrão |
| `--letter-spacing-wide` | `0.05em` | Labels uppercase pequenas |
| `--letter-spacing-wider` | `0.12em` | Eyebrow labels, app badge |
| `--letter-spacing-widest` | `0.18em` | Auth eyebrow, steps |

### 3.4 Pesos

- `400` — corpo, descrições
- `500` — labels, nav links inativos, tab labels
- `600` — botões, nav links ativos, card titles, headings
- `700` — display numbers, brand mark, stat values

---

## 4. Componentes

Estilize sempre via tokens CSS. Estados obrigatórios: `hover`, `active`, `disabled`, `focus-visible`.

### 4.1 Botões

**Primary (`.btn-primary`)**
- Fundo: `--color-accent` / texto: `#fff7ed`
- Padding: `0.625rem 1.25rem`
- Raio: `--radius-md`
- Hover: `--color-accent-hover`
- Active: `transform: scale(0.97)` (60ms)
- Disabled: `opacity: 0.6`, `cursor: not-allowed`
- Fonte: `0.9rem` weight `600`

**Secondary (`.btn-secondary`)**
- Fundo: `#fff7ed` / borda: `1px solid --color-border-med`
- Texto: `--color-accent`
- Hover: fundo `rgba(255,247,237,0.7)`, borda `rgba(146,64,14,0.3)`

**Ghost (`.btn-ghost`)**
- Fundo: transparente / borda: `1px solid transparent`
- Texto: `--color-text-2`
- Hover: fundo `rgba(146,64,14,0.05)`, texto `--color-text-1`

**Danger (`.btn-danger`)**
- Fundo: transparente / borda: `1px solid rgba(153,27,27,0.2)`
- Texto: `#991b1b`
- Hover: fundo `rgba(239,68,68,0.06)`

**Small (`.btn-sm`)**
- Padding: `0.375rem 0.75rem`
- Fonte: `0.8125rem`

### 4.2 Inputs

**Campo padrão (`.input-field`)**
- Fonte: `IBM Plex Sans`, `0.9rem`
- Fundo: `--color-surface-0`
- Borda: `1px solid --color-border-med`
- Raio: `--radius-sm`
- Padding: `0.5rem 0.75rem`
- Focus: borda `--color-accent`, box-shadow `0 0 0 3px rgba(154,52,18,0.1)`
- Placeholder: `--color-text-4`
- Select: arrow customizada via SVG inline (troca automaticamente no dark)

**Erro (`.input-error`)**
- Borda: `--color-error-border`
- Shake: `@keyframes inputShake` (200ms)

**Label flutuante**
- Posicionamento absoluto sobre o input
- Focus / preenchido: `translateY(-1.25rem) scale(0.85)`, cor `--color-accent`
- Usar `.input-floating-label-wrap` + `.input-floating-label`

### 4.3 Cards

**Card base**
- Fundo: `--surface-base`
- Raio: `--radius-md`
- Borda: `1px solid --color-border` (opcional)

**Card com hover (`.card-hover`)**
- Hover: `--shadow-md`, `translateY(-2px)`
- Transição: `200ms ease-out` em shadow e transform

**Card de setup / modal**
- Sombra: `--shadow-2xl` ou `--shadow-card-elevated`
- Raio: `--radius-lg` ou `--radius-xl`

### 4.4 Sidebar

- Fundo: `--color-sidebar-bg`
- Itens: padding `0.5rem 0.875rem`, raio `--radius-md`
- Inativo: `rgba(255,255,255,0.75)`, weight `500`
- Hover: `rgba(255,255,255,0.95)`, fundo `rgba(255,255,255,0.08)`
- Ativo: `rgba(255,255,255,0.98)`, fundo `rgba(255,255,255,0.12)`, inset left border `2px rgba(253,186,116,0.7)`
- Focus-visible: ring duplo (bg + accent)

### 4.5 Top bar

- Altura fixa: `64px`
- Posição: `sticky`, top `0`, z-index `--z-sticky`
- Fundo: `--color-surface-0`
- Borda inferior: `1px solid --color-border`
- Padding: `0 1.5rem`

### 4.6 Bottom nav (mobile)

- Altura: `4rem`
- Posição: `fixed`, bottom `0`
- Fundo: `--color-surface-0`
- Borda superior: `1px solid --color-border`
- Z-index: `--z-sticky`
- Oculto em desktop; visível abaixo de `767px`

### 4.7 Tabs

- Lista: flex, gap `0`, borda inferior `2px solid --color-border`
- Tab: padding `0.7rem 1.2rem`, fonte `0.85rem` weight `500`, cor `--color-text-3`
- Hover: `--color-text-1`
- Ativa (`.tab--active`): cor `--color-accent`, borda inferior `--color-accent`, weight `600`
- Focus-visible: inset ring `2px --color-accent`

### 4.8 Breadcrumb

- Fonte: `0.82rem`
- Separador: `--color-text-4`
- Link: `--color-text-2`, hover `--color-accent`
- Atual: `--color-text-1`, weight `600`

### 4.9 Notificações

- Badge no sino: `--color-rose`, `#fff`, fonte `2xs` weight `700`
- Dropdown: `360px`, `--color-surface-0`, `--shadow-xl`, `--radius-lg`
- Item não lido: fundo `rgba(154,52,18,0.04)`
- Item hover: `--color-surface-1`

### 4.10 Side panel

- Overlay: `rgba(0,0,0,0.18)`, z-index `--z-overlay`
- Drawer: slide-in da direita, `300ms` com `cubic-bezier(0.16, 1, 0.3, 1)`
- Conteúdo: `--color-surface-0`, borda esquerda sutil

### 4.11 Mini-calendar

- Dia selecionado: fundo `--color-accent`, texto `--color-surface-0`
- Hoje: weight `700`
- Hover: `--color-surface-0`

### 4.12 Month calendar

- Célula: min-height `90px` (primeira semana) / `80px` (demais)
- Hover: `--color-surface-0`
- Barra de evento: `6px` altura, hover `scaleY(1.3)` e opacity `0.8`

### 4.13 Toast

- Entrada: slide da direita, `200ms ease-out`
- Saída: fade `300ms`
- Posição: z-index `--z-toast`

### 4.14 FAB

- Sombra: `--shadow-fab`
- Entrada: `scale(0.85) → 1`, `200ms`
- Oculto em desktop; visível em mobile

### 4.15 Skeleton

- `.skeleton-shimmer`: gradiente linear animado `1.6s ease-in-out infinite`
- Light: `#f0ebe2 → #e8e2d9 → #f0ebe2`
- Dark: `#2a2622 → #3d3833 → #2a2622`

### 4.16 Status badges

Use os tokens de status (2.7 e 2.8). Formato padrão:
- Padding: `0.1rem 0.5rem`
- Raio: `--radius-pill`
- Fonte: `--font-size-xs` ou `--font-size-sm`
- Weight: `500` ou `600`

### 4.17 Avatar placeholder

- Tamanho: `32px × 32px` (padrão top-bar), variantes maiores em perfil
- Forma: círculo (`border-radius: 50%`)
- Fundo: `--color-surface-2`, texto `--color-text-2`
- Hover: `--color-surface-3`

---

## 5. Layout e Espaçamento

### 5.1 Escala base (4px)

| Token | Valor | Uso típico |
|-------|-------|------------|
| `--space-0.5` | `0.125rem` (2px) | Micro gaps |
| `--space-1` | `0.25rem` (4px) | Icon spacing, tiny gaps |
| `--space-1.5` | `0.375rem` (6px) | Gaps internos |
| `--space-2` | `0.5rem` (8px) | Small gaps |
| `--space-3` | `0.75rem` (12px) | Gaps padrão |
| `--space-4` | `1rem` (16px) | Card padding pequeno |
| `--space-5` | `1.25rem` (20px) | Card padding médio |
| `--space-6` | `1.5rem` (24px) | Section padding |
| `--space-7` | `1.75rem` (28px) | Padding grande |
| `--space-8` | `2rem` (32px) | Page padding |
| `--space-10` | `2.5rem` (40px) | Section gaps |
| `--space-12` | `3rem` (48px) | Large gaps |
| `--space-16` | `4rem` (64px) | Hero gaps |

### 5.2 Tokens de página

| Token | Valor |
|-------|-------|
| `--space-page-padding-x` | `clamp(1.25rem, 4vw, 2.5rem)` |
| `--space-page-padding-y` | `clamp(1.25rem, 3vw, 2rem)` |
| `--space-section-gap` | `2rem` |
| `--space-card-padding` | `1.5rem` |
| `--space-row-height` | `4rem` (mínimo para touch rows) |

### 5.3 Grids

- **Formulário (`.form-grid`):** `repeat(2, minmax(0, 1fr))`, gap `1rem`. Colapsa para `1fr` abaixo de `767px`.
- **App grid (auth):** `repeat(3, 1fr)`, gap `0.75rem`. Colapsa para `1fr` abaixo de `480px`.

### 5.4 Filosofia

Cards densos por dentro, espaço generoso por fora. Padding interno de cards: `1.5rem` é o padrão. Nunca empilhar blocos sem gap — sempre usar `--space-section-gap` ou maior.

---

## 6. Profundidade e Elevação

### 6.1 Sombras

| Token | Uso recomendado |
|-------|-----------------|
| `--shadow-xs` | Botões sutis, tooltips |
| `--shadow-sm` | Cards padrão, dropdowns leves — **preferencial** |
| `--shadow-md` | Cards hover, menus, painéis — **preferencial** |
| `--shadow-lg` | Modais pequenos, setup cards |
| `--shadow-xl` | Dropdowns grandes, notificações |
| `--shadow-2xl` | Modais grandes, setup inicial, auth cards |

**Sombras de componente:**
- `--shadow-side-panel`: `-4px 0 24px rgba(0,0,0,0.1)` (light) / `rgba(0,0,0,0.4)` (dark)
- `--shadow-fab`: `0 4px 16px` com acento
- `--shadow-dropdown`: `0 4px 12px rgba(0,0,0,0.08)` / `0.35` dark
- `--shadow-card-subtle`: `0 8px 24px` baixa intensidade
- `--shadow-card-elevated`: `0 22px 64px` alta intensidade

**Regra de ouro:** `sm` e `md` cobrem 90% dos casos. `lg+` é exceção.

### 6.2 Raios

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-xs` | `6px` | Mini cal, botões secundários |
| `--radius-sm` | `8px` | Inputs, OTP digits, tags |
| `--radius-md` | `14px` | Botões padrão, nav links, cards |
| `--radius-lg` | `20px` | Dropdowns, side panels |
| `--radius-xl` | `28px` | Auth cards, modais grandes |
| `--radius-pill` | `999px` | Badges, status chips, filtros |

### 6.3 Z-index

| Token | Valor | Uso |
|-------|-------|-----|
| `--z-base` | `1` | Sticky interno, layers de calendário |
| `--z-dropdown` | `100` | Menus, popovers, resultados de busca |
| `--z-sticky` | `200` | Side panels, bottom nav, top bar |
| `--z-overlay` | `300` | Overlays de FAB, overlays especiais |
| `--z-modal` | `400` | Modais, dialogs, sheets |
| `--z-toast` | `500` | Toasts, banners de update |
| `--z-skip-link` | `900` | Skip link (acessibilidade) |
| `--z-max` | `9999` | Emergências apenas — evitar |

**Proibido:** usar valores numéricos crus (ex: `z-index: 50`).

---

## 7. Movimento e Transição

### 7.1 Tokens base

| Token | Valor |
|-------|-------|
| `--duration-100` | `100ms` (hover, cores, bordas) |
| `--duration-200` | `200ms` (entradas, fades, slides) |
| `--duration-300` | `300ms` (drawers, detalhes) |
| `--ease-out` | `ease-out` |
| `--ease-in-out` | `ease-in-out` |
| `--stagger-gap` | `60ms` |

### 7.2 Keyframes principais (definidos em `src/styles/motion.css`)

| Nome | Efeito | Duração típica |
|------|--------|----------------|
| `vaultPageIn` | `opacity: 0 + translateY(8px) → normal` | 150ms |
| `slideUp` | `opacity: 0 + translateY(8px) → normal` | 200ms |
| `slideDown` | `opacity: 0 + translateY(-8px) → normal` | 200ms |
| `scaleIn` | `opacity: 0 + scale(0.95) → normal` | 200ms |
| `fadeIn` | `opacity: 0 → 1` | 200ms |
| `toastSlideIn` | `translateX(100%) → 0` | 200ms |
| `sidePanelSlideIn` | `translateX(100%) → 0` | 300ms |
| `skeleton-shimmer` | gradiente deslizante | 1.6s loop |
| `inputShake` | `translateX(-2px ↔ 2px)` | 200ms |

### 7.3 Classes utilitárias (Server Component safe)

- `.motion-fade-in`
- `.motion-slide-up`
- `.motion-slide-down`
- `.motion-scale-in`
- `.motion-stagger` (usa `calc(var(--stagger-index) * var(--stagger-gap))`)

### 7.4 Regras de movimento

- Animações só para orientar ou responder a interacao — nunca decorativas.
- Todo elemento animado respeita `@media (prefers-reduced-motion: reduce)`: reduzido a `0.01ms` ou `none`.
- Transições de tema (light ↔ dark) suaves: `200ms ease` em todas as propriedades de cor.

---

## 8. Do's e Don'ts

### Do
- Use sempre `var(--token)`. Nunca hex cru em código novo.
- Cubra todos os estados interativos: `hover`, `active`, `disabled`, `focus-visible`.
- Respeite touch target mínimo `44px × 44px`.
- Prefira sombras `--shadow-sm` e `--shadow-md`.
- Use `--color-accent` com contenção — CTAs, estados ativos, focus.
- Escalone tipografia antes de colorir.
- Mantenha respiro entre seções (`--space-section-gap` ou maior).
- Respeite `prefers-reduced-motion`.

### Don't
- **Não** use gradientes decorativos em superfícies funcionais (sidebar, cards, formulários).
- **Não** use sombras exageradas (`lg+`) em cards de listagem ou blocos comuns.
- **Não** crie animações decorativas sem função de orientação ou feedback.
- **Não** use badges, chips coloridos ou indicadores de "novidade" sem função real.
- **Não** construa hierarquia via cor excessiva — use tipografia e espaçamento.
- **Não** exponha `importantObservations` em listagens públicas.
- **Não** use z-index numérico cru.
- **Não** use cores auxiliares (2.9) em componentes novos.

---

## 9. Comportamento Responsivo

### Breakpoints usados

| Breakpoint | Efeito |
|------------|--------|
| `480px` | Auth app grid colapsa para 1 coluna |
| `767px` | Bottom nav aparece; sidebar some; form grid vira 1 coluna; FAB visível |
| `768px` | Top bar search reduz largura máxima |
| `780px` | Auth split layout vira empilhado |

### Princípios
- Mobile-first nos componentes críticos (bottom nav, FAB).
- Sidebar vira bottom nav — navegação principal não desaparece, muda de forma.
- Formulários de 2 colunas viram 1 coluna automaticamente.
- Calendário mensal mantém grade, mas células reduzem altura mínima.

---

## 10. Guia de Prompt para Agentes

Antes de gerar qualquer componente de UI no app interno, confirme:

1. **Cores:** estou usando `var(--token)` do DESIGN.md? Nenhum hex cru?
2. **Tipografia:** a escala de tamanho está na tabela 3.1? O peso condiz com o papel?
3. **Componente base:** já existe um padrão em 4.x que posso estender?
4. **Sombra:** preciso de mais que `--shadow-md`? Se sim, justifique.
5. **Estados:** hover, active, disabled, focus-visible estão cobertos?
6. **Touch:** `min-height: 44px` e `min-width: 44px` em elementos clicáveis?
7. **Reduced motion:** a animação respeita `prefers-reduced-motion`?

### Snippet de referência rápida

```tsx
const cardStyle = {
  background: 'var(--surface-base)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-card-padding)',
} satisfies React.CSSProperties;

const titleStyle = {
  fontSize: 'var(--font-size-h3)',
  fontWeight: 600,
  color: 'var(--color-text-1)',
  lineHeight: 'var(--line-height-tight)',
} satisfies React.CSSProperties;
```

### Paleta quick-reference (para prompts)

- Fundo: `#f7f3ed` (light) / `#161412` (dark)
- Card: `#ffffff` / `#1e1b18`
- Texto principal: `#1c1917` / `#f0ebe2`
- Texto secundário: `#57534e` / `#b8b0a4`
- Acento: `#9a3412` / `#c26a4a`
- Erro: `#dc2626` / `#f87171`
- Sucesso: `#166534` / `#4ade80`
- Borda: `rgba(146,64,14,0.12)` / `rgba(247,243,237,0.08)`

---

*Última revisão: 2026-04-26. Para alterar tokens, edite `src/app/globals.css` e atualize este documento.*
