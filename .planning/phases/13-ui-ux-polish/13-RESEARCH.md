# Phase 13: UI/UX Polish - Research

**Researched:** 2026-03-18
**Domain:** CSS design system, Next.js App Router loading/error conventions, responsive layout, WCAG contrast, empty/loading/error states
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Tipografia e hierarquia**
- IBM Plex Serif para títulos de página (h1, nome do paciente, headings principais) — IBM Plex Sans para todo o resto
- Escala de títulos de página: `1.5rem` (24px)
- Metadados, datas, status, texto de apoio: `0.8125rem` (13px)
- Títulos de seção interna (ex: "HOJE", "LEMBRETES"): `font-weight: 600` + `text-transform: uppercase` + `letter-spacing`
- Body text padrão: `0.9375rem` (15px)

**Responsivo e mobile**
- Breakpoints: `sm: 640px` / `md: 768px` / `lg: 1024px`
- Em mobile (< 768px): sidebar some, aparece bottom navigation bar com ícones das 5 seções principais
- Listas densas em mobile (pacientes, agenda): transformar em cards empilhados verticais com as informações mais importantes
- Header de página em mobile: título da página + FAB (floating action button) no canto inferior direito para ação primária
- Formulários em mobile: 1 coluna, campos full-width, scroll único — sem wizard ou seções colapsáveis

**Empty states**
- Visual: ícone SVG + título + descrição + botão de ação
- Tom: humanizado e gentil — "Sua semana está livre", "Nenhum paciente ainda — comece adicionando o primeiro", "Tudo em dia!"
- Ações no empty state devem levar diretamente ao fluxo de criação relevante

**Loading e error states**
- Loading: `loading.tsx` por rota com skeleton adequado ao conteúdo + estado pendente em botões de ação (disabled + spinner)
- Errors: `error.tsx` por rota com mensagem amigável ("Algo deu errado") + botão "Tentar novamente" — isola o erro na rota sem quebrar o app todo

**Identidade visual das páginas**
- Layout: template base (padding padrão + header com título + ação primária) + adaptações por página
- Densidade: compacta com respiro — rows de 56-64px, padding generoso, espaço entre seções de 1.5-2rem (referência: Linear, Notion)
- Listas de pacientes e cobranças: lista em linhas com hover (table-like), não cards em grid

**Sidebar (redesenho)**
- Direção: mais escura e profissional — sidebar em tom warm dark com texto claro, contraste forte com área de conteúdo clara
- Adicionar grupos de navegação com separadores visuais
- Rodapé da sidebar: avatar (iniciais) + nome do profissional + link de sair

### Claude's Discretion

Nenhuma área de discretion explícita — todas as decisões de design foram travadas.

### Deferred Ideas (OUT OF SCOPE)

Nenhuma ideia de escopo expandido surgiu — discussão permaneceu dentro dos limites da fase.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UIUX-01 | Establish a consistent design system — typography scale, color palette, spacing tokens, and border-radius applied throughout | Tokens já existem em globals.css; pesquisa mapeia o que falta (tipografia codificada como CSS vars, escala de espaçamento) |
| UIUX-02 | Apply professional visual design to all primary views (inicio, agenda, patients list, patient profile, financeiro) | Análise das páginas existentes revela gaps: título 2rem vs 1.5rem decidido, sidebar clara vs dark decidida |
| UIUX-03 | Ensure all pages are fully responsive across mobile, tablet, and desktop viewports | Zero código responsivo hoje — sidebar fixa 240px sem media queries; nenhum breakpoint no codebase |
| UIUX-04 | Achieve WCAG 2.1 AA color contrast ratios on all interactive elements and body text | Tokens atuais precisam de verificação; sidebar dark muda os ratios; pesquisa documenta os valores exatos |
| UIUX-05 | Add proper empty states, loading states, and error states to all data-dependent pages | Zero loading.tsx / error.tsx no codebase hoje; empty states parciais e inconsistentes |
| UIUX-06 | Polish navigation — clear active states, breadcrumbs where helpful, smooth transitions | nav-link.active já existe; sidebar footer com avatar é novo; bottom nav mobile é novo componente |

