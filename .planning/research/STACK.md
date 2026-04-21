# Stack Research

**Domain:** Financeiro e Emissão de Documentos Clínicos (SaaS Psicanálise)
**Researched:** 2026-04-21
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js Server Actions | 15.2+ | Mutations para CRUD de Despesas | Elimina necessidade de tRPC/React Query, mantendo bundle super lean. |
| Native HTML `<dialog>` | N/A | Modais e Drawers (Acessibilidade) | Zero JS de dependência externa, suporte nativo WCAG, alinhado com meta de "bundle lean". |
| @react-pdf/renderer | ^4.3.2 | Geração de Recibos em PDF | Declarativo (usa componentes React), já presente no `package.json`, suporte a React 19 e uso SSR/Client. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | ^2.12.0 ou ^3.0.0 | Gráficos de Fluxo de Caixa / Inadimplência | **Apenas se** gráficos complexos forem exigidos. Possui suporte a React 19, mas impacta o bundle. |
| date-fns | ^4.1.0 | Formatação e manipulação de datas | Já presente no projeto, ideal para os filtros do DRE simples e cálculos de meses/anos para relatórios. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | Testes de domínio | Garantir que cálculos financeiros (DRE, total de despesas) funcionem perfeitamente. |

## Installation

```bash
# Caso os relatórios consolidem necessidade gráfica visual complexa
npm install recharts

# Nota: @react-pdf/renderer já está no package.json
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Native `<dialog>` / CSS Tokens | Radix UI (Primitives) | Se a complexidade dos focos de acessibilidade em dropdowns/modais aninhados exceder as capacidades do elemento nativo. |
| CSS Bars / Tabelas Nativas | Recharts | Se relatórios e DRE simples precisarem apenas de visualizações fáceis de ler. Preferível tabelas para manter "bundle impact mínimo" (102 kB atual). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Tailwind CSS / Styled-components | Quebra de restrição: O projeto determina o uso exclusivo dos "CSS tokens" criados na v1.0 e proíbe Tailwind e inline styles. | CSS Modules ou tokens definidos em `globals.css` via classes próprias. |
| jsPDF / html2canvas | Gera arquivos pesados, não-textuais e de difícil manutenção com Next.js SSR. Não acessível para leitores de PDF. | `@react-pdf/renderer` (já pré-instalado). |
| Chart.js / Highcharts | Tamanho de bundle massivo, não idiossincráticos com React Server Components/App Router puro. | Tabelas HTML simples ou, em último caso, `recharts`. |
| React Hook Form / Zod | Dependências pesadas se o app estiver usando apenas forms simples. | Next.js 15 Server Actions com `useActionState` e HTML5 form validation. |

## Stack Patterns by Variant

**If [Precisar de gráficos interativos no Dashboard/DRE]:**
- Use `recharts` com lazy loading (`next/dynamic`).
- Because Isso protege o initial bundle (102 kB JS) de carregar uma biblioteca pesada nas rotas principais não-financeiras.

**If [Refatorar Modais e Filtros de Inadimplência]:**
- Use o sistema de Design Tokens (v1.0) e componha a partir dos componentes existentes (Card, Section, List).
- Because O projeto exige consistência estrita de UI ("premium sem exibicionismo", "calma, sigilo") e proibição de novos inline styles.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@react-pdf/renderer@4.3.2` | `react@19.0.0` | Suporte validado para uso com App Router (verificar warnings de `useSyncExternalStore` que podem ser ignorados com Next.js 15). |
| `recharts@3.x` | `react@19.0.0` | Totalmente compatível, possui deduplicação de dependências de react. |

## Sources

- Context7 `/diegomura/react-pdf` — Compatibilidade React 19 SSR confirmada.
- Context7 `/recharts/recharts` — Suporte documentado React 16 ao 19.
- `.planning/PROJECT.md` — Restrições rígidas (CSS tokens, zero Tailwind, bundle lean 102 kB, e a biblioteca `react-pdf` já em `package.json`).

---
*Stack research for: Módulo de Despesas, Emissão de Recibos PDF, Relatórios Consolidados, Refatoração UX/UI Finanças*
*Researched: 2026-04-21*
