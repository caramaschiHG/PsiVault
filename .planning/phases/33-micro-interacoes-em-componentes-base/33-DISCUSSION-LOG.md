# Phase 33: Micro-interações em Componentes Base - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 33-Micro-interações em Componentes Base
**Areas discussed:** Card hover scope, Focus ring refinement, Input validation shake, Navigation active transition

---

## Card Hover Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, sombra sutil | Todos os cards ganham hover — não-clicáveis com sombra sutil, clicáveis com elevação | |
| Não, apenas interativos | Apenas cards com onClick/href ganham hover | |
| O executor decide | Executor avalia quais cards devem ter hover | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Manter translateY(-2px) + sombra | Mesmo comportamento atual da classe .card-hover | ✓ |
| Apenas sombra crescendo | Sem movimento vertical, apenas sombra aumenta | |
| O executor decide | Executor escolhe abordagem | |

| Option | Description | Selected |
|--------|-------------|----------|
| Automático quando interativo | Card aplica hover automaticamente quando onClick está presente | ✓ |
| Opt-in manual via prop | Adicionar prop isInteractive/hoverable ao Card | |
| O executor decide | Executor define API do componente | |

**User's choice:** Cards não-clicáveis — executor decide. Cards clicáveis — manter translateY(-2px) + sombra. Aplicação — automática quando interativo.
**Notes:** Usuário confiou no executor para decidir sobre cards estáticos, mas foi explícito sobre manter o comportamento atual para cards interativos.

---

## Focus Ring Refinement

| Option | Description | Selected |
|--------|-------------|----------|
| Migrar tudo para box-shadow | Substituir outline por box-shadow em todos os elementos focáveis | ✓ |
| Manter outline + box-shadow | Outline como fallback + box-shadow visual | |
| O executor decide | Executor avalia melhor abordagem | |

| Option | Description | Selected |
|--------|-------------|----------|
| Transição suave (fade-in) | transition: box-shadow var(--duration-100) | ✓ |
| Instantâneo | Sem transição — aparece imediatamente | |
| O executor decide | Executor escolhe | |

| Option | Description | Selected |
|--------|-------------|----------|
| Estilo uniforme | Mesmo focus ring em todos os elementos | |
| Inputs diferenciados | Inputs mantêm glow suave; botões/links/nav usam ring visível | ✓ |
| O executor decide | Executor define mapeamento | |

| Option | Description | Selected |
|--------|-------------|----------|
| Usar variante clara no escuro | Criar token --color-focus-ring-dark para sidebar | ✓ |
| Manter mesma cor | var(--color-accent) em todos os contextos | |
| O executor decide | Executor avalia contraste | |

| Option | Description | Selected |
|--------|-------------|----------|
| Manter offset de 2px | Double-shadow simulando offset | ✓ |
| Ficar rente à borda | Sem offset | |
| O executor decide | Executor escolhe técnica | |

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas teclado (focus-visible) | Ring aparece só com Tab/Shift+Tab | ✓ |
| Teclado + mouse (focus) | Ring aparece em qualquer interação | |
| O executor decide | Executor define por elemento | |

| Option | Description | Selected |
|--------|-------------|----------|
| Instantâneo no blur | Ring some imediatamente | |
| Fade-out suave | Ring desaparece suavemente | ✓ |
| O executor decide | Executor testa e decide | |

**User's choice:** Migrar para box-shadow, transição suave fade-in, inputs diferenciados, variante clara no escuro, offset 2px, apenas teclado, fade-out suave.
**Notes:** Usuário priorizou elegância visual (box-shadow, fade-in/fade-out) enquanto manteve acessibilidade (focus-visible, offset, variante para contraste).

---

## Input Validation Shake

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, incluir floating labels | Adicionar animação de label flutuante em todos os inputs | ✓ |
| Não, focar apenas no shake | Labels flutuantes fora de escopo | |
| O executor decide | Executor avalia custo/benefício | |