</phase_requirements>

---

## Summary

A fase 13 é de polish visual puro — sem novas features de domínio. A base técnica é boa: tokens CSS completos em `globals.css`, fontes IBM Plex Sans/Serif carregadas, classes utilitárias (`.btn-*`, `.nav-link`, `.input-field`) implementadas. O que falta é (1) aplicar os tokens consistentemente nas páginas com os valores corretos da escala tipográfica decidida, (2) redesenhar a sidebar para o esquema dark profissional, (3) adicionar responsividade completa com bottom nav mobile, e (4) criar `loading.tsx` e `error.tsx` em todas as rotas data-dependent.

A stack é exclusivamente Next.js App Router + inline styles com `satisfies React.CSSProperties` + CSS vars. Não há Tailwind, não há component library, não há framer-motion. Tudo é feito com CSS nativo via custom properties e media queries via `@media` em `globals.css` ou `useMediaQuery` hook client-side.

**Primary recommendation:** Organizar a fase em 4 ondas independentes: (1) tokens + tipografia, (2) sidebar redesign + bottom nav, (3) loading/error states por rota, (4) polish de páginas primárias + empty states + responsividade de conteúdo.

---

## Standard Stack

### Core (já presente no projeto)

| Tecnologia | Versão | Propósito | Status |
|-----------|--------|-----------|--------|
| Next.js App Router | 15 | `loading.tsx`, `error.tsx`, layout nesting | Instalado |
| IBM Plex Sans + Serif | Google Fonts | Tipografia do sistema | Importado em globals.css |
| CSS Custom Properties | nativo | Design tokens (color, radius, shadow) | Existente em globals.css |
| `satisfies React.CSSProperties` | TypeScript | Inline styles tipados | Padrão do projeto |
| `usePathname` | next/navigation | Active state na sidebar | Já em VaultSidebarNav |

### O que não existe e precisa ser criado

| O que | Arquivo/Componente | Propósito |
|-------|-------------------|-----------|
| Bottom nav mobile | `src/app/(vault)/components/bottom-nav.tsx` | Navegação mobile < 768px |
| EmptyState component | `src/app/(vault)/components/empty-state.tsx` | Reutilizável em todas as páginas |
| loading.tsx por rota | `(vault)/inicio/loading.tsx`, etc. | Skeleton por rota |
| error.tsx por rota | `(vault)/inicio/error.tsx`, etc. | Error boundary por rota |
| CSS vars tipográficas | `globals.css` | `--font-size-title`, `--font-size-body`, etc. |
| CSS media queries responsivas | `globals.css` | Ocultar sidebar, mostrar bottom nav |

### Alternativas não consideradas (por decisão do usuário)

Tailwind, framer-motion, Radix UI, lucide-react — fora de escopo. O projeto mantém inline styles + CSS vars como padrão imutável.

---

## Architecture Patterns

### Estrutura de arquivos desta fase

```
src/app/(vault)/
├── components/
│   ├── vault-sidebar-nav.tsx    # MODIFICAR — esquema dark + avatar footer
│   ├── search-bar.tsx           # Mover para dentro do conteúdo (sidebar footer)
│   ├── bottom-nav.tsx           # CRIAR — client island, usePathname
│   └── empty-state.tsx          # CRIAR — componente utilitário compartilhado
├── layout.tsx                   # MODIFICAR — sidebar dark, hide em mobile
├── inicio/
│   ├── loading.tsx              # CRIAR
│   └── error.tsx                # CRIAR
├── agenda/
│   ├── loading.tsx              # CRIAR
│   └── error.tsx                # CRIAR
├── patients/
│   ├── loading.tsx              # CRIAR
│   └── error.tsx                # CRIAR
├── patients/[patientId]/
│   ├── loading.tsx              # CRIAR
│   └── error.tsx                # CRIAR
└── financeiro/
    ├── loading.tsx              # CRIAR
    └── error.tsx                # CRIAR
src/app/globals.css              # MODIFICAR — escala tipográfica, media queries responsivas
```

