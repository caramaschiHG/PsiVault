# Phase 19: Refatoração UX/UI Finanças - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 19-Refatoração UX/UI Finanças
**Areas discussed:** Estrutura de Visualização, Padrão de Interação, Destaque de Inadimplência, Gestão de Estado (URL)

---

## Estrutura de Visualização

| Option | Description | Selected |
|--------|-------------|----------|
| Lista simples (Extrato) | Como um extrato bancário, fácil scaneabilidade (Recomendado para finanças) | ✓ |
| Tabela Densa | Mais densidade, bom para exportação futura | |
| Cards detalhados | Similar a outros componentes do app, mas menos denso | |

**User's choice:** Lista simples (Extrato)
**Notes:** N/A

---

## Padrão de Interação

| Option | Description | Selected |
|--------|-------------|----------|
| Drawers laterais | Drawers deslizam da direita, ideais para formulários grandes (Recomendado) | ✓ |
| Modais centrais | Ideais para alertas, menos para formulários extensos | |
| Híbrido | Modal para confirmar, Drawer para detalhes completos | |

**User's choice:** Drawers laterais
**Notes:** N/A

---

## Destaque de Inadimplência

| Option | Description | Selected |
|--------|-------------|----------|
| Aba separada | Visão dedicada apenas a quem está devendo (Recomendado) | ✓ |
| Fixos no topo | Os atrasados sempre aparecem no topo até serem resolvidos | |
| Badges na lista | Aparecem na lista normal, apenas com cor diferente | |

**User's choice:** Aba separada
**Notes:** N/A

---

## Gestão de Estado (URL)

| Option | Description | Selected |
|--------|-------------|----------|
| Parâmetros de URL (Recomendado) | Simples via ?drawer=cobranca-123. Fácil e resolve o requisito futuro de deep link. | ✓ |
| Rotas interceptadas | Mais complexo, porém integração nativa do router do Next.js. | |
| Estado local do React | Mais fácil inicial, mas perde o estado ao dar refresh ou voltar. | |

**User's choice:** Parâmetros de URL (Recomendado)
**Notes:** N/A

## the agent's Discretion

- Componentes e estilo exatos do Drawer, além dos ícones e textos para a Aba de Inadimplência.
- O nome exato das tabs/abas no cabeçalho e componentes internos.

## Deferred Ideas

None