| Option | Description | Selected |
|--------|-------------|----------|
| Classe CSS adicionada por componentes | Componentes adicionam .input-error-shake | ✓ |
| Atributo [aria-invalid='true'] | CSS dispara shake automaticamente | |
| O executor decide | Executor escolhe abordagem | |

| Option | Description | Selected |
|--------|-------------|----------|
| Shake sutil: 2px lateral, 200ms | Movimento mínimo, duração --duration-200 | ✓ |
| Shake moderado: 4px lateral, 300ms | Movimento mais perceptível | |
| O executor decide | Executor testa e ajusta | |

| Option | Description | Selected |
|--------|-------------|----------|
| Shake + border color transition | Feedback duplo: movimento + cor | ✓ |
| Apenas shake | Shake sozinho como reforço visual | |
| O executor decide | Executor decide | |

| Option | Description | Selected |
|--------|-------------|----------|
| Animar no foco E quando tem valor | Label flutua em focus e com value preenchido | ✓ |
| Apenas no foco | Label só flutua quando focado | |
| O executor decide | Executor define comportamento | |

| Option | Description | Selected |
|--------|-------------|----------|
| Uma vez apenas | Shake ocorre uma vez quando erro detectado | ✓ |
| Repetir até correção | Shake continua enquanto erro persistir | |
| O executor decide | Executor define trigger | |

| Option | Description | Selected |
|--------|-------------|----------|
| Todos os inputs focáveis | text, email, password, select, textarea | ✓ |
| Apenas text inputs | Apenas input type text/email/password/number/tel | |
| O executor decide | Executor avalia por tipo | |

**User's choice:** Incluir floating labels (todos os inputs focáveis, flutuam no foco e com valor), shake por classe CSS (2px, 200ms, uma vez, com border color transition).
**Notes:** Usuário optou por incluir floating labels apesar do escopo maior. Shake deve ser sutil e não repetitivo.

---

## Navigation Active Transition

| Option | Description | Selected |
|--------|-------------|----------|
| Transicionar background e color | Item ativo 'aparece' suavemente | ✓ |
| Indicador deslizante | Elemento separado desliza entre itens | |
| Manter estático | Mudança instantânea | |

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas sidebar desktop | Bottom nav mantém instantâneo | ✓ |
| Sidebar e bottom nav | Ambas transicionam | |
| O executor decide | Executor avalia | |

| Option | Description | Selected |
|--------|-------------|----------|
| Incluir na transição | Box-shadow inset transiciona suavemente | ✓ |
| Aparecer instantaneamente | Box-shadow instantâneo, resto transiciona | |
| O executor decide | Executor testa | |

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, scale sutil no click | transform: scale(0.98) no :active | |
| Não, apenas hover + indicador | Sem feedback de press | ✓ |
| O executor decide | Executor avalia | |

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, transição mais lenta (300ms) | --duration-300 para hover em nav | ✓ |
| Não, manter padrão (200ms) | --duration-200 igual aos botões | |
| O executor decide | Executor ajusta | |

| Option | Description | Selected |
|--------|-------------|----------|
| Auditar elemento por elemento | Revisão manual de todos os elementos | ✓ |
| Expandir catch-alls no CSS | Regras CSS genéricas para mais casos | |
| O executor decide | Executor escolhe | |

**User's choice:** Transicionar background/color/box-shadow na sidebar desktop apenas. Sem press feedback. Hover em nav mais lento (300ms). Cursor audit elemento por elemento.
**Notes:** Usuário priorizou calma na navegação (transição lenta, sem press) e consistência visual (transição suave do indicador ativo).

---

## the agent's Discretion

- Cards não-clicáveis: executor decide se e como aplicar hover.
- Detalhes de implementação dos floating labels: executor decide markup exato e classes CSS.
- Técnica exata do double-shadow para offset no focus ring: executor decide.

## Deferred Ideas

None — discussion stayed within phase scope.