### Pattern 1: loading.tsx no App Router

**O que:** Arquivo especial do Next.js App Router que envolve automaticamente o `page.tsx` em um `<Suspense>`. Renderiza imediatamente enquanto o server component carrega.

**Quando usar:** Em todas as rotas que fazem `await` em repositórios (todas as páginas vault).

**Contrato:**
```typescript
// Source: Next.js App Router docs — loading.tsx convention
// src/app/(vault)/inicio/loading.tsx
export default function InicioLoading() {
  return (
    <main style={shellStyle}>
      {/* Skeleton que espelha o layout real */}
      <div style={skeletonTitleStyle} />
      <div style={skeletonSectionStyle} />
      <div style={skeletonSectionStyle} />
    </main>
  );
}
```

**Regra:** O skeleton deve ter a mesma estrutura de layout (padding, gap, maxWidth) que o `page.tsx` correspondente para evitar layout shift.

### Pattern 2: error.tsx no App Router

**O que:** Arquivo especial `"use client"` que captura erros thrown por server components dentro do segmento. Expõe `error` e `reset` como props.

**Contrato:**
```typescript
// Source: Next.js App Router docs — error.tsx convention
"use client";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={shellStyle}>
      <p>Algo deu errado.</p>
      <button onClick={reset} className="btn-secondary">
        Tentar novamente
      </button>
    </main>
  );
}
```

**Regra:** DEVE ser `"use client"` — requisito do Next.js. Não acessa repositórios. Usa apenas `reset()` para retry.

### Pattern 3: EmptyState como componente utilitário

**O que:** Componente server puro (sem estado) que aceita `icon`, `title`, `description`, `actionLabel`, `actionHref`.

**Quando usar:** Injetado diretamente no `page.tsx` quando `data.length === 0`.

```typescript
// src/app/(vault)/components/empty-state.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div style={containerStyle}>
      <div style={iconStyle}>{icon}</div>
      <p style={titleStyle}>{title}</p>
      {description && <p style={descStyle}>{description}</p>}
      {actionLabel && actionHref && (
        <a href={actionHref} className="btn-primary" style={actionStyle}>
          {actionLabel}
        </a>
      )}
    </div>
  );
}
```

### Pattern 4: Responsividade via media query em globals.css

**O que:** Ocultar sidebar e mostrar bottom nav usando `@media (max-width: 767px)` em globals.css. A sidebar usa `display: flex` no layout — em mobile passa a `display: none`. O bottom nav usa `display: none` em desktop e `display: flex` em mobile.

**Por que globals.css e não inline styles:** Inline styles não suportam media queries. Para breakpoints, DEVE usar classes CSS em globals.css ou um hook `useMediaQuery` client-side. Preferir globals.css para performance (sem JS).

```css
/* globals.css — adições para responsividade */
.vault-sidebar {
  /* estilos base são mantidos no layout.tsx via inline style */
}

@media (max-width: 767px) {
  .vault-sidebar {
    display: none;
  }
  .vault-bottom-nav {
    display: flex;
  }
  .vault-content {
    padding-bottom: 5rem; /* espaço para bottom nav */
  }
}

@media (min-width: 768px) {
  .vault-bottom-nav {
    display: none;
  }
}
```

**Alternativa para FAB mobile:** O FAB (floating action button) também usa `position: fixed; bottom: 5rem; right: 1.5rem` e é ocultado em desktop via classe CSS.

### Pattern 5: Sidebar dark scheme

**O que:** A sidebar atual usa `--color-sidebar-bg: #f0ebe2` (tom claro). A decisão é migrar para tom warm dark. O `--color-accent` atual é `#9a3412` (vermelho terracota).

**Nova cor proposta para sidebar:** Derivada do acento — `#2d1810` (marrom escuro quente) ou similar. Texto em branco/creme. Nav links com estado active em overlay semitransparente claro.

**Impacto em contraste WCAG:** Texto branco (`#ffffff`) sobre `#2d1810` — ratio ~14:1 (AAA). Texto creme (`#f5e6d3`) sobre dark — ratio ~9:1 (AA+). Ambos passam.

### Anti-Patterns a evitar

- **Hardcodar `display: none` em inline style para responsividade:** Inline styles não respondem a breakpoints. Usar classes CSS.
- **Criar `error.tsx` como server component:** O Next.js exige `"use client"` no error boundary.
- **Skeleton com dimensões fixas diferentes do layout real:** Causa layout shift visível quando o conteúdo carrega.
- **Título de página com `2rem`:** Decisão travada é `1.5rem`. As páginas atuais usam `2rem` — isso DEVE ser corrigido.
- **Usar `<Link>` do next/link no bottom nav mobile:** Funciona, mas `usePathname` + `href` nativo é mais simples para o active state já estabelecido.

---

## Don't Hand-Roll

| Problema | Não construir | Usar | Por que |
|----------|--------------|------|---------|
| Loading state por rota | Spinner global customizado | `loading.tsx` nativo Next.js | Integrado ao Suspense, sem flash, zero JS client |
| Error boundary por rota | Try/catch em server component | `error.tsx` nativo Next.js | Isola erros por segmento, `reset()` sem reload de página |
| Detectar rota ativa | Comparação manual de pathname | `usePathname()` + `isActive()` já implementado | Padrão já existe em `VaultSidebarNav` |
| Skeleton shapes | Divs animadas manuais | CSS `@keyframes pulse` em globals.css | Simples, sem dependências |

---

## Common Pitfalls

### Pitfall 1: Título de página em 2rem em vez de 1.5rem

**O que vai errado:** Todas as páginas atuais (`inicio`, `agenda`, `patients`, `financeiro`) usam `fontSize: "2rem"` no `titleStyle`. A decisão travada é `1.5rem` (24px).

**Por que acontece:** O valor foi hardcodado antes da decisão de escala tipográfica ser formalizada.

**Como evitar:** Atualizar todos os `titleStyle` nas páginas para `fontSize: "1.5rem"`. Adicionar token `--font-size-page-title: 1.5rem` em globals.css e referenciar via `var()`.

**Warning signs:** Qualquer `fontSize: "2rem"` em page-level styles.

### Pitfall 2: error.tsx sem "use client"

**O que vai errado:** Next.js lança erro em build time se `error.tsx` não tiver `"use client"`.

**Por que acontece:** É contra-intuitivo — a maioria dos arquivos vault são server components.

**Como evitar:** Template de error.tsx SEMPRE começa com `"use client"` na linha 1.

### Pitfall 3: Skeleton sem padding/maxWidth do layout real

**O que vai errado:** Quando o conteúdo carrega, a página "pula" porque o skeleton tinha dimensões diferentes.

**Por que acontece:** Skeleton construído sem olhar o shellStyle da página.

**Como evitar:** Cada `loading.tsx` DEVE importar (ou replicar) o mesmo `shellStyle` do `page.tsx` correspondente.

### Pitfall 4: Bottom nav sem `padding-bottom` no conteúdo

**O que vai errado:** Em mobile, o conteúdo da página fica escondido atrás do bottom nav fixo.

**Por que acontece:** `position: fixed` do nav sobrepõe o scroll content.

**Como evitar:** Adicionar classe `vault-content` com `padding-bottom: 5rem` no mobile via media query em globals.css.

### Pitfall 5: Sidebar dark sem atualizar tokens de nav-link

**O que vai errado:** `.nav-link` e `.nav-link.active` em globals.css foram desenhados para fundo claro. No dark sidebar, `color: var(--color-text-2)` (`#57534e`) tem contraste insuficiente sobre dark.

**Por que acontece:** Os tokens de `.nav-link` são globais e não conhecem o contexto dark da sidebar.

**Como evitar:** Adicionar classe `.vault-sidebar` ao `<aside>` e usar seletor `.vault-sidebar .nav-link` em globals.css com cores sobrescritas para o contexto dark.

### Pitfall 6: WCAG — contraste de texto de apoio no dark sidebar

**O que vai errado:** `--color-text-3` (`#78716c`) sobre dark tem ratio ~3:1 — falha AA para texto normal.

**Como evitar:** Em contexto dark sidebar, usar `rgba(255,255,255,0.6)` (~5:1) para texto de apoio, `rgba(255,255,255,0.9)` para texto principal.

---

## Code Examples

Verified patterns from project codebase + Next.js conventions:

### Skeleton básico alinhado ao layout

```typescript
// src/app/(vault)/inicio/loading.tsx
const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const skeletonBlockStyle = {
  height: "180px",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  animation: "skeleton-pulse 1.5s ease-in-out infinite",
} satisfies React.CSSProperties;

export default function InicioLoading() {
  return (
    <main style={shellStyle}>
      <div style={{ height: "3rem" }} /> {/* heading placeholder */}
      <div style={skeletonBlockStyle} />
      <div style={skeletonBlockStyle} />
      <div style={skeletonBlockStyle} />
    </main>
  );
}
```

### Animação skeleton em globals.css

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### error.tsx template

```typescript
"use client";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={shellStyle}>
      <div style={containerStyle}>
        <p style={titleStyle}>Algo deu errado</p>
        <p style={descStyle}>
          Não foi possível carregar esta página. Tente novamente ou volte mais tarde.
        </p>
        <button onClick={reset} className="btn-secondary">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
```

### Bottom nav mobile (client island)

```typescript
"use client";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/inicio", label: "Início", icon: /* svg */ null },
  { href: "/agenda", label: "Agenda", icon: /* svg */ null },
  { href: "/patients", label: "Pacientes", icon: /* svg */ null },
  { href: "/financeiro", label: "Financeiro", icon: /* svg */ null },
  { href: "/settings/profile", label: "Config", icon: /* svg */ null },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="vault-bottom-nav" aria-label="Navegação mobile">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <a
            key={item.href}
            href={item.href}
            className={`bottom-nav-item${active ? " active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
```

### Tokens tipográficos a adicionar em globals.css

```css
:root {
  /* Tipografia — escala decidida na fase 13 */
  --font-serif: "IBM Plex Serif", Georgia, serif;
  --font-sans:  "IBM Plex Sans", "Segoe UI", sans-serif;

  --font-size-page-title:    1.5rem;    /* 24px — h1 de página */
  --font-size-section-title: 1rem;      /* 16px — h2 de seção */
  --font-size-body:          0.9375rem; /* 15px — texto corrido */
  --font-size-meta:          0.8125rem; /* 13px — metadados, datas, status */
  --font-size-label:         0.75rem;   /* 12px — eyebrow uppercase */

  /* Espaçamento */
  --space-page-padding: 2rem 2.5rem;
  --space-section-gap:  1.5rem;
  --space-row-height:   3.5rem; /* 56px — altura mínima de row */
}
```

---

## State of the Art

| Abordagem atual | Abordagem fase 13 | Impacto |
|----------------|-------------------|---------|
| Sidebar clara `#f0ebe2` | Sidebar warm dark `~#2d1810` | Contraste forte sidebar/conteúdo, aspecto profissional |
| Títulos de página `2rem` | Títulos `1.5rem` via token | Hierarquia correta, alinhada à decisão |
| Nenhum loading/error state | `loading.tsx` + `error.tsx` por rota | Experiência de carregamento profissional |
| Empty states ad-hoc (texto simples) | Componente `EmptyState` reutilizável | Consistência visual e de tom |
| Sidebar fixa, sem responsividade | Sidebar oculta + bottom nav mobile | Utilizável em 375px–1440px |
| Estilos responsivos: inexistentes | Media queries em globals.css | Breakpoints sm/md/lg aplicados |

---

## Open Questions

1. **Sessão real para o avatar do sidebar footer**
   - O que sabemos: A fase 13 decide que o footer da sidebar exibe iniciais + nome do profissional
   - O que está incerto: A fase 12 implementou Supabase Auth, mas o `WORKSPACE_ID = "ws_1"` ainda é stub em todas as páginas vault. O nome real do usuário requer `supabase.auth.getUser()` no layout server component.
   - Recomendação: Para a fase 13, o avatar pode exibir iniciais hardcodadas ou lidas do profile snapshot existente (`getPracticeProfileSnapshot`). A integração real com sessão é responsabilidade da fase 14/deployment.

2. **FAB mobile — posicionamento sobre bottom nav**
   - O que sabemos: FAB usa `position: fixed; bottom: 5rem; right: 1.5rem` para ficar acima do bottom nav (altura ~4rem)
   - O que está incerto: Cada página tem uma ação primária diferente — FAB varia por rota
   - Recomendação: FAB é renderizado dentro de cada `page.tsx` com `position: fixed` e `display: none` em desktop via classe CSS. Não é um slot do layout.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (node env, globals: true) |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UIUX-01 | Tokens CSS aplicados consistentemente | manual | inspeção visual em browser | N/A |
| UIUX-02 | Visual profissional em views primárias | manual | inspeção visual em browser | N/A |
| UIUX-03 | Responsividade 375px–1440px | manual | DevTools viewport resize | N/A |
| UIUX-04 | WCAG 2.1 AA contraste | manual | browser accessibility checker | N/A |
| UIUX-05 | empty/loading/error states existem por rota | smoke | `pnpm build` valida existência de arquivos | ❌ Wave 0 |
| UIUX-06 | Active states e transições de navegação | manual | inspeção visual em browser | N/A |

**Nota sobre testes nesta fase:** UIUX-01 a 04 e 06 são requisitos visuais — não há forma de automatizá-los em unit tests de Node.js. O critério de verificação é build verde + inspeção visual. UIUX-05 é verificável via `pnpm build` (Next.js valida a estrutura de loading/error).

### Sampling Rate

- **Por task commit:** `pnpm build` (valida TypeScript + Next.js file conventions)
- **Por wave merge:** `pnpm test` (suite completa de domain tests)
- **Phase gate:** Build verde + suite verde antes de `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/app/(vault)/inicio/loading.tsx` — skeleton para UIUX-05
- [ ] `src/app/(vault)/inicio/error.tsx` — error boundary para UIUX-05
- [ ] `src/app/(vault)/agenda/loading.tsx` — skeleton para UIUX-05
- [ ] `src/app/(vault)/agenda/error.tsx` — error boundary para UIUX-05
- [ ] `src/app/(vault)/patients/loading.tsx` — skeleton para UIUX-05
- [ ] `src/app/(vault)/patients/error.tsx` — error boundary para UIUX-05
- [ ] `src/app/(vault)/patients/[patientId]/loading.tsx` — skeleton para UIUX-05
- [ ] `src/app/(vault)/patients/[patientId]/error.tsx` — error boundary para UIUX-05
- [ ] `src/app/(vault)/financeiro/loading.tsx` — skeleton para UIUX-05
- [ ] `src/app/(vault)/financeiro/error.tsx` — error boundary para UIUX-05

---

## Sources

### Primary (HIGH confidence)

- Código-fonte do projeto — `src/app/globals.css`, `layout.tsx`, `vault-sidebar-nav.tsx`, todas as páginas vault inspecionadas diretamente
- Next.js App Router file conventions — `loading.tsx` e `error.tsx` são convenções estáveis do framework desde Next.js 13

### Secondary (MEDIUM confidence)

- WCAG 2.1 AA contrast ratios: 4.5:1 para texto normal, 3:1 para texto grande/UI — padrão W3C estabelecido

### Tertiary (LOW confidence)

- Nenhuma fonte de baixa confiança usada nesta pesquisa

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — tudo verificado diretamente no código-fonte
- Architecture: HIGH — padrões Next.js são estáveis e verificados; padrões do projeto extraídos do codebase
- Pitfalls: HIGH — derivados diretamente da análise do código existente (valores hardcodados, ausência de media queries, ausência de loading/error files)

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stack estável, Next.js 15 sem breaking changes esperados em 30 dias)